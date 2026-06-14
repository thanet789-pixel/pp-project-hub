import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Setup LINE config from env variables
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

// Create a Supabase Admin Client using the service role key if available, otherwise fallback to the anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Verify LINE Signature to ensure security
function verifySignature(body: string, signature: string): boolean {
  if (!channelSecret) return true; // Skip verification if secret is not set yet for easy staging config
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    // Verify origin
    if (!verifySignature(bodyText, signature)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const events = payload.events || [];

    // LINE Webhook verification test ping
    if (events.length === 0) {
      return NextResponse.json({ status: 'ok', message: 'Verification successful' });
    }

    // Check if it is a dummy verification event from LINE Developers Console
    const isVerifyRequest = events.some((event: any) => 
      event.replyToken === '00000000000000000000000000000000' || 
      event.replyToken === 'ffffffffffffffffffffffffffffffff' ||
      event.source?.userId === 'U00000000000000000000000000000000'
    );

    if (isVerifyRequest) {
      console.log('[LINE Webhook] Verification test request detected. Returning 200 OK immediately.');
      return NextResponse.json({ status: 'ok', message: 'Verification successful' });
    }

    for (const event of events) {
      if (event.type === 'message') {
        const { replyToken, message, source } = event;
        const messageType = message.type;
        const senderId = source.userId;

        // Determine if message is inside group or personal chat
        const groupId = source.groupId || source.roomId || 'personal_chat';

        if (messageType === 'text') {
          const text = message.text.trim();
          console.log(`[LINE Webhook] Text received from ${groupId}: "${text}"`);
          
          // Reply confirmation to LINE using fetch to LINE API
          if (replyToken) {
            const lowerText = text.toLowerCase();
            if (lowerText === '#id' || lowerText === '@check' || lowerText === 'id' || lowerText === 'check') {
              const replyMsg = `PP Project Hub 🔑 ID Info:\n\n• Type: ${source.type}\n• ID: ${groupId}\n\nคัดลอกรหัส ID ด้านบนไปกรอกในช่องตั้งค่า LINE Group ID ของโปรเจกต์บนเว็บเบราว์เซอร์ได้เลยครับ`;
              await sendLineReply(replyToken, replyMsg);
            } else {
              await sendLineReply(replyToken, `PP Project Hub: ได้รับข้อความรายงานความคืบหน้าเรียบร้อยแล้ว (${text.substring(0, 20)}...)`);
            }
          }
        } 
        
        else if (messageType === 'image') {
          const messageId = message.id;
          console.log(`[LINE Webhook] Image received with ID: ${messageId}`);
 
          // 1. Download image from LINE Content Server
          const imageBuffer = await downloadLineContent(messageId);
 
          // Find project details BEFORE uploading to storage
          let projectId = null;
          let projectFolderName = 'unlinked_photos';
          
          try {
            const { data: matchedProjects } = await supabaseAdmin
              .from('projects')
              .select('id, name')
              .eq('line_group_id', groupId)
              .limit(1);
 
            if (matchedProjects && matchedProjects.length > 0) {
              projectId = matchedProjects[0].id;
              // Clean name to be safe for folder paths
              projectFolderName = matchedProjects[0].name.trim().replace(/\s+/g, '_');
              console.log(`[LINE Webhook] Matched project: ${matchedProjects[0].name} (ID: ${projectId})`);
            } else {
              // Fallback: Pick the first available project
              const { data: fallbackProjects } = await supabaseAdmin
                .from('projects')
                .select('id, name')
                .limit(1);
 
              if (fallbackProjects && fallbackProjects.length > 0) {
                projectId = fallbackProjects[0].id;
                projectFolderName = fallbackProjects[0].name.trim().replace(/\s+/g, '_') + '_fallback';
                console.log(`[LINE Webhook] No match found. Falling back to project: ${fallbackProjects[0].name}`);
              }
            }
          } catch (dbErr) {
            console.error('[LINE Webhook] Error querying project for storage naming:', dbErr);
          }
 
          // 2. Upload to Supabase Storage in the custom project folder
          let photoUrl = '';
          try {
            // Path: projects/[project-name]/line_[messageId].jpg
            photoUrl = await uploadToSupabaseStorage(imageBuffer, `line_${messageId}.jpg`, `projects/${projectFolderName}`);
            console.log(`[Supabase Storage] Uploaded photo successfully: ${photoUrl}`);
            
            // 3. Save metadata to Database
            if (projectId) {
              await savePhotoToDatabaseWithId(photoUrl, projectId, groupId);
            }
          } catch (err) {
            console.error('Error uploading to Supabase Storage:', err);
          }
 
          // 4. Reply confirmation to the installer group chat
          if (replyToken) {
            const replyMsg = photoUrl 
              ? `PP Project Hub: 📸 ได้รับภาพถ่ายหน้างานแล้ว!\n\nจัดเก็บในระบบ Supabase Storage เรียบร้อย\n📂 ลิงก์รูปภาพ: ${photoUrl}`
              : `PP Project Hub: 📸 ได้รับภาพถ่ายหน้างานแล้ว! แต่เกิดข้อผิดพลาดในการจัดเก็บคลาวด์`;
            await sendLineReply(replyToken, replyMsg);
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Error in LINE Webhook:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}

// Fetch LINE binary content API
async function downloadLineContent(messageId: string): Promise<Buffer> {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download LINE content: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Push replies back to LINE Chatroom
async function sendLineReply(replyToken: string, text: string) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      replyToken,
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
    console.error(`LINE Reply failed: ${response.status} - ${errText}`);
  }
}

// Supabase Storage file creation helper
async function uploadToSupabaseStorage(fileBuffer: Buffer, fileName: string, projectFolderKey: string): Promise<string> {
  const bucketName = 'project-photos';

  // 1. Ensure bucket exists
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      console.log(`[Supabase Storage] Created bucket "${bucketName}"`);
    }
  } catch (err) {
    console.error('[Supabase Storage] Failed to list or create bucket:', err);
  }

  // 2. Upload file
  const filePath = `${projectFolderKey}/${fileName}`;
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw error;
  }

  // 3. Get Public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrl;
}

// Insert photo metadata into Supabase Database using a known projectId
async function savePhotoToDatabaseWithId(publicUrl: string, projectId: string, projectFolderKey: string) {
  try {
    console.log(`[Supabase Database] Linking photo to project ID: ${projectId}`);

    // 1. Insert into timelines table
    const { data: timelineEvent, error: timelineError } = await supabaseAdmin
      .from('timelines')
      .insert({
        project_id: projectId,
        event_type: 'photo',
        content: `📸 อัปโหลดรูปภาพรายงานความคืบหน้าจาก LINE (${projectFolderKey})`
      })
      .select()
      .single();

    if (timelineError) throw timelineError;

    if (timelineEvent) {
      // 2. Insert into photos table
      const { error: photoError } = await supabaseAdmin
        .from('photos')
        .insert({
          project_id: projectId,
          timeline_id: timelineEvent.id,
          url: publicUrl,
          room_type: 'รายงานจาก LINE'
        });

      if (photoError) throw photoError;
      console.log('[Supabase Database] Successfully inserted timeline event and photo record.');
    }
  } catch (dbErr) {
    console.error('[Supabase Database] Error saving photo record:', dbErr);
  }
}
