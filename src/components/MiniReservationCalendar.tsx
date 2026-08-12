import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Lock } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

interface MiniReservationCalendarProps {
  campsiteId: string;
  checkIn: string; // e.g., '2026-08-20'
  checkOut: string; // e.g., '2026-08-22'
  currentBookingId?: string;
  bookingStatus?: string;
  campsiteTitle?: string;
}

export const MiniReservationCalendar: React.FC<MiniReservationCalendarProps> = ({
  campsiteId,
  checkIn,
  checkOut,
  currentBookingId,
  bookingStatus = 'pending',
  campsiteTitle
}) => {
  const { campsites, bookings } = useCampsites();

  // Find target campsite
  const campsite = campsites.find(c => c.id === campsiteId);

  // Parse initial check-in date or fallback to current date
  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const initialDate = parseDate(checkIn);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Lithuanian month names
  const monthNamesLt = [
    'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
    'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'
  ];

  const weekDaysLt = ['Pr', 'Ant', 'Tre', 'Ket', 'Pen', 'Šeš', 'Sek'];

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // First day of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is index 0
  const firstDayOfWeek = (firstDayRaw + 6) % 7;

  // Filter other bookings for this campsite
  const otherBookings = bookings.filter(
    b => b.campsiteId === campsiteId && b.id !== currentBookingId && b.status !== 'rejected'
  );

  const blockedDates = campsite?.blockedDates || [];
  const importedEvents = campsite?.importedEvents || [];

  // Helper to format date string YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs font-sans space-y-3">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-900">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>Užsakymo Kalendorius ({monthNamesLt[currentMonth]} {currentYear})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            title="Ankstesnis mėnuo"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            title="Kitas mėnuo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDaysLt.map(day => (
          <span key={day} className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty padding cells for first week */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-7 rounded-lg bg-stone-50/50" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatDateStr(currentYear, currentMonth, dayNum);

          // Check if date is within requested booking range
          const isRequestedRange = dateStr >= checkIn && dateStr <= checkOut;
          const isCheckInDay = dateStr === checkIn;
          const isCheckOutDay = dateStr === checkOut;

          // Check if date overlaps with another active booking
          const overlappingOtherBooking = otherBookings.find(
            b => dateStr >= b.checkIn && dateStr <= b.checkOut
          );

          // Check if date is manually blocked
          const isBlocked = blockedDates.includes(dateStr);

          // Check if date has iCal sync
          const isICalSynced = importedEvents.some(
            e => dateStr >= e.startDate && dateStr <= e.endDate
          );

          // Style classes determination
          let cellStyle = 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-150';
          let labelBadge = null;

          if (isRequestedRange) {
            if (bookingStatus === 'pending' || bookingStatus === 'free_inquiry') {
              cellStyle = 'bg-amber-400 text-amber-950 font-black ring-2 ring-amber-500/70 border-amber-500 z-10';
            } else if (bookingStatus === 'approved' || bookingStatus === 'confirmed') {
              cellStyle = 'bg-emerald-600 text-white font-black ring-2 ring-emerald-500 border-emerald-700 z-10';
            } else if (bookingStatus === 'rejected') {
              cellStyle = 'bg-rose-100 text-rose-800 line-through border-rose-300 font-bold';
            }
            if (isCheckInDay && isCheckOutDay) labelBadge = 'In/Out';
            else if (isCheckInDay) labelBadge = 'In';
            else if (isCheckOutDay) labelBadge = 'Out';
          } else if (overlappingOtherBooking) {
            cellStyle = 'bg-emerald-100 text-emerald-950 font-bold border-emerald-300';
          } else if (isBlocked) {
            cellStyle = 'bg-stone-200 text-stone-500 line-through border-stone-300';
          } else if (isICalSynced) {
            cellStyle = 'bg-purple-100 text-purple-950 font-bold border-purple-300';
          }

          return (
            <div
              key={dateStr}
              className={`h-7 rounded-lg text-[11px] flex flex-col items-center justify-center relative transition-all ${cellStyle}`}
              title={
                isRequestedRange
                  ? `Prašoma data (${checkIn} — ${checkOut})`
                  : overlappingOtherBooking
                  ? `Kita rez.: ${overlappingOtherBooking.guestName} (${overlappingOtherBooking.status})`
                  : isBlocked
                  ? 'Užblokuota data'
                  : isICalSynced
                  ? 'iCal išorinė rezervacija'
                  : `${dateStr} — Laisva`
              }
            >
              <span>{dayNum}</span>
              {labelBadge && (
                <span className="text-[7px] leading-tight uppercase font-black tracking-tighter opacity-90 -mt-0.5">
                  {labelBadge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Context Note */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-[10px] gap-2 font-medium text-stone-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block shrink-0"></span>
          <span>Prašomos datos ({checkIn} — {checkOut})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300 inline-block shrink-0"></span>
          <span>Kiti užsakymai</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-100 border border-stone-300 inline-block shrink-0"></span>
          <span>Laisva</span>
        </div>
      </div>
    </div>
  );
};
