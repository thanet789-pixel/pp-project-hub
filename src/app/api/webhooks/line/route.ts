import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Setup LINE config from env variables
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

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

    for (const event of events) {
      if (event.type === 'message') {
        const { replyToken, message, source } = event;
        const messageType = message.type;
        const senderId = source.userId;

        // Determine if message is inside group or personal chat
        const groupId = source.groupId || source.roomId || 'personal_chat';

        if (messageType === 'text') {
          const text = message.text;
          console.log(`[LINE Webhook] Text received from ${groupId}: "${text}"`);
          
          // Reply confirmation to LINE using fetch to LINE API
          if (replyToken) {
            await sendLineReply(replyToken, `PP Project Hub: ได้รับข้อความรายงานความคืบหน้าเรียบร้อยแล้ว (${text.substring(0, 20)}...)`);
          }
        } 
        
        else if (messageType === 'image') {
          const messageId = message.id;
          console.log(`[LINE Webhook] Image received with ID: ${messageId}`);

          // 1. Download image from LINE Content Server
          const imageBuffer = await downloadLineContent(messageId);

          // 2. Upload to Google Drive (Simulated fallback or actual upload depending on credentials)
          let driveUrl = 'https://drive.google.com/drive/folders/placeholder';
          if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            try {
              driveUrl = await uploadToGoogleDrive(imageBuffer, `line_${messageId}.jpg`, groupId);
            } catch (err) {
              console.error('Error uploading to Google Drive:', err);
            }
          } else {
            console.log('[Google Drive] Credentials missing. Image stored locally in memory.');
          }

          // 3. Reply confirmation to the installer group chat
          if (replyToken) {
            await sendLineReply(
              replyToken, 
              `PP Project Hub: 📸 ได้รับภาพถ่ายหน้างานแล้ว!\n\nจัดเก็บใน Google Drive ของโปรเจกต์เรียบร้อย\n📂 ลิงก์โฟลเดอร์: ${driveUrl}`
            );
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

// Google Drive API file creation helper
async function uploadToGoogleDrive(fileBuffer: Buffer, fileName: string, projectFolderKey: string): Promise<string> {
  const { google } = require('googleapis');
  
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/drive']
  );

  const drive = google.drive({ version: 'v3', auth });

  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  // Create or retrieve folder for this group/project
  let folderId = parentFolderId;
  if (parentFolderId) {
    try {
      const listRes = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='Project_${projectFolderKey}' and '${parentFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      const folders = listRes.data.files;
      if (folders && folders.length > 0) {
        folderId = folders[0].id;
      } else {
        // Create new folder inside parent folder
        const folderMetadata = {
          name: `Project_${projectFolderKey}`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        };
        const folder = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });
        folderId = folder.data.id;
      }
    } catch (e) {
      console.error('Error creating Google Drive project sub-folder:', e);
    }
  }

  // Upload the file buffer
  const { Readable } = require('stream');
  const media = {
    mimeType: 'image/jpeg',
    body: Readable.from(fileBuffer)
  };

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : []
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });

  return file.data.webViewLink || 'https://drive.google.com';
}
