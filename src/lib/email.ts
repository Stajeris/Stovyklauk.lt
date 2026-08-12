import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface BookingConfirmationEmailParams {
  guestEmail: string;
  guestName: string;
  campsiteTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
  hostName?: string;
  hostPhone?: string;
}

export interface GenericEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  fromName?: string;
  fromEmail?: string;
}

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 're_123456789' && apiKey.trim() !== '') {
      resendClient = new Resend(apiKey.trim());
    }
  }
  return resendClient;
}

export function getSmtpTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host.trim(),
      port,
      secure: port === 465, // true for 465, false for 587 or other ports
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return null;
}

/**
 * Sends generic HTML email using SMTP Transporter first, then Resend API, or falls back to simulation.
 */
export async function sendGenericEmail(params: GenericEmailParams) {
  const { to, subject, htmlBody, fromName = 'Campy.lt', fromEmail = 'noreply@campy.lt' } = params;

  const smtpTransporter = getSmtpTransporter();
  const resend = getResendClient();

  const senderAddress = `"${fromName}" <${fromEmail}>`;

  // 1. Try Direct SMTP (Nodemailer)
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: senderAddress,
        to,
        subject,
        html: htmlBody,
      });

      return {
        success: true,
        method: 'smtp',
        messageId: info.messageId,
        message: `El. laiškas sėkmingai išsiųstas per Supabase / Custom SMTP serverį (${info.messageId})`
      };
    } catch (smtpErr: any) {
      console.warn('⚠️ SMTP siuntimo klaida, bandoma per Resend API:', smtpErr.message);
    }
  }

  // 2. Try Resend API
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: senderAddress,
        to: [to],
        subject,
        html: htmlBody,
      });

      return {
        success: true,
        method: 'resend',
        data,
        message: `El. laiškas sėkmingai išsiųstas per Resend API (${fromEmail})`
      };
    } catch (resendErr: any) {
      console.warn('⚠️ Resend siuntimo klaida su skaitomu domenu, bandoma iš onboarding@resend.dev:', resendErr.message);
      
      // If domain is not verified on Resend, retry using onboarding@resend.dev
      try {
        const fallbackAddress = `"${fromName}" <onboarding@resend.dev>`;
        const data = await resend.emails.send({
          from: fallbackAddress,
          to: [to],
          subject,
          html: htmlBody,
        });

        return {
          success: true,
          method: 'resend_fallback',
          data,
          message: `El. laiškas išsiųstas per Resend API (su bandomuoju adresu onboarding@resend.dev)`
        };
      } catch (fallbackErr: any) {
        console.error('❌ Resend API siuntimo klaida:', fallbackErr.message);
        return {
          success: false,
          method: 'resend',
          error: fallbackErr.message || 'Nepavyko išsiųsti laiško per Resend API'
        };
      }
    }
  }

  // 3. No provider configured or both failed
  console.warn(`❌ El. pašto tiekėjas nekonfigūruotas arba siuntimas nepavyko (${to})`);

  return {
    success: false,
    method: 'none',
    error: `El. pašto siuntimo sistema nekonfigūruota: trūksta RESEND_API_KEY arba SMTP_HOST / SMTP_USER / SMTP_PASS aplinkos kintamųjų. Prašome nustatyti šiuos kintamuosius projekto aplinkoje.`,
    id: `failed_mail_${Date.now()}`
  };
}

/**
 * Diagnostic function to test SMTP / Resend connection.
 */
export async function testSmtpConnection(testRecipient?: string) {
  const smtpTransporter = getSmtpTransporter();
  const resend = getResendClient();

  const status = {
    smtpConfigured: !!smtpTransporter,
    resendConfigured: !!resend,
    smtpHost: process.env.SMTP_HOST || 'Nenurodyta',
    smtpPort: process.env.SMTP_PORT || '587 (numatytasis)',
    smtpUser: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-3) : 'Nenurodyta',
    resendKeyPresent: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789'
  };

  if (testRecipient) {
    const testResult = await sendGenericEmail({
      to: testRecipient,
      subject: '🧪 Campy.lt / Supabase SMTP Bandomasis Patikrinimas',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; color: #064e3b;">
          <h2>🟢 SMTP / Resend Ryšys Veikia!</h2>
          <p>Šis bandomasis laiškas patvirtina, kad el. pašto siuntimo sistema sukonfigūruota sėkmingai.</p>
          <p><strong>Būsenos informacija:</strong></p>
          <ul>
            <li>SMTP Serveris: ${status.smtpHost}:${status.smtpPort}</li>
            <li>SMTP Aktyvus: ${status.smtpConfigured ? 'TAIP ✅' : 'NE ❌'}</li>
            <li>Resend API Aktyvus: ${status.resendConfigured ? 'TAIP ✅' : 'NE ❌'}</li>
            <li>Išsiuntimo Laikas: ${new Date().toISOString()}</li>
          </ul>
        </div>
      `
    });

    return { status, testResult };
  }

  return { status };
}

/**
 * Sends a reservation confirmation email to the guest using Resend or SMTP.
 */
export async function sendBookingConfirmationEmail(params: BookingConfirmationEmailParams) {
  const {
    guestEmail,
    guestName,
    campsiteTitle,
    checkIn,
    checkOut,
    totalPrice,
    bookingId,
    hostName = 'Stovyklavietės Šeimininkas',
    hostPhone = '+37060000000'
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .badge { display: inline-block; background: #f59e0b; color: #78350f; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 10px; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
          .details-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #78716c; font-weight: 600; }
          .detail-value { font-weight: 700; color: #1c1917; }
          .total-row { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 16px; font-weight: 800; color: #065f46; display: flex; justify-content: space-between; }
          .footer { background: #f5f5f4; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏕️ Rezervacija Patvirtinta!</h1>
            <div class="badge">Sėkmingai Apmokėta & Patvirtinta</div>
          </div>
          <div class="content">
            <div class="greeting">Sveiki, ${guestName}!</div>
            <p>Puikios naujienos! Jūsų stovyklavietės užsakymas buvo patvirtintas šeimininko.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Stovyklavietė:</span>
                <span class="detail-value">${campsiteTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Atvykimas (Check-in):</span>
                <span class="detail-value">${checkIn}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Išvykimas (Check-out):</span>
                <span class="detail-value">${checkOut}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Užsakymo ID:</span>
                <span class="detail-value">#${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Šeimininkas:</span>
                <span class="detail-value">${hostName} (${hostPhone})</span>
              </div>

              <div class="total-row">
                <span>Viso Sumokėta:</span>
                <span>€${totalPrice}</span>
              </div>
            </div>

            <p>Laukiame jūsų atvykstant! Jei turite klausimų, galite bet kada susisiekti su šeimininku per programėlę.</p>
          </div>
          <div class="footer">
            Šis el. laiškas išsiųstas automatiškai iš Stovyklaviečių Rezervacijos Sistemos.
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendGenericEmail({
    to: guestEmail,
    subject: `🏕️ Rezervacijos patvirtinimas - ${campsiteTitle}`,
    htmlBody: htmlContent
  });
}

