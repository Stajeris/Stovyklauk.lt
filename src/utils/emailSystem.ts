import { Booking, Campsite, CheckInInstructions, UserProfile, AutomatedEmailLog } from '../types';

export type SystemEmailType = 
  | 'welcome_user'
  | 'welcome_host'
  | 'reservation_request_received'
  | 'new_reservation_request_host'
  | 'reservation_confirmed'
  | 'reservation_declined'
  | 'arrival_instructions'
  | 'password_reset_code'
  | 'stay_completed_thank_you';

export interface EmailPayload {
  user?: UserProfile;
  booking?: Booking;
  campsite?: Campsite;
  verificationCode?: string;
  declineReason?: string;
  customNote?: string;
}

export interface GeneratedEmail {
  subject: string;
  recipientEmail: string;
  recipientName: string;
  contentPreview: string;
  htmlBody: string;
}

/**
 * Dispatches generated system email to Express backend API route (/api/send-system-email)
 * which sends via Resend or Supabase SMTP.
 */
export async function sendSystemEmailViaApi(type: SystemEmailType, payload: EmailPayload) {
  const emailData = generateSystemEmail(type, payload);

  try {
    const res = await fetch('/api/send-system-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: emailData.recipientEmail,
        subject: emailData.subject,
        htmlBody: emailData.htmlBody,
        fromName: 'Campy.lt Stovyklavietės',
        fromEmail: 'noreply@campy.lt'
      })
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn('API non-JSON response:', text);
      return { success: false, emailData, error: text || 'Serveris negrąžino galiojančio JSON' };
    }

    if (!res.ok) {
      console.warn('API respond with error for email dispatch:', data);
      return { success: false, emailData, error: data.error || 'Serverio klaida' };
    }

    return { success: true, emailData, apiResult: data };
  } catch (err: any) {
    console.warn('Network error dispatching system email:', err.message);
    return { success: false, emailData, error: err.message };
  }
}

