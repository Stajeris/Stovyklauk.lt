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

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 're_123456789') {
      resendClient = new Resend(apiKey);
    }
  }
  return resendClient;
}

/**
 * Sends a reservation confirmation email to the guest using Resend API.
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

  const resend = getResendClient();

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

  if (!resend) {
    console.log(`[Resend Email Simulated]
    To: ${guestEmail}
    Subject: 🏕️ Rezervacijos patvirtinimas - ${campsiteTitle}
    Booking ID: ${bookingId}`);
    
    return {
      success: true,
      mock: true,
      message: `El. laiškas simuliuotas (${guestEmail}). Nustatykite RESEND_API_KEY aplinkos kintamąjį reaziems laiškams.`,
      id: `sim_resend_${Date.now()}`
    };
  }

  try {
    const data = await resend.emails.send({
      from: 'Campy.lt <noreply@campy.lt>',
      to: [guestEmail],
      subject: `🏕️ Rezervacijos patvirtinimas - ${campsiteTitle}`,
      html: htmlContent
    });

    return {
      success: true,
      mock: false,
      data
    };
  } catch (error: any) {
    console.error('Klaida siunčiant laišką per Resend:', error);
    return {
      success: false,
      error: error.message || 'Nepavyko išsiųsti el. laiško'
    };
  }
}
