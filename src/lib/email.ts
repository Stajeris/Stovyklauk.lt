import { Resend } from 'resend';

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

/**
 * Sends generic HTML email using strictly Resend API.
 */
export async function sendGenericEmail(params: GenericEmailParams) {
  const { to, subject, htmlBody, fromName = 'Campy.lt', fromEmail = 'noreply@campy.lt' } = params;

  const resend = getResendClient();
  const senderAddress = `"${fromName}" <${fromEmail}>`;

  // Use Resend API
  if (resend) {
    try {
      const res1 = await resend.emails.send({
        from: senderAddress,
        to: [to],
        subject,
        html: htmlBody,
      });

      if (res1.error) {
        console.warn('⚠️ Resend siuntimo klaida su pirminiu adresu, bandoma per onboarding@resend.dev:', res1.error);
        
        // If domain is not verified on Resend, retry using onboarding@resend.dev
        const fallbackAddress = `"${fromName}" <onboarding@resend.dev>`;
        const res2 = await resend.emails.send({
          from: fallbackAddress,
          to: [to],
          subject,
          html: htmlBody,
        });

        if (res2.error) {
          console.error('❌ Resend API siuntimo klaida:', res2.error);
          return {
            success: false,
            method: 'resend',
            error: res2.error.message || res1.error.message || 'Nepavyko išsiųsti laiško per Resend API'
          };
        }

        return {
          success: true,
          method: 'resend_fallback',
          data: res2.data,
          message: `El. laiškas išsiųstas per Resend API (su bandomuoju adresu onboarding@resend.dev)`
        };
      }

      return {
        success: true,
        method: 'resend',
        data: res1.data,
        message: `El. laiškas sėkmingai išsiųstas per Resend API (${fromEmail})`
      };
    } catch (resendErr: any) {
      console.error('❌ Resend API tinklo / vykdymo klaida:', resendErr.message);
      return {
        success: false,
        method: 'resend',
        error: resendErr.message || 'Nepavyko išsiųsti laiško per Resend API'
      };
    }
  }

  // Resend API key missing
  console.warn(`❌ Resend API raktas nekonfigūruotas (${to})`);

  return {
    success: false,
    method: 'none',
    error: `Resend API nekonfigūruotas: trūksta RESEND_API_KEY aplinkos kintamojo. Nustatykite šį raktą projekto aplinkoje.`,
    id: `failed_mail_${Date.now()}`
  };
}

/**
 * Diagnostic function to test Resend connection.
 */
export async function testSmtpConnection(testRecipient?: string) {
  const resend = getResendClient();

  const status = {
    resendConfigured: !!resend,
    resendKeyPresent: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789'
  };

  if (testRecipient) {
    const testResult = await sendGenericEmail({
      to: testRecipient,
      subject: '🧪 Campy.lt Resend API Bandomasis Patikrinimas',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; color: #064e3b;">
          <h2>🟢 Resend API Ryšys Veikia!</h2>
          <p>Šis bandomasis laiškas patvirtina, kad el. pašto siuntimo sistema per Resend API veikia sėkmingai.</p>
          <p><strong>Būsenos informacija:</strong></p>
          <ul>
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

