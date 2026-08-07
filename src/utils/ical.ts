import { Campsite, Booking, ImportedCalendarEvent } from '../types';

/**
 * Utility to format YYYY-MM-DD into iCal DTSTART/DTEND format YYYYMMDD
 */
export function formatDateToICal(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.replace(/-/g, '');
  return clean.length === 8 ? clean : '';
}

/**
 * Format iCal date string YYYYMMDD or YYYYMMDDTHHMMSSZ to YYYY-MM-DD
 */
export function parseICalDateToISO(icalDateStr: string): string {
  if (!icalDateStr) return '';
  // Strip VALUE=DATE: prefix if present
  let val = icalDateStr.trim();
  if (val.includes(':')) {
    val = val.split(':').pop() || '';
  }
  // Remove trailing Z or T specs
  val = val.split('T')[0];
  if (val.length >= 8) {
    const y = val.substring(0, 4);
    const m = val.substring(4, 6);
    const d = val.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  return '';
}

/**
 * Format timestamp to iCal DTSTAMP (YYYYMMDDTHHMMSSZ)
 */
export function getICalNowTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate RFC 5545 standard .ics content string for a campsite
 */
export function generateICalFeed(campsite: Campsite, bookings: Booking[] = []): string {
  const nowStamp = getICalNowTimestamp();
  const prodId = `-//Stovyklauk.lt//Campsite ${campsite.id}//LT`;
  
  let lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Stovyklavietė - ${campsite.title.replace(/\n/g, ' ')}`,
    `X-WR-CALDESC:Užimtumo ir rezervacijų kalendorius. Kaina nuo €${campsite.pricePerNight}/nakt.`,
    'X-WR-TIMEZONE:Europe/Vilnius'
  ];

  // 1. Add approved/pending bookings as VEVENT
  const siteBookings = bookings.filter(b => b.campsiteId === campsite.id && b.status !== 'rejected');
  siteBookings.forEach(bk => {
    const dtStart = formatDateToICal(bk.checkIn);
    // In iCal DTEND for all-day events is exclusive, so add 1 day or keep checkOut date
    const dtEnd = formatDateToICal(bk.checkOut);
    if (!dtStart || !dtEnd) return;

    lines.push(
      'BEGIN:VEVENT',
      `UID:booking-${bk.id}@stovyklauk.lt`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:Užsakyta: ${bk.guestName} (${bk.guestsCount} asm.)`,
      `DESCRIPTION:Stovyklavietės užsakymas per Stovyklauk.lt. Svečias: ${bk.guestName}, El. paštas: ${bk.guestEmail}. Bendra suma: €${bk.totalPrice}.`,
      `LOCATION:${campsite.location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  // 2. Add blocked dates ranges as VEVENT
  const blockedDates = Array.from(new Set(campsite.blockedDates || [])).sort();
  if (blockedDates.length > 0) {
    // Group consecutive dates into ranges for clean VEVENTs
    const ranges: Array<{ start: string; end: string }> = [];
    let currentStart = blockedDates[0];
    let currentPrev = blockedDates[0];

    for (let i = 1; i < blockedDates.length; i++) {
      const d = blockedDates[i];
      const prevDateObj = new Date(currentPrev);
      prevDateObj.setDate(prevDateObj.getDate() + 1);
      const expectedNext = prevDateObj.toISOString().split('T')[0];

      if (d === expectedNext) {
        currentPrev = d;
      } else {
        ranges.push({ start: currentStart, end: currentPrev });
        currentStart = d;
        currentPrev = d;
      }
    }
    ranges.push({ start: currentStart, end: currentPrev });

    ranges.forEach((r, idx) => {
      const dtStart = formatDateToICal(r.start);
      // Add 1 day to end for inclusive-to-exclusive iCal DTEND
      const endDateObj = new Date(r.end);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const dtEnd = formatDateToICal(endDateObj.toISOString().split('T')[0]);

      lines.push(
        'BEGIN:VEVENT',
        `UID:blocked-${campsite.id}-${idx}-${dtStart}@stovyklauk.lt`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `DTEND;VALUE=DATE:${dtEnd}`,
        'SUMMARY:Šeimininko Užblokuota / Not Available',
        'DESCRIPTION:Šią datą šeimininkas užblokavo (nerezervuojama per Stovyklauk.lt).',
        `LOCATION:${campsite.location}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });
  }

  // 3. Add imported external events if present
  if (campsite.importedEvents) {
    campsite.importedEvents.forEach(evt => {
      const dtStart = formatDateToICal(evt.startDate);
      const dtEnd = formatDateToICal(evt.endDate);
      if (!dtStart || !dtEnd) return;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${evt.uid || evt.id}@external-ical`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `DTEND;VALUE=DATE:${dtEnd}`,
        `SUMMARY:${evt.summary || 'Importuotas Užsakymas'} (${evt.source || 'iCal'})`,
        `DESCRIPTION:Išorinis iCal kalendoriaus įrašas. Šaltinis: ${evt.source || 'iCal'}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Parse raw .ics content into structured ImportedCalendarEvent array
 */
export function parseICalContent(icsContent: string, sourceName = 'Importuotas iCal'): ImportedCalendarEvent[] {
  const events: ImportedCalendarEvent[] = [];
  if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
    return events;
  }

  // Unfold lines that are wrapped with CRLF space or newline space (per RFC 5545)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let currentEvent: Partial<ImportedCalendarEvent> = {};
  let currentUid = '';

  for (let line of lines) {
    line = line.trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = { source: sourceName };
      currentUid = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    } else if (line === 'END:VEVENT') {
      if (inEvent && currentEvent.startDate) {
        if (!currentEvent.endDate) {
          currentEvent.endDate = currentEvent.startDate;
        }
        events.push({
          id: currentUid,
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          summary: currentEvent.summary || 'Išorinis užsakymas / Rezervacija',
          source: currentEvent.source || sourceName,
          uid: currentEvent.uid || currentUid,
        });
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        currentEvent.startDate = parseICalDateToISO(line);
      } else if (line.startsWith('DTEND')) {
        const rawEnd = parseICalDateToISO(line);
        // Note: iCal DTEND for all-day events is usually next day morning (exclusive).
        // If start != end, subtract 1 day to get checkOut date or keep as is.
        currentEvent.endDate = rawEnd;
      } else if (line.startsWith('SUMMARY')) {
        const summaryVal = line.substring(line.indexOf(':') + 1).replace(/\\,/g, ',').replace(/\\;/g, ';');
        currentEvent.summary = summaryVal;
      } else if (line.startsWith('UID')) {
        currentEvent.uid = line.substring(line.indexOf(':') + 1);
      }
    }
  }

  return events;
}

/**
 * Trigger download of .ics file in browser
 */
export function downloadICalFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sample test Airbnb / Booking.com iCal content for quick demo testing
 */
export const SAMPLE_AIRBNB_ICAL = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Airbnb - Palapinių ir Glampingo Sklypas
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260815
DTEND;VALUE=DATE:20260818
UID:airbnb-reservation-982142@airbnb.com
SUMMARY:Airbnb (Užsakyta: Jonas K.)
DESCRIPTION:Užsakymas per Airbnb.com. Naktys: 3.
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260822
DTEND;VALUE=DATE:20260825
UID:airbnb-reservation-773109@airbnb.com
SUMMARY:Airbnb (Užsakyta: Sarah M.)
DESCRIPTION:Užsakymas per Airbnb.com.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
