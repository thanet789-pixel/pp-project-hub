import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup LINE access token
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

// Create a Supabase Admin Client using service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

function getEventTypeLabel(type: string) {
  switch (type) {
    case 'customer': return 'นัดลูกค้า';
    case 'install': return 'ติดตั้งหน้างาน';
    case 'delivery': return 'ส่งของ';
    case 'manufacture': return 'ผลิต';
    case 'inspection': return 'ตรวจงาน';
    default: return 'นัดหมายอื่นๆ';
  }
}

function formatThaiDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

async function sendLinePushMessage(to: string, text: string) {
  if (!channelAccessToken) {
    console.warn('[LINE API] LINE_CHANNEL_ACCESS_TOKEN is missing. Skipping push message.');
    return false;
  }

  const url = 'https://api.line.me/v2/bot/message/push';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      to,
      messages: [
        {
          type: 'text',
          text
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[LINE API] Push message failed: ${response.status} - ${errText}`);
    return false;
  }

  console.log(`[LINE API] Successfully sent push notification to LINE group: ${to}`);
  return true;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Simple security check: Verify CRON_SECRET if defined
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Get today's date in Bangkok time (UTC+7)
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    console.log(`[Cron Job] Checking calendar appointments for today: ${todayStr}`);

    // 3. Query appointments for today
    const { data: appointments, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        title,
        event_type,
        appointment_time,
        details,
        project_id,
        projects (
          name,
          line_group_id
        )
      `)
      .eq('appointment_date', todayStr);

    if (apptError) {
      throw apptError;
    }

    if (!appointments || appointments.length === 0) {
      console.log('[Cron Job] No appointments found for today.');
      return NextResponse.json({ status: 'ok', message: 'No appointments found for today.' });
    }

    // 4. Group appointments by LINE Group ID
    const groups: Record<string, { projectName: string; items: any[] }> = {};
    let notificationCount = 0;

    for (const appt of appointments) {
      // TypeScript typecasting helper
      const project: any = appt.projects;
      if (!project || !project.line_group_id) {
        console.log(`[Cron Job] Appointment "${appt.title}" has no linked project or LINE Group ID. Skipping.`);
        continue;
      }
      
      const groupId = project.line_group_id;
      if (!groups[groupId]) {
        groups[groupId] = { projectName: project.name, items: [] };
      }
      groups[groupId].items.push(appt);
    }

    // 5. Send LINE message for each group
    for (const [groupId, groupData] of Object.entries(groups)) {
      const itemsList = groupData.items.map((item, idx) => {
        const typeLabel = getEventTypeLabel(item.event_type);
        return `${idx + 1}. [${typeLabel}] ${item.title}\n⏱️ เวลา: ${item.appointment_time} น.\n📍 สถานที่: ${item.details || '-'}`;
      }).join('\n\n');

      const msgText = `🔔 แจ้งเตือนนัดหมายวันนี้ (${formatThaiDate(todayStr)})\n\n📌 โครงการ: "${groupData.projectName}"\n\n${itemsList}`;

      const sent = await sendLinePushMessage(groupId, msgText);
      if (sent) {
        notificationCount += groupData.items.length;
      }
    }

    return NextResponse.json({
      status: 'success',
      appointmentsChecked: appointments.length,
      notificationsSent: notificationCount
    });

  } catch (error: any) {
    console.error('[Cron Job Error] Failed to execute notify-appointments:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
