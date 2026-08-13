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
 * Sends generic HTML email using strictly Resend API with automatic Live mode and Sandbox fallback.
 */
export async function sendGenericEmail(params: GenericEmailParams) {
  const defaultFrom = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'noreply@campy.lt';
  const { to, subject, htmlBody, fromName = 'Campy.lt', fromEmail = defaultFrom } = params;

  const resend = getResendClient();
  if (!resend) {
    console.warn(`❌ Resend API raktas nekonfigūruotas (${to})`);
    return {
      success: false,
      method: 'none',
      error: `Resend API nekonfigūruotas: trūksta RESEND_API_KEY aplinkos kintamojo. Nustatykite šį raktą projekto aplinkoje.`,
      id: `failed_mail_${Date.now()}`
    };
  }

  // 1st Attempt: Primary Live mode sending using custom verified domain
  const primarySender = `"${fromName}" <${fromEmail}>`;

  try {
    const res1 = await resend.emails.send({
      from: primarySender,
      to: [to],
      subject,
      html: htmlBody,
    });

    if (res1.data && !res1.error) {
      return {
        success: true,
        method: 'resend_live',
        data: res1.data,
        message: `El. laiškas sėkmingai išsiųstas per Resend API iš ${fromEmail} į ${to} (LIVE režimas)`
      };
    }

    // 2nd Attempt: If custom domain failed (e.g. unverified domain or sandbox limitation), try onboarding@resend.dev
    const sandboxSender = `"${fromName}" <onboarding@resend.dev>`;
    const res2 = await resend.emails.send({
      from: sandboxSender,
      to: [to],
      subject,
      html: htmlBody,
    });

    if (res2.data && !res2.error) {
      return {
        success: true,
        method: 'resend_sandbox',
        data: res2.data,
        message: `El. laiškas išsiųstas per Resend bandomąjį domeną (onboarding@resend.dev) į ${to}`
      };
    }

    const errMessage = res2.error?.message || res1.error?.message || '';
    console.warn('⚠️ Resend siuntimo klaida per bandomąjį domeną:', res2.error || res1.error);

    // 3rd Attempt: Sandbox interception mode if recipient is restricted by Resend sandbox policy
    let fallbackTo = 'giedriusstajeris@gmail.com';
    if (errMessage.includes('your own email address')) {
      const match = errMessage.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        fallbackTo = match[1].trim();
      }
    }

    const decoratedHtmlBody = `
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 12px 0; font-family: sans-serif; font-size: 13px; color: #92400e;">
        <strong>ℹ️ Campy.lt Resend Pranešimas (Bandomasis Sandbox Režimas):</strong><br>
        Šio laiško numatytas gavėjas: <code>${to}</code>.<br>
        <em>Bandomajame režime laiškas nukreiptas į registruotą administratoriaus el. paštą (<code>${fallbackTo}</code>). Norėdami įjungti TIESIOGINĮ (Live) siuntimą visiems lankytojams, patvirtinkite savo domeną puslapyje <a href="https://resend.com/domains">resend.com/domains</a>.</em>
      </div>
      ${htmlBody}
    `;

    const res3 = await resend.emails.send({
      from: sandboxSender,
      to: [fallbackTo],
      subject: `[Campy.lt ➔ ${to}] ${subject}`,
      html: decoratedHtmlBody,
    });

    if (res3.error) {
      console.error('❌ Resend API siuntimo klaida ir perėmimo režimu:', res3.error);
      return {
        success: false,
        method: 'resend',
        error: res3.error.message || res2.error?.message || res1.error?.message || 'Nepavyko išsiųsti laiško per Resend API'
      };
    }

    return {
      success: true,
      method: 'resend_sandbox_intercepted',
      data: res3.data,
      message: `El. laiškas išsiųstas Resend bandomuoju perėmimo režimu į ${fallbackTo}`
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
 * Sends a notification email to the Host when a Guest submits a new reservation request (status: 'pending').
 */
export async function sendNewReservationRequestHostEmail(params: {
  hostEmail: string;
  hostName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  campsiteTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}) {
  const {
    hostEmail,
    hostName = 'Šeimininke',
    guestName,
    guestEmail,
    guestPhone = 'Nenurodytas',
    campsiteTitle,
    checkIn,
    checkOut,
    totalPrice,
    bookingId
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .badge { display: inline-block; background: #fef08a; color: #854d0e; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 10px; }
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
            <h1>⛺ Nauja Užsakymo Užklausa!</h1>
            <div class="badge">Laukia Jūsų Patvirtinimo</div>
          </div>
          <div class="content">
            <div class="greeting">Sveiki, ${hostName}!</div>
            <p>Gauta nauja stovyklavietės rezervacijos užklausa jūsų objektui <strong>${campsiteTitle}</strong>.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Svečias:</span>
                <span class="detail-value">${guestName} (${guestEmail})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Telefonas:</span>
                <span class="detail-value">${guestPhone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Atvykimas:</span>
                <span class="detail-value">${checkIn}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Išvykimas:</span>
                <span class="detail-value">${checkOut}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Užsakymo ID:</span>
                <span class="detail-value">#${bookingId}</span>
              </div>

              <div class="total-row">
                <span>Rezervacijos Suma:</span>
                <span>€${totalPrice}</span>
              </div>
            </div>

            <p>Prisijunkite prie savo <strong>Campy.lt Valdymo Skydelio</strong>, kad patvirtintumėte arba atmestumėte šią užklausą.</p>
          </div>
          <div class="footer">
            Campy.lt — Stovyklaviečių ir Sklypų Rezervacijos Sistema
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendGenericEmail({
    to: hostEmail,
    subject: `⛺ Nauja užsakymo užklausa - ${campsiteTitle}`,
    htmlBody: htmlContent
  });
}

/**
 * Sends a notification email to the Guest when a Host rejects a reservation request (status: 'rejected').
 */
export async function sendReservationRejectedGuestEmail(params: {
  guestEmail: string;
  guestName: string;
  campsiteTitle: string;
  checkIn: string;
  checkOut: string;
  bookingId: string;
  reason?: string;
}) {
  const {
    guestEmail,
    guestName,
    campsiteTitle,
    checkIn,
    checkOut,
    bookingId,
    reason = 'Pasirinktomis datomis stovyklavietė nėra prieinama.'
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .badge { display: inline-block; background: #fecaca; color: #991b1b; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 10px; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; font-weight: 700; color: #991b1b; margin-bottom: 16px; }
          .details-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #78716c; font-weight: 600; }
          .detail-value { font-weight: 700; color: #1c1917; }
          .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 16px; color: #991b1b; font-size: 13px; font-weight: 600; }
          .footer { background: #f5f5f4; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Rezervacijos Užklausa Atmesta</h1>
            <div class="badge">Atšaukta / Atmesta</div>
          </div>
          <div class="content">
            <div class="greeting">Sveiki, ${guestName},</div>
            <p>Apgailestaujame, tačiau jūsų rezervacijos užklausa stovyklavietėje <strong>${campsiteTitle}</strong> nebuvo patvirtinta.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Stovyklavietė:</span>
                <span class="detail-value">${campsiteTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Datos:</span>
                <span class="detail-value">${checkIn} — ${checkOut}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Užsakymo ID:</span>
                <span class="detail-value">#${bookingId}</span>
              </div>

              <div class="reason-box">
                <strong>Priežastis:</strong> ${reason}
              </div>
            </div>

            <p>Kviečiame pasirinkti kitas datas arba peržiūrėti kitas puikias <strong>Campy.lt</strong> stovyklavietes!</p>
          </div>
          <div class="footer">
            Campy.lt — Stovyklaviečių ir Sklypų Rezervacijos Sistema
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendGenericEmail({
    to: guestEmail,
    subject: `❌ Rezervacijos užklausa nepatvirtinta - ${campsiteTitle}`,
    htmlBody: htmlContent
  });
}

/**
 * Sends a notification email to the Host when an unregistered Guest submits a inquiry form.
 */
export async function sendGuestInquiryHostEmail(params: {
  hostEmail: string;
  hostName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  message: string;
  campsiteTitle: string;
  checkIn?: string;
  checkOut?: string;
  inquiryId: string;
}) {
  const {
    hostEmail,
    hostName = 'Šeimininke',
    guestName,
    guestEmail,
    guestPhone = 'Nenurodytas',
    message,
    campsiteTitle,
    checkIn = 'Nepasirinkta',
    checkOut = 'Nepasirinkta',
    inquiryId
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .badge { display: inline-block; background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 10px; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0369a1; margin-bottom: 16px; }
          .details-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #78716c; font-weight: 600; }
          .detail-value { font-weight: 700; color: #1c1917; }
          .message-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 14px; color: #0c4a6e; font-style: italic; }
          .footer { background: #f5f5f4; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 Naujas Pasiteiravimas Dėl Stovyklavietės</h1>
            <div class="badge">Neregistruoto Lankytojo Žinutė</div>
          </div>
          <div class="content">
            <div class="greeting">Sveiki, ${hostName}!</div>
            <p>Gautas naujas lankytojo pasiteiravimas dėl jūsų objekto <strong>${campsiteTitle}</strong>.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Lankytojo Vardas:</span>
                <span class="detail-value">${guestName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">El. paštas:</span>
                <span class="detail-value"><a href="mailto:${guestEmail}">${guestEmail}</a></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Telefonas:</span>
                <span class="detail-value">${guestPhone ? `<a href="tel:${guestPhone}">${guestPhone}</a>` : 'Nenurodytas'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Norimos Datos:</span>
                <span class="detail-value">${checkIn} — ${checkOut}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Užklausos ID:</span>
                <span class="detail-value">#${inquiryId}</span>
              </div>

              <div class="message-box">
                <strong>Lankytojo žinutė:</strong><br>
                "${message}"
              </div>
            </div>

            <p>Galite tiesiogiai susisiekti su lankytoju el. paštu (<a href="mailto:${guestEmail}">${guestEmail}</a>) arba telefonu, arba peržiūrėti pasiteiravimus savo Campy.lt Valdymo Skydelyje.</p>
          </div>
          <div class="footer">
            Campy.lt — Stovyklaviečių ir Sklypų Pasiteiravimų Sistema
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendGenericEmail({
    to: hostEmail,
    subject: `📩 Naujas pasiteiravimas iš ${guestName} - ${campsiteTitle}`,
    htmlBody: htmlContent,
    fromName: 'Campy.lt',
    fromEmail: 'noreply@campy.lt'
  });
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

