import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, AlertCircle, RefreshCw } from 'lucide-react';

interface DateRangePickerProps {
  campsiteId: string;
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  onSelectDates: (checkIn: string, checkOut: string) => void;
  isDateBlocked: (campsiteId: string, dateStr: string) => boolean;
  className?: string;
  compact?: boolean;
}

const LITHUANIAN_MONTHS = [
  'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
  'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'
];

const WEEKDAY_NAMES = ['Pr', 'An', 'Tr', 'Kt', 'Pen', 'Šė', 'Se'];

// Helper functions for safe local date parsing without timezone bugs
export function parseIsoDate(isoStr: string): Date | null {
  if (!isoStr) return null;
  const parts = isoStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  campsiteId,
  checkIn,
  checkOut,
  onSelectDates,
  isDateBlocked,
  className = '',
  compact = false
}) => {
  // Current visible month/year
  const initialDate = parseIsoDate(checkIn) || new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11

  // Hover state for range preview
  const [hoverDateIso, setHoverDateIso] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month Navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Days calculations for current month grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  // Convert Sun-0 to Mon-0 index (Mon=0, Tue=1 ... Sun=6)
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Range helper checks
  const checkInDate = parseIsoDate(checkIn);
  const checkOutDate = parseIsoDate(checkOut);

  // Check if a date string is within the currently selected range
  const isInSelectedRange = (dateIso: string) => {
    if (!checkIn || !checkOut) return false;
    return dateIso > checkIn && dateIso < checkOut;
  };

  // Check if a date string is in the hovered preview range
  const isInHoverRange = (dateIso: string) => {
    if (!checkIn || checkOut || !hoverDateIso) return false;
    if (hoverDateIso <= checkIn) return false;
    return dateIso > checkIn && dateIso < hoverDateIso;
  };

  // Handle Day Click
  const handleDayClick = (dateIso: string) => {
    setWarningMessage(null);
    const clickedDate = parseIsoDate(dateIso)!;

    // 1. If clicking a blocked date, show warning
    if (isDateBlocked(campsiteId, dateIso)) {
      setWarningMessage('Ši data jau rezervuota ir negali būti pasirinkta.');
      return;
    }

    // 2. If no checkIn selected OR both checkIn and checkOut are selected -> Start new range
    if (!checkIn || (checkIn && checkOut)) {
      onSelectDates(dateIso, '');
      return;
    }

    // 3. If checkIn selected but no checkOut yet
    if (checkIn && !checkOut) {
      if (dateIso === checkIn) {
        // Clicking same day resets checkIn
        onSelectDates('', '');
        return;
      }

      if (dateIso < checkIn) {
        // Clicked date is before current checkIn -> set new checkIn
        onSelectDates(dateIso, '');
        return;
      }

      // Check if any blocked dates exist between checkIn and dateIso
      let hasBlockedInRange = false;
      const start = parseIsoDate(checkIn)!;
      const end = new Date(clickedDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const curIso = toIsoDate(d);
        if (isDateBlocked(campsiteId, curIso)) {
          hasBlockedInRange = true;
          break;
        }
      }

      if (hasBlockedInRange) {
        setWarningMessage('Pasirinktame laikotarpyje yra jau rezervuotų dienų! Pasirinkite kitas datas.');
        // Reset checkIn to clicked date
        onSelectDates(dateIso, '');
        return;
      }

      // Valid checkOut selection
      onSelectDates(checkIn, dateIso);
    }
  };

  // Quick Select Helpers
  const handleSelectWeekend = () => {
    setWarningMessage(null);
    // Find upcoming Friday
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 = Sun
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    const friday = new Date(d);
    friday.setDate(d.getDate() + daysUntilFriday);

    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    const friIso = toIsoDate(friday);
    const sunIso = toIsoDate(sunday);

    if (isDateBlocked(campsiteId, friIso) || isDateBlocked(campsiteId, sunIso)) {
      setWarningMessage('Ateinantis savaitgalis jau rezervuotas.');
      return;
    }

    setCurrentYear(friday.getFullYear());
    setCurrentMonth(friday.getMonth());
    onSelectDates(friIso, sunIso);
  };

  const handleClear = () => {
    setWarningMessage(null);
    onSelectDates('', '');
  };

  return (
    <div className={`bg-white rounded-2xl border border-emerald-200/90 p-4 shadow-sm font-sans space-y-3 ${className}`}>
      
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
          title="Ankstesnis mėnuo"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="font-extrabold text-sm text-gray-900 tracking-tight">
            {LITHUANIAN_MONTHS[currentMonth]} {currentYear}
          </span>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
          title="Kitas mėnuo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_NAMES.map((wm, i) => (
          <div key={wm} className={`text-[10px] font-extrabold uppercase ${i >= 5 ? 'text-amber-700' : 'text-gray-400'}`}>
            {wm}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Blank Padding cells */}
        {Array.from({ length: paddingDays }).map((_, idx) => (
          <div key={`pad-${idx}`} className="h-9" />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateObj = new Date(currentYear, currentMonth, dayNum);
          dateObj.setHours(0, 0, 0, 0);
          const dateIso = toIsoDate(dateObj);

          const isPast = dateObj < today;
          const isBlocked = isDateBlocked(campsiteId, dateIso);
          const isStart = dateIso === checkIn;
          const isEnd = dateIso === checkOut;
          const inRange = isInSelectedRange(dateIso);
          const inHover = isInHoverRange(dateIso);

          let cellStyle = 'bg-white text-gray-800 hover:bg-emerald-50 border-gray-200 cursor-pointer';

          if (isPast) {
            cellStyle = 'bg-gray-50/80 text-gray-300 cursor-not-allowed border-transparent';
          } else if (isBlocked) {
            cellStyle = 'bg-rose-50/90 text-rose-400 border-rose-200/60 line-through cursor-not-allowed font-medium';
          } else if (isStart || isEnd) {
            cellStyle = 'bg-emerald-700 text-white font-black shadow-md border-emerald-800 rounded-xl scale-105 z-10';
          } else if (inRange) {
            cellStyle = 'bg-emerald-100/90 text-emerald-950 font-bold border-y border-emerald-300/80 rounded-none';
          } else if (inHover) {
            cellStyle = 'bg-emerald-50 text-emerald-900 font-semibold border-y border-dashed border-emerald-400 rounded-none';
          }

          return (
            <button
              key={dateIso}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(dateIso)}
              onMouseEnter={() => !isPast && !isBlocked && setHoverDateIso(dateIso)}
              onMouseLeave={() => setHoverDateIso(null)}
              className={`h-9 relative flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all border ${cellStyle}`}
              title={
                isBlocked
                  ? `Ši data užimta (${dateIso})`
                  : isPast
                  ? `Praėjusi data (${dateIso})`
                  : `Pasirinkti ${dateIso}`
              }
            >
              <span>{dayNum}</span>

              {/* Status Badge Indicator Dot */}
              {isBlocked && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1" />
              )}
              {(isStart || isEnd) && (
                <span className="w-1 h-1 rounded-full bg-amber-300 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Warning message banner */}
      {warningMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="leading-tight">{warningMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Calendar Bottom Controls & Legend */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] gap-2 flex-wrap">
        
        {/* Legend */}
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Pasirinkta</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <span>Užimta</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300 inline-block" />
            <span>Laisva</span>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleSelectWeekend}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 cursor-pointer transition-colors"
          >
            Savaitgalis
          </button>
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-gray-500" />
              <span>Valyti</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