export function generateSystemEmail(type: SystemEmailType, payload: EmailPayload): GeneratedEmail {
  const { user, booking, campsite, verificationCode, declineReason, customNote } = payload;

  const campsiteTitle = campsite?.title || booking?.campsiteTitle || 'Stovyklavietė';
  const campsiteLocation = campsite?.location || booking?.location || 'Lietuva';

  const instructions: CheckInInstructions = campsite?.checkInInstructions || {
    gpsCoordinates: `${campsite?.latitude || 55.05812}, ${campsite?.longitude || 25.45231}`,
    gateCode: '4829',
    houseRules: campsite?.rules?.join(' • ') || 'Tylos valandos nuo 22:00. Laužus kūrenti tik tam skirtoje vietoje.',
    wifiName: 'Campy_Guest_WiFi',
    wifiPassword: 'stovyklaujamegamtose'
  };

  switch (type) {
    case 'welcome_user': {
      const recipientName = user?.name || 'Mielas Keliautojau';
      const recipientEmail = user?.email || 'vartotojas@gmail.com';
      const subject = `👋 Sveiki atvykę į Campy.lt, ${recipientName}! Jūsų paskyra sukurta`;
      const preview = `Džiaugiamės, kad prisijungėte prie Campy.lt bendruomenės! Atraskite gražiausias privačias stovyklavietes, glampingus ir sodybas visoje Lietuvoje.`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #064e3b; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; tracking-spacing: -0.5px;">⛺ Campy.lt</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0;">Privačių stovyklaviečių ir sodybų platforma Lietuvoje</p>
          </div>
          
          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <h2 style="color: #065f46; font-size: 18px; margin-top: 0;">Sveiki, ${recipientName}!</h2>
            <p>Jūsų paskyra <strong>Campy.lt</strong> platformoje sėkmingai sukurta!</p>
            <p>Dabar galite lengvai ieškoti, rezervuoti ir mėgautis unikaliomis poilsio vietomis gamtoje — nuo privačių ežero pakrančių palapinėms iki prabangių kupolų ir kemperių aikštelių.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #166534;">🌟 Jūsų Paskyros Informacija:</h3>
              <p style="margin: 4px 0; font-size: 13px;">• El. paštas: <strong>${recipientEmail}</strong></p>
              <p style="margin: 4px 0; font-size: 13px;">• Paskyros tipas: <strong>Pramogautojas / Keliautojas</strong></p>
              <p style="margin: 4px 0; font-size: 13px;">• Būsena: <strong>${user?.isEmailVerified ? '🟢 El. paštas patvirtintas' : '🟡 El. paštas verifikuojamas'}</strong></p>
            </div>

            <p style="text-align: center; margin-top: 24px;">
              <a href="https://campy.lt/search" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">Ieškoti Stovyklavietės Pastogės</a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            © 2026 Campy.lt — Visos teisės saugomos. Kilus klausimams rašykite pagalba@campy.lt
          </div>
        </div>
      `;

      return { subject, recipientEmail, recipientName, contentPreview: preview, htmlBody };
    }

    case 'welcome_host': {
      const hostName = user?.name || campsite?.host.name || 'Šeimininkas';
      const hostEmail = user?.email || campsite?.host.email || 'seimininkas@campy.lt';
      const subject = `🏕️ Sveikiname prisijungus prie Campy.lt Šeimininkų bendruomenės!`;
      const preview = `Sveiki, ${hostName}! Džiaugiamės matydami jus Campy.lt šeimininkų gretose. Jūsų sklypas ir sodyba jau paruošta priimti pirmuosius stovyklautojus.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #065f46; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🌲 Campy.lt Šeimininkų Klubas</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0;">Pasveikinimo pranešimas naujam šeimininkui</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <h2 style="color: #065f46; font-size: 18px; margin-top: 0;">Sveiki, ${hostName}!</h2>
            <p>Ačiū, kad pasirinkote <strong>Campy.lt</strong> savo gamtos kampelio ar sodybos sklypo nuomai!</p>
            <p>Jūsų užregistruota vieta <strong>„${campsiteTitle}“</strong> suteiks stovyklautojams nepamirštamus įspūdžius gamtoje.</p>

            <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">💡 Naudingi patarimai šeimininkui:</h3>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f;">
                <li>Nustatykite tikslias GPS koordinates ir patekimo kodus atvykimo instrukcijose.</li>
                <li>Prijunkite iCal kalendorių (Airbnb, Booking.com), kad išvengtumėte dvigubų rezervacijų.</li>
                <li>Su PRO planu naudokitės automatizuotais el. laiškais bei pitch (aikštelių) valdymu.</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 24px;">
              <a href="https://campy.lt/host-dashboard" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">Atidaryti Šeimininko Valdymo Skydą</a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            © 2026 Campy.lt — Šeimininkų Pagalba: seimininkai@campy.lt | Tel. +370 600 00000
          </div>
        </div>
      `;

      return { subject, recipientEmail: hostEmail, recipientName: hostName, contentPreview: preview, htmlBody };
    }

    case 'reservation_request_received': {
      const guestName = booking?.guestName || 'Poilsiautojau';
      const guestEmail = booking?.guestEmail || 'svecio@gmail.com';
      const subject = `📩 Užsakymo užklausa gauta — ${campsiteTitle}`;
      const preview = `Labas, ${guestName}! Jūsų rezervacijos užklausa stovyklavietėje „${campsiteTitle}“ (${booking?.checkIn} — ${booking?.checkOut}) sėkmingai išsiųsta šeimininkui.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #047857; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">📩 Užsakymo Užklausa Gauta</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5;">Laukiama šeimininko patvirtinimo</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 14px; font-weight: bold;">Sveiki, ${guestName}!</p>
            <p>Jūsų užsakymo užklausa stovyklavietėje <strong>„${campsiteTitle}“</strong> sėkmingai pateikta.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 13px;">
              <p style="margin: 4px 0;">📍 Vieta: <strong>${campsiteLocation}</strong></p>
              <p style="margin: 4px 0;">📅 Atvykimas: <strong>${booking?.checkIn}</strong> | Išvykimas: <strong>${booking?.checkOut}</strong> (${booking?.totalNights || 1} nakt.)</p>
              <p style="margin: 4px 0;">👥 Svečių skaičius: <strong>${booking?.guestsCount || 1} asm.</strong></p>
              <p style="margin: 4px 0;">💶 Bendra suma: <strong>€${(booking?.totalPrice || 0).toFixed(2)}</strong></p>
              ${booking?.pitchName ? `<p style="margin: 4px 0;">⛺ Aikštelė: <strong>${booking.pitchName}</strong></p>` : ''}
            </div>

            <p style="font-size: 13px; color: #4b5563;">Šeimininkas peržiūrės jūsų prašymą ir atsiųs patvirtinimą arba papildomą informaciją.</p>
          </div>

          <div style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Ačiū, kad keliaujate su Campy.lt!
          </div>
        </div>
      `;

      return { subject, recipientEmail: guestEmail, recipientName: guestName, contentPreview: preview, htmlBody };
    }

    case 'new_reservation_request_host': {
      const hostName = campsite?.host.name || 'Šeimininkas';
      const hostEmail = campsite?.host.email || 'seimininkas@campy.lt';
      const guestName = booking?.guestName || 'Mantas';
      const subject = `🔔 Nauja rezervacijos užklausa — ${campsiteTitle} (${guestName})`;
      const preview = `Sveiki, ${hostName}! Svečias ${guestName} atsiuntė rezervacijos prašymą datoms ${booking?.checkIn} — ${booking?.checkOut}. Suma: €${(booking?.totalPrice || 0).toFixed(2)}.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #d97706; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🔔 Nauja Rezervacijos Užklausa</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #fef3c7;">Laukiama jūsų sprendimo</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 14px; font-weight: bold;">Sveiki, ${hostName}!</p>
            <p>Gautas naujas užsakymas stovyklavietėje <strong>„${campsiteTitle}“</strong>.</p>

            <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 13px; color: #78350f;">
              <p style="margin: 4px 0;">👤 Poilsiautojas: <strong>${guestName}</strong> (${booking?.guestEmail || ''}, ${booking?.guestPhone || 'Tel. nenurodytas'})</p>
              <p style="margin: 4px 0;">📅 Datos: <strong>${booking?.checkIn} — ${booking?.checkOut}</strong> (${booking?.totalNights || 1} nakt.)</p>
              <p style="margin: 4px 0;">💶 Jūsų išmoka: <strong>€${(booking?.hostPayoutAmount || booking?.totalPrice || 0).toFixed(2)}</strong></p>
              ${booking?.guestNote ? `<p style="margin: 8px 0 0 0; font-style: italic;">💬 Žinutė: "${booking.guestNote}"</p>` : ''}
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="https://campy.lt/host-dashboard?tab=pending" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; margin-right: 8px;">✅ Patvirtinti Užsakymą</a>
              <a href="https://campy.lt/host-dashboard?tab=pending" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 13px;">❌ Atmesti</a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Campy.lt Šeimininkų Sistema
          </div>
        </div>
      `;

      return { subject, recipientEmail: hostEmail, recipientName: hostName, contentPreview: preview, htmlBody };
    }

    case 'reservation_confirmed': {
      const guestName = booking?.guestName || 'Mielas Svečiui';
      const guestEmail = booking?.guestEmail || 'svecio@gmail.com';
      const subject = `✅ Rezervacija PATVIRTINTA! — ${campsiteTitle}`;
      const preview = `Sveikiname, ${guestName}! Jūsų rezervacija stovyklavietėje „${campsiteTitle}“ (${booking?.checkIn} — ${booking?.checkOut}) patvirtinta. Peržiūrėkite atvykimo bei patekimo duomenis.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #065f46; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">✅ Rezervacija Patvirtinta!</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0;">Pasiruoškite puikiam poilsiui gamtoje</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 15px; font-weight: bold;">Labas, ${guestName}!</p>
            <p>Puikios žinios! Šeimininkas patvirtino jūsų užsakymą stovyklavietėje <strong>„${campsiteTitle}“</strong>.</p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 12px; margin: 18px 0; font-size: 13px; color: #166534;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #065f46;">📌 Užsakymo Suvestinė:</h3>
              <p style="margin: 4px 0;">📅 Atvykimo data: <strong>${booking?.checkIn}</strong></p>
              <p style="margin: 4px 0;">📅 Išvykimo data: <strong>${booking?.checkOut}</strong> (${booking?.totalNights || 1} nakt.)</p>
              <p style="margin: 4px 0;">👥 Svečiai: <strong>${booking?.guestsCount || 1} asm.</strong></p>
              <p style="margin: 4px 0;">💶 Apmokėta suma: <strong>€${(booking?.totalPrice || 0).toFixed(2)}</strong></p>
              ${booking?.pitchName ? `<p style="margin: 4px 0;">⛺ Aikštelė: <strong>${booking.pitchName}</strong></p>` : ''}
              <p style="margin: 4px 0;">👤 Šeimininkas: <strong>${campsite?.host.name || 'Sodybos Šeimininkas'}</strong> (${campsite?.host.phone || '+370 600 00000'})</p>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 18px; border-radius: 12px; margin: 18px 0; font-size: 13px; color: #78350f;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">🔑 Atvykimo & Patekimo Duomenys:</h3>
              <p style="margin: 4px 0;">📍 <strong>GPS Koordinatės:</strong> ${instructions.gpsCoordinates}</p>
              <p style="margin: 4px 0;">🔑 <strong>Vartų / Spynos kodas:</strong> ${instructions.gateCode}</p>
              ${instructions.wifiName ? `<p style="margin: 4px 0;">📶 <strong>Wi-Fi:</strong> ${instructions.wifiName} (Slaptažodis: ${instructions.wifiPassword})</p>` : ''}
              ${instructions.houseRules ? `<p style="margin: 4px 0;">📜 <strong>Taisyklės:</strong> ${instructions.houseRules}</p>` : ''}
            </div>

            <p style="text-align: center; margin-top: 24px;">
              <a href="https://campy.lt/my-trips" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">Mano Kelionės ir Detalės</a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Gero ir ramaus poilsio linki Campy.lt komanda!
          </div>
        </div>
      `;

      return { subject, recipientEmail: guestEmail, recipientName: guestName, contentPreview: preview, htmlBody };
    }

    case 'reservation_declined': {
      const guestName = booking?.guestName || 'Svečiui';
      const guestEmail = booking?.guestEmail || 'svecio@gmail.com';
      const subject = `❌ Rezervacijos užklausa nepatvirtinta — ${campsiteTitle}`;
      const preview = `Atsiprašome, ${guestName}. Jūsų užklausa datoms ${booking?.checkIn} — ${booking?.checkOut} nebuvo patvirtinta. Lėšos nebuvo nuskaitytos. Pasirinkite kitą stovyklavietę.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #991b1b; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">❌ Užklausa Nepatvirtinta</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #fecdd3;">Informacija dėl jūsų rezervacijos</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 14px; font-weight: bold;">Sveiki, ${guestName},</p>
            <p>Atsiprašome, tačiau jūsų užsakymo užklausa stovyklavietėje <strong>„${campsiteTitle}“</strong> datoms <strong>${booking?.checkIn} — ${booking?.checkOut}</strong> nebuvo patvirtinta šeimininko.</p>

            ${declineReason ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 14px; border-radius: 10px; margin: 16px 0; font-size: 13px; color: #991b1b;">
                <strong>Priežastis / Žinutė iš šeimininko:</strong> "${declineReason}"
              </div>
            ` : ''}

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 10px; margin: 16px 0; font-size: 12px; color: #166534;">
              ✓ Jokie mokesčiai nebuvo nuskaityti (arba rezervuota suma iškart atšaukta jūsų banko sąskaitoje).
            </div>

            <p style="font-size: 13px; color: #4b5563;">Nepraraskite nuotaikos! Campy.lt platformoje rasite dešimtis kitų puikių stovyklaviečių ir sodybų šioms datoms.</p>

            <p style="text-align: center; margin-top: 20px;">
              <a href="https://campy.lt/search" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 13px;">Ieškoti Kitos Stovyklavietės</a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Campy.lt — Pagalba stovyklautojams
          </div>
        </div>
      `;

      return { subject, recipientEmail: guestEmail, recipientName: guestName, contentPreview: preview, htmlBody };
    }

    case 'arrival_instructions': {
      const guestName = booking?.guestName || 'Svečiui';
      const guestEmail = booking?.guestEmail || 'svecio@gmail.com';
      const subject = `📍 Atvykimo instrukcijos ir patekimo kodai — ${campsiteTitle}`;
      const preview = `Atvykimo informacija stovyklavietėje „${campsiteTitle}“: GPS ${instructions.gpsCoordinates}, Vartų kodas: ${instructions.gateCode}.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #047857; padding: 22px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">📍 Atvykimo Instrukcijos</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5;">Patekimo kodai ir GPS koordinatės</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 14px; font-weight: bold;">Labas, ${guestName}!</p>
            <p>Čia yra visos atvykimo ir patekimo detalės jūsų viešnagei <strong>„${campsiteTitle}“</strong>:</p>

            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px; border-radius: 12px; margin: 16px 0; font-size: 13px; color: #064e3b;">
              <p style="margin: 6px 0;">📍 <strong>Tikslus GPS adresas:</strong> ${instructions.gpsCoordinates}</p>
              <p style="margin: 6px 0;">🔑 <strong>Vartų / Spynos kodas:</strong> ${instructions.gateCode}</p>
              ${instructions.wifiName ? `<p style="margin: 6px 0;">📶 <strong>Wi-Fi Tinklas:</strong> ${instructions.wifiName} (Slaptažodis: ${instructions.wifiPassword})</p>` : ''}
              ${instructions.houseRules ? `<p style="margin: 6px 0;">📜 <strong>Svarbios Taisyklės:</strong> ${instructions.houseRules}</p>` : ''}
              ${campsite?.arrivalInstructions ? `<p style="margin: 6px 0;">🚘 <strong>Atvykimo nuoroda:</strong> ${campsite.arrivalInstructions}</p>` : ''}
            </div>

            <p style="font-size: 12px; color: #6b7280;">Kilus klausimams ar vėluojant atvykti, susisiekite su šeimininku <strong>${campsite?.host.name || 'Šeimininkas'}</strong> tel. ${campsite?.host.phone || '+370 600 00000'}.</p>
          </div>

          <div style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Laimingo kelio ir geros viešnagės!
          </div>
        </div>
      `;

      return { subject, recipientEmail: guestEmail, recipientName: guestName, contentPreview: preview, htmlBody };
    }

    case 'password_reset_code': {
      const recipientName = user?.name || 'Vartotojau';
      const recipientEmail = user?.email || 'vartotojas@gmail.com';
      const code = verificationCode || '4829';
      const subject = `🔑 Campy.lt Patvirtinimo / Slaptažodžio atstatymo kodas: ${code}`;
      const preview = `Jūsų saugumo patvirtinimo kodas: ${code}. Įveskite šį kodą prisijungimui ar slaptažodžio keitimui.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #1e293b; padding: 22px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🔐 Saugumo Patvirtinimo Kodas</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Campy.lt Paskyros Apsauga</p>
          </div>

          <div style="padding: 24px; text-align: center; color: #1f2937; line-height: 1.6;">
            <p style="font-size: 14px;">Sveiki, ${recipientName}!</p>
            <p style="font-size: 13px; color: #475569;">Gavome prašymą patvirtinti jūsų paskyrą arba atstatyti slaptažodį.</p>

            <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #94a3b8; padding: 16px 32px; border-radius: 12px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f172a;">${code}</span>
            </div>

            <p style="font-size: 12px; color: #64748b;">Kodas galioja 15 minučių. Jei patys neprašėte šio kodo, tiesiog ignoruokite šį pranešimą.</p>
          </div>

          <div style="background-color: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Campy.lt Saugumo Komanda
          </div>
        </div>
      `;

      return { subject, recipientEmail, recipientName, contentPreview: preview, htmlBody };
    }

    case 'stay_completed_thank_you': {
      const guestName = booking?.guestName || 'Svečiui';
      const guestEmail = booking?.guestEmail || 'svecio@gmail.com';
      const subject = `🌟 Kaip praėjo jūsų viešnagė ${campsiteTitle}? Palikite atsiliepimą`;
      const preview = `Ačiū, kad lankėtės stovyklavietėje „${campsiteTitle}“! Pasidalinkite įspūdžiais ir padėkite kitiems stovyklautojams.`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #047857; padding: 22px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🌟 Ačiū, kad lankėtės!</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5;">Jūsų įspūdžiai mums labai svarbūs</p>
          </div>

          <div style="padding: 24px; color: #1f2937; line-height: 1.6; text-align: center;">
            <p style="font-size: 14px; font-weight: bold;">Labas, ${guestName}!</p>
            <p style="font-size: 13px;">Tikimės, kad viešnagė stovyklavietėje <strong>„${campsiteTitle}“</strong> paliko šiltus atsiminimus!</p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="font-size: 13px; font-weight: bold; color: #166534; margin-top: 0;">Įvertinkite savo poilsį ir šeimininką:</p>
              <div style="font-size: 24px; margin: 8px 0; color: #f59e0b;">⭐⭐⭐⭐⭐</div>
              <a href="https://campy.lt/detail/${booking?.campsiteId || ''}" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; margin-top: 8px;">Parašyti Atsiliepimą</a>
            </div>
          </div>

          <div style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            Ačiū, kad renkatės Campy.lt!
          </div>
        </div>
      `;

      return { subject, recipientEmail: guestEmail, recipientName: guestName, contentPreview: preview, htmlBody };
    }

    default: {
      return {
        subject: 'Pranešimas iš Campy.lt',
        recipientEmail: user?.email || booking?.guestEmail || 'info@campy.lt',
        recipientName: user?.name || booking?.guestName || 'Vartotojas',
        contentPreview: 'Sistemos pranešimas iš Campy.lt',
        htmlBody: '<p>Pranešimas iš Campy.lt</p>'
      };
    }
  }
}
