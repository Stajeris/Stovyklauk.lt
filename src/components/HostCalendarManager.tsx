import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Upload, Link, 
  RefreshCw, Check, X, DollarSign, Lock, Unlock, AlertCircle, Plus, Trash2, 
  FileText, Copy, Sparkles, ExternalLink, ShieldCheck, Tag, Info, Crown,
  User, Mail, Phone, Clock, CheckCircle2, XCircle, MessageSquare, Eye, CreditCard, Send, Building2
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, ICalSyncFeed, ImportedCalendarEvent, Booking } from '../types';
import { 
  generateICalFeed, 
  parseICalContent, 
  downloadICalFile, 
  SAMPLE_AIRBNB_ICAL 
} from '../utils/ical';

interface HostCalendarManagerProps {
  campsites: Campsite[];
  selectedCampsiteId?: string;
  isAdminView?: boolean;
}

export const HostCalendarManager: React.FC<HostCalendarManagerProps> = ({ 
  campsites, 
  selectedCampsiteId: initialCampsiteId,
  isAdminView = false
}) => {
  const { 
    updateCampsite, 
    bookings, 
    hostTier, 
    setHostTier, 
    updateBookingStatus, 
    releaseEscrowPayout,
    chatThreads,
    currentUser,
    t 
  } = useCampsites();

  // Active campsite selection ('all' or specific campsite ID)
  const [activeCampsiteId, setActiveCampsiteId] = useState<string>(
    initialCampsiteId && campsites.some(c => c.id === initialCampsiteId)
      ? initialCampsiteId
      : isAdminView && campsites.length > 1
        ? 'all'
        : campsites[0]?.id || 'all'
  );

  // Active campsite object (null if 'all')
  const activeCampsite = campsites.find(c => c.id === activeCampsiteId) || (activeCampsiteId === 'all' ? null : campsites[0]);

  // Calendar view navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'import' | 'export' | 'raw_editor'>('calendar');

  // Date range selection state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Modals & Notifications
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isSettingPriceModalOpen, setIsSettingPriceModalOpen] = useState<boolean>(false);
  const [manualEventSummary, setManualEventSummary] = useState<string>('');
  const [isManualEventModalOpen, setIsManualEventModalOpen] = useState<boolean>(false);

  // Order Handling Modal state
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null);
  const [calendarToast, setCalendarToast] = useState<string | null>(null);

  // iCal Import states
  const [externalFeedUrl, setExternalFeedUrl] = useState<string>('');
  const [externalFeedName, setExternalFeedName] = useState<string>('Airbnb Calendar');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Raw .ics editor content
  const [rawIcsContent, setRawIcsContent] = useState<string>('');
  const [copySuccessNotification, setCopySuccessNotification] = useState<string | null>(null);

  // Quick toast notification helper
  const showToast = (msg: string) => {
    setCalendarToast(msg);
    setTimeout(() => setCalendarToast(null), 3500);
  };

  // Generate date calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentMonthDate(new Date());

  // Month name formatting
  const monthName = currentMonthDate.toLocaleDateString('lt-LT', { month: 'long', year: 'numeric' });

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Sunday=0 -> Monday=0

  // Format YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Generate calendar grid dates
  const calendarCells = useMemo(() => {
    const cells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      cells.push({
        dateStr: formatDateStr(prevY, prevM, pDay),
        dayNum: pDay,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        dateStr: formatDateStr(year, month, d),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      cells.push({
        dateStr: formatDateStr(nextY, nextM, d),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  if (campsites.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-150">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-700">Neturite įkeltų stovyklaviečių.</p>
      </div>
    );
  }

  // Active bookings list
  const activeBookings = useMemo(() => {
    if (activeCampsiteId === 'all') {
      const validCampsiteIds = new Set(campsites.map(c => c.id));
      return bookings.filter(b => validCampsiteIds.has(b.campsiteId));
    }
    return bookings.filter(b => b.campsiteId === activeCampsiteId);
  }, [bookings, activeCampsiteId, campsites]);

  // Helper to get all events & bookings for a specific date
  const getDateDetails = (dateStr: string) => {
    // 1. Guest bookings matching date
    const dateBookings = activeBookings.filter(b => dateStr >= b.checkIn && dateStr <= b.checkOut);

    // 2. Imported iCal events
    const importedEventsList = activeCampsiteId === 'all'
      ? campsites.flatMap(c => c.importedEvents || [])
      : (activeCampsite?.importedEvents || []);
    const dateImported = importedEventsList.filter(e => dateStr >= e.startDate && dateStr <= e.endDate);

    // 3. Blocked status
    const isBlocked = activeCampsiteId === 'all'
      ? campsites.some(c => c.blockedDates?.includes(dateStr))
      : (activeCampsite?.blockedDates?.includes(dateStr) || false);

    // 4. Custom price
    const customPrice = activeCampsite ? activeCampsite.customPrices?.[dateStr] : null;
    const defaultPrice = activeCampsite ? activeCampsite.pricePerNight : campsites[0]?.pricePerNight || 30;

    return {
      dateBookings,
      dateImported,
      isBlocked,
      price: customPrice ?? defaultPrice,
    };
  };

  // Order handling actions
  const handleApproveOrder = (bookingId: string, guestName: string) => {
    updateBookingStatus(bookingId, 'approved');
    showToast(`✅ Užsakymas patvirtintas! Svečias ${guestName} gaus pranešimą.`);
  };

  const handleRejectOrder = (bookingId: string, guestName: string) => {
    updateBookingStatus(bookingId, 'rejected');
    showToast(`❌ Užsakymas atmestas ir lėšos grąžintos svečiui ${guestName}.`);
  };

  const handleCompleteOrder = (bookingId: string, guestName: string) => {
    updateBookingStatus(bookingId, 'completed');
    showToast(`🏁 Viešnagė pažymėta kaip įvykdyta! Stripe išmoka atversta.`);
  };

  const handleReleaseEscrow = (bookingId: string) => {
    releaseEscrowPayout(bookingId);
    showToast(`⚡ Stripe Escrow išmoka sėkmingai pervesta šeimininkui!`);
  };

  // Date selection click handler for blocking / custom pricing
  const handleDateClick = (dateStr: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      setSelectedDates([dateStr]);
    } else {
      if (dateStr >= rangeStart) {
        setRangeEnd(dateStr);
        const start = new Date(rangeStart);
        const end = new Date(dateStr);
        const list: string[] = [];
        let curr = new Date(start);
        while (curr <= end) {
          list.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }
        setSelectedDates(list);
      } else {
        setRangeStart(dateStr);
        setRangeEnd(null);
        setSelectedDates([dateStr]);
      }
    }
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setRangeStart(null);
    setRangeEnd(null);
  };

  // Block or unblock selected dates
  const handleBlockSelectedDates = (block: boolean) => {
    if (selectedDates.length === 0 || !activeCampsite) return;
    const currentBlocked = new Set(activeCampsite.blockedDates || []);
    selectedDates.forEach(d => {
      if (block) currentBlocked.add(d);
      else currentBlocked.delete(d);
    });

    updateCampsite(activeCampsite.id, {
      blockedDates: Array.from(currentBlocked),
    });

    clearSelection();
    showToast(block ? `🔒 Pasirinktos ${selectedDates.length} d. užblokuotos.` : `🔓 Pasirinktos ${selectedDates.length} d. atblokuotos.`);
  };

  // Apply custom price for selected dates
  const handleApplyCustomPrice = () => {
    if (!activeCampsite) return;
    const priceNum = parseFloat(customPriceInput);
    if (isNaN(priceNum) || priceNum < 0 || selectedDates.length === 0) return;

    const currentPrices = { ...(activeCampsite.customPrices || {}) };
    selectedDates.forEach(d => {
      currentPrices[d] = priceNum;
    });

    updateCampsite(activeCampsite.id, {
      customPrices: currentPrices,
    });

    setIsSettingPriceModalOpen(false);
    setCustomPriceInput('');
    clearSelection();
    showToast(`💰 Nustatyta €${priceNum}/nakt. kaina pasirinktoms dienoms.`);
  };

  const handleRemoveCustomPrice = () => {
    if (!activeCampsite || selectedDates.length === 0) return;
    const currentPrices = { ...(activeCampsite.customPrices || {}) };
    selectedDates.forEach(d => {
      delete currentPrices[d];
    });

    updateCampsite(activeCampsite.id, {
      customPrices: currentPrices,
    });

    clearSelection();
    showToast(`Atkurta standartinė kaina.`);
  };

  const handleAddManualReservation = () => {
    if (!activeCampsite || selectedDates.length === 0 || !manualEventSummary.trim()) return;
    const sorted = [...selectedDates].sort();
    const newEvent: ImportedCalendarEvent = {
      id: `manual-${Date.now()}`,
      startDate: sorted[0],
      endDate: sorted[sorted.length - 1],
      summary: manualEventSummary.trim(),
      source: 'Rankinis Įrašas',
      uid: `manual-res-${Date.now()}@campy.lt`,
    };

    const currentEvents = [...(activeCampsite.importedEvents || []), newEvent];
    updateCampsite(activeCampsite.id, {
      importedEvents: currentEvents,
    });

    setIsManualEventModalOpen(false);
    setManualEventSummary('');
    clearSelection();
    showToast(`✨ Pridėtas rankinis užsakymas: ${manualEventSummary}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCampsite) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importICalContentToActiveCampsite(content, file.name.replace('.ics', ''));
      }
    };
    reader.readAsText(file);
  };

  const importICalContentToActiveCampsite = (icsString: string, sourceName: string) => {
    const targetSite = activeCampsite || campsites[0];
    if (!targetSite) return;

    const events = parseICalContent(icsString, sourceName);
    if (events.length === 0) {
      setImportNotification('❌ Nepavyko rasti galiojančių VEVENT įrašų šiame .ics faile.');
      return;
    }

    const existing = targetSite.importedEvents || [];
    const merged = [...existing];

    events.forEach(ev => {
      const isDuplicate = merged.some(
        m => m.uid === ev.uid || (m.startDate === ev.startDate && m.endDate === ev.endDate)
      );
      if (!isDuplicate) {
        merged.push(ev);
      }
    });

    updateCampsite(targetSite.id, {
      importedEvents: merged,
    });

    setImportNotification(`✅ Importuota ${events.length} užsakymų iš "${sourceName}"!`);
    setTimeout(() => setImportNotification(null), 6000);
  };

  const handleLoadSampleAirbnbICal = () => {
    importICalContentToActiveCampsite(SAMPLE_AIRBNB_ICAL, 'Airbnb (Pavyzdinis)');
  };

  const handleAddExternalFeedUrl = () => {
    if (!externalFeedUrl.trim() || !activeCampsite) return;
    const newFeed: ICalSyncFeed = {
      id: `feed-${Date.now()}`,
      name: externalFeedName.trim() || 'Išorinis iCal',
      url: externalFeedUrl.trim(),
      lastSynced: new Date().toLocaleString('lt-LT'),
      itemCount: Math.floor(Math.random() * 5) + 1,
    };

    const currentFeeds = [...(activeCampsite.icalSyncUrls || []), newFeed];
    updateCampsite(activeCampsite.id, {
      icalSyncUrls: currentFeeds,
    });

    importICalContentToActiveCampsite(SAMPLE_AIRBNB_ICAL, newFeed.name);
    setExternalFeedUrl('');
    setExternalFeedName('Airbnb Calendar');
  };

  const handleRemoveFeed = (feedId: string) => {
    if (!activeCampsite) return;
    const updated = (activeCampsite.icalSyncUrls || []).filter(f => f.id !== feedId);
    updateCampsite(activeCampsite.id, { icalSyncUrls: updated });
  };

  const handleRemoveImportedEvent = (eventId: string) => {
    if (!activeCampsite) return;
    const updated = (activeCampsite.importedEvents || []).filter(e => e.id !== eventId);
    updateCampsite(activeCampsite.id, { importedEvents: updated });
  };

  // Live iCal export content
  const currentICalFeedText = useMemo(() => {
    const site = activeCampsite || campsites[0];
    return site ? generateICalFeed(site, activeBookings.filter(b => b.campsiteId === site.id && b.status !== 'rejected')) : '';
  }, [activeCampsite, campsites, activeBookings]);

  const liveICalExportUrl = activeCampsite 
    ? `https://campy.lt/api/ical/${activeCampsite.id}.ics?token=${activeCampsite.icalExportToken || 'campsite-key-2026'}`
    : `https://campy.lt/api/ical/all-properties.ics`;

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessNotification(msg);
    setTimeout(() => setCopySuccessNotification(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 font-sans relative">
      
      {/* Toast Notification */}
      {calendarToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{calendarToast}</span>
        </div>
      )}

      {/* Header & Listing Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-extrabold text-gray-900">
              {isAdminView ? 'Sistemos Užsakymų & iCal Kalendorius' : 'Užimtumo ir iCal Kalendorius'}
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
              iCalendar / Live Orders
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Užveskite pelės žymeklį ant užsakymo dienų, kad pamatytumėte išsamią svečio informaciją ir lengvai valdytumėte užsakymo būsenas.
          </p>
        </div>

        {/* Listing Selector */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-500 pl-2 shrink-0">Filtras / Objektai:</label>
          <select
            value={activeCampsiteId}
            onChange={(e) => {
              setActiveCampsiteId(e.target.value);
              clearSelection();
            }}
            className="bg-white text-gray-900 font-bold text-xs py-2 px-3 rounded-xl border border-gray-200 focus:outline-hidden cursor-pointer"
          >
            {campsites.length > 1 && (
              <option value="all">🌐 Visi Objektai ({campsites.length})</option>
            )}
            {campsites.map(site => (
              <option key={site.id} value={site.id}>
                {site.title} (€{site.pricePerNight}/nakt.)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'calendar'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Mėnesio Kalendorius ir Užsakymai</span>
        </button>

        <button
          onClick={() => setActiveSubTab('import')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'import'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>iCal Importas & Sinchronizacija</span>
          <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
            <Crown className="w-2.5 h-2.5" /> PRO
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('export')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'export'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Eksportuoti iCal Nuorodą</span>
        </button>

        <button
          onClick={() => {
            setRawIcsContent(currentICalFeedText);
            setActiveSubTab('raw_editor');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'raw_editor'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>.ics Tekstinis Redaktorius</span>
        </button>
      </div>

      {/* SUB-TAB 1: MONTH CALENDAR GRID */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-5">
          
          {/* Month Navigation & Legend Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                title="Ankstesnis mėnuo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black text-gray-900 capitalize px-2 min-w-[160px] text-center sm:text-left">
                {monthName}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                title="Kitas mėnuo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer ml-2"
              >
                Šiandien
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-700">
              <span className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Laukiama Patvirtinimo</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Patvirtintas Užsakymas</span>
              </span>
              <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-blue-900">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Atvykęs / Įvykdyta</span>
              </span>
              <span className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 text-purple-900">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>iCal / Išorinis Sync</span>
              </span>
            </div>
          </div>

          {/* Action Bar for Selected Dates */}
          {selectedDates.length > 0 && activeCampsite && (
            <div className="p-4 bg-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">
                  Pasirinkta {selectedDates.length} d. ({selectedDates[0]} {selectedDates.length > 1 ? `iki ${selectedDates[selectedDates.length - 1]}` : ''})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBlockSelectedDates(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Užblokuoti</span>
                </button>

                <button
                  onClick={() => handleBlockSelectedDates(false)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Atblokuoti</span>
                </button>

                <button
                  onClick={() => setIsSettingPriceModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Sezoninė Kaina</span>
                </button>

                <button
                  onClick={() => setIsManualEventModalOpen(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rankinis Įrašas</span>
                </button>

                <button
                  onClick={clearSelection}
                  className="p-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-xl cursor-pointer"
                  title="Atšaukti pasirinkimą"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Modal: Custom Price */}
          {isSettingPriceModalOpen && activeCampsite && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-extrabold text-gray-900 text-base">Nustatyti Sezoninę / Specialią Kainą</h4>
                  <button onClick={() => setIsSettingPriceModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Nustatykite individualią paros nakvynės kainą pasirinktoms {selectedDates.length} dienoms. Standartinė kaina: €{activeCampsite.pricePerNight}/nakt.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kaina už naktį (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-400">€</span>
                    <input
                      type="number"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      placeholder={String(activeCampsite.pricePerNight)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleApplyCustomPrice}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Taikyti Kainą
                  </button>
                  <button
                    onClick={handleRemoveCustomPrice}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Atkurti Standartinę
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Manual Event Addition */}
          {isManualEventModalOpen && activeCampsite && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-extrabold text-gray-900 text-base">Pridėti Išorinį Užsakymą / Pastabą</h4>
                  <button onClick={() => setIsManualEventModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Įveskite rezervacijos pavadinimą arba pastabą (pvz. "Airbnb: Petras", "Sodybos priežiūra"). Šis įrašas bus užblokuotas ir eksportuojamas į iCal.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Įrašo Pavadinimas
                  </label>
                  <input
                    type="text"
                    value={manualEventSummary}
                    onChange={(e) => setManualEventSummary(e.target.value)}
                    placeholder="Pvz. Rezervacija iš kito kanalo"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleAddManualReservation}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Išsaugoti Įrašą
                </button>
              </div>
            </div>
          )}

          {/* Main Month Calendar Grid */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs bg-gray-100">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-gray-100 text-center text-xs font-bold text-gray-600 border-b border-gray-200 py-2.5 uppercase tracking-wider">
              <div>Pir</div>
              <div>Ant</div>
              <div>Tre</div>
              <div>Ket</div>
              <div>Pen</div>
              <div>Šeš</div>
              <div>Sek</div>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
              {calendarCells.map((cell, idx) => {
                const details = getDateDetails(cell.dateStr);
                const isSelected = selectedDates.includes(cell.dateStr);
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                // Positioning logic for hover popover tooltip
                const isTopTwoRows = idx < 14;
                const colIdx = idx % 7;
                const popoverPosClass = `${
                  isTopTwoRows ? 'top-full mt-2' : 'bottom-full mb-2'
                } ${
                  colIdx <= 1 
                    ? 'left-0 translate-x-0' 
                    : colIdx >= 5 
                      ? 'right-0 left-auto translate-x-0' 
                      : 'left-1/2 -translate-x-1/2'
                }`;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(cell.dateStr)}
                    className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 bg-white flex flex-col justify-between cursor-pointer transition-all relative group ${
                      !cell.isCurrentMonth ? 'opacity-40 bg-gray-50' : 'hover:bg-emerald-50/50'
                    } ${isSelected ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-50' : ''}`}
                  >
                    {/* Top Row: Day Number */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs' 
                          : cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {/* Custom Price Indicator */}
                      {activeCampsite?.customPrices?.[cell.dateStr] && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded-md border border-amber-200">
                          €{details.price}
                        </span>
                      )}
                    </div>

                    {/* Bookings / Events Badges Container */}
                    <div className="mt-1 space-y-1">
                      
                      {/* Active Guest Bookings */}
                      {details.dateBookings.map((bk) => {
                        const isPending = bk.status === 'pending';
                        const isApproved = bk.status === 'approved';
                        const isCompleted = bk.status === 'completed';
                        const isRejected = bk.status === 'rejected';

                        const badgeColorClass = isPending
                          ? 'bg-amber-100 border-amber-300 text-amber-950 font-extrabold'
                          : isApproved
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-extrabold'
                            : isCompleted
                              ? 'bg-blue-100 border-blue-300 text-blue-950 font-extrabold'
                              : 'bg-rose-100 border-rose-300 text-rose-950 font-bold';

                        return (
                          <div key={bk.id} className="relative group/booking">
                            {/* Visual Cell Badge */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBookingForModal(bk);
                              }}
                              className={`p-1.5 rounded-xl border text-[10px] leading-tight flex items-center justify-between gap-1 shadow-2xs hover:scale-102 transition-transform cursor-pointer ${badgeColorClass}`}
                            >
                              <div className="flex items-center gap-1 min-w-0">
                                {isPending && <Clock className="w-3 h-3 text-amber-700 shrink-0 animate-pulse" />}
                                {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />}
                                {isCompleted && <ShieldCheck className="w-3 h-3 text-blue-700 shrink-0" />}
                                {isRejected && <XCircle className="w-3 h-3 text-rose-700 shrink-0" />}
                                <span className="truncate font-black">{bk.guestName}</span>
                              </div>
                              <span className="text-[9px] font-mono shrink-0 opacity-80">€{bk.totalPrice}</span>
                            </div>

                            {/* HOVER TOOLTIP POPOVER (Easy Order Handling) */}
                            <div 
                              className={`absolute z-50 ${popoverPosClass} w-72 sm:w-80 p-4 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 opacity-0 pointer-events-none group-hover/booking:opacity-100 group-hover/booking:pointer-events-auto transition-all duration-200 text-xs font-sans space-y-3`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Tooltip Header */}
                              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    isPending 
                                      ? 'bg-amber-400 text-amber-950' 
                                      : isApproved 
                                        ? 'bg-emerald-400 text-emerald-950' 
                                        : isCompleted 
                                          ? 'bg-blue-400 text-blue-950' 
                                          : 'bg-rose-400 text-rose-950'
                                  }`}>
                                    {isPending ? '🟡 Laukiama' : isApproved ? '🟢 Patvirtinta' : isCompleted ? '🔵 Įvykdyta' : '🔴 Atšaukta'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">#{bk.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400">{bk.campsiteTitle}</span>
                              </div>

                              {/* Guest Contact Card */}
                              <div className="space-y-1 bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-2 font-bold text-gray-100">
                                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>{bk.guestName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <a href={`mailto:${bk.guestEmail}`} className="hover:underline">{bk.guestEmail}</a>
                                </div>
                                {bk.guestPhone && (
                                  <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <a href={`tel:${bk.guestPhone}`} className="hover:underline font-mono">{bk.guestPhone}</a>
                                  </div>
                                )}
                              </div>

                              {/* Dates & Pricing Details */}
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-gray-800/50 p-2 rounded-lg">
                                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Laikotarpis</span>
                                  <span className="font-bold text-emerald-300">{bk.checkIn} ➔ {bk.checkOut}</span>
                                  <span className="text-[10px] text-gray-400 block">({bk.totalNights || 1} nakt.)</span>
                                </div>
                                <div className="bg-gray-800/50 p-2 rounded-lg">
                                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Mokėjimas</span>
                                  <span className="font-black text-white">€{bk.totalPrice}</span>
                                  <span className="text-[10px] text-emerald-400 font-bold block">Šeimininkui: €{bk.hostPayoutAmount || Math.round(bk.totalPrice * 0.9)}</span>
                                </div>
                              </div>

                              {/* Note if available */}
                              {bk.guestNote && (
                                <div className="text-[10px] italic bg-amber-950/40 text-amber-200 p-2 rounded-lg border border-amber-900/50">
                                  "{bk.guestNote}"
                                </div>
                              )}

                              {/* EASY ORDER HANDLING ACTION BUTTONS */}
                              <div className="pt-2 border-t border-gray-800 flex flex-wrap gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApproveOrder(bk.id, bk.guestName)}
                                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Patvirtinti</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(bk.id, bk.guestName)}
                                      className="py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Atmesti</span>
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <>
                                    <button
                                      onClick={() => handleCompleteOrder(bk.id, bk.guestName)}
                                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>Atvykimas (Išmoka)</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(bk.id, bk.guestName)}
                                      className="py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Atšaukti</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => setSelectedBookingForModal(bk)}
                                  className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-gray-700 mt-1"
                                >
                                  <Eye className="w-3 h-3 text-amber-400" />
                                  <span>Valdyti Užsakymą & Sąskaitą</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Imported iCal Events */}
                      {details.dateImported.map(evt => (
                        <div 
                          key={evt.id}
                          className="p-1 rounded-lg bg-purple-100 border border-purple-300 text-purple-950 text-[10px] font-bold leading-tight truncate flex items-center gap-1"
                          title={`${evt.source || 'iCal'}: ${evt.summary} (${evt.startDate} - ${evt.endDate})`}
                        >
                          <span className="truncate">🌐 {evt.summary}</span>
                        </div>
                      ))}

                      {/* Blocked Date Badge */}
                      {details.isBlocked && details.dateBookings.length === 0 && (
                        <div className="p-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 text-[10px] font-bold leading-tight">
                          <span>❌ Užblokuota</span>
                        </div>
                      )}

                      {/* Standard Price Badge if available */}
                      {!details.isBlocked && details.dateBookings.length === 0 && details.dateImported.length === 0 && (
                        <div className="text-[10px] text-gray-400 font-semibold mt-1">
                          €{details.price}/nakt.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULL ORDER HANDLING MODAL */}
      {selectedBookingForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-gray-100 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedBookingForModal.status === 'pending'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : selectedBookingForModal.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : selectedBookingForModal.status === 'completed'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {selectedBookingForModal.status === 'pending' ? '🟡 Laukiama Patvirtinimo' : selectedBookingForModal.status === 'approved' ? '🟢 Patvirtinta' : selectedBookingForModal.status === 'completed' ? '🔵 Įvykdyta (Atversta Išmoka)' : '🔴 Atšaukta'}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">#{selectedBookingForModal.id}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">{selectedBookingForModal.campsiteTitle}</h3>
                <p className="text-xs text-gray-500">{selectedBookingForModal.location}</p>
              </div>
              <button 
                onClick={() => setSelectedBookingForModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Contact Card */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">Svečio Kontaktiniai Duomenys</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-gray-900">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{selectedBookingForModal.guestName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <a href={`mailto:${selectedBookingForModal.guestEmail}`} className="hover:underline font-medium">{selectedBookingForModal.guestEmail}</a>
                </div>
                {selectedBookingForModal.guestPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <a href={`tel:${selectedBookingForModal.guestPhone}`} className="hover:underline font-mono font-bold">{selectedBookingForModal.guestPhone}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Svečių skaičius: <strong>{selectedBookingForModal.guestsCount} asm.</strong></span>
                </div>
              </div>
            </div>

            {/* Stay Dates & Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">Rezervacijos Laikotarpis</span>
                <div className="text-sm font-black text-gray-900">
                  {selectedBookingForModal.checkIn} ➔ {selectedBookingForModal.checkOut}
                </div>
                <p className="text-xs text-emerald-700 font-bold">{selectedBookingForModal.totalNights || 1} nakvynės</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">Suma & Stripe Escrow</span>
                <div className="text-lg font-black text-emerald-800">
                  €{selectedBookingForModal.totalPrice.toFixed(2)}
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Šeimininko dalis: <strong>€{(selectedBookingForModal.hostPayoutAmount || selectedBookingForModal.totalPrice * 0.9).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Guest Special Request Note */}
            {selectedBookingForModal.guestNote && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">Svečio Pastaba / Užklausa</span>
                <p className="text-xs text-amber-950 italic">"{selectedBookingForModal.guestNote}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {selectedBookingForModal.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApproveOrder(selectedBookingForModal.id, selectedBookingForModal.guestName);
                      setSelectedBookingForModal(null);
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Patvirtinti Užsakymą</span>
                  </button>

                  <button
                    onClick={() => {
                      handleRejectOrder(selectedBookingForModal.id, selectedBookingForModal.guestName);
                      setSelectedBookingForModal(null);
                    }}
                    className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Atmesti</span>
                  </button>
                </>
              )}

              {selectedBookingForModal.status === 'approved' && (
                <>
                  <button
                    onClick={() => {
                      handleCompleteOrder(selectedBookingForModal.id, selectedBookingForModal.guestName);
                      setSelectedBookingForModal(null);
                    }}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Registruoti Atvykimą & Atversti Išmoką</span>
                  </button>

                  <button
                    onClick={() => {
                      handleRejectOrder(selectedBookingForModal.id, selectedBookingForModal.guestName);
                      setSelectedBookingForModal(null);
                    }}
                    className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Atšaukti Užsakymą</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedBookingForModal(null)}
                className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer ml-auto"
              >
                Uždaryti
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: iCAL IMPORT & SYNCHRONIZATION */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white space-y-2 border border-emerald-800">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Dvikryptis Kalendorių Sinchronizavimas</span>
            </div>
            <h3 className="text-xl font-black text-white">Importuokite iCal / .ics failus arba URL nuorodas</h3>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
              Išvenkite dvigubų užsakymų importuodami savo Airbnb, Booking.com, Vrbo ar Google kalendoriaus .ics failą arba pateikdami iCal URL feed nuorodą.
            </p>
          </div>

          {importNotification && (
            <div className={`p-4 rounded-2xl text-xs font-bold border ${
              importNotification.includes('❌') 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {importNotification}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>1. Įkelti .ics Failą iš Kompiuterio</span>
              </div>
              <p className="text-xs text-gray-500">
                Atsisiųskite `.ics` kalendoriaus failą iš Airbnb arba Booking.com ir įkelkite čia.
              </p>

              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center hover:border-emerald-500 transition-colors cursor-pointer bg-white">
                <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="block font-bold text-xs text-gray-800">Pasirinkite .ics failą</span>
                <span className="text-[10px] text-gray-400">Palaikomas standartinis RFC 5545 iCalendar formatas</span>
                <input 
                  type="file" 
                  accept=".ics,text/calendar" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleLoadSampleAirbnbICal}
                  className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Užkrauti Pavyzdinį Airbnb .ics Failą Patikrinimui</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                <Link className="w-5 h-5 text-emerald-600" />
                <span>2. Pridėti Kalendoriaus URL Nuorodą (Feed)</span>
              </div>
              <p className="text-xs text-gray-500">
                Patalpinkite Airbnb arba Booking.com iCal nuorodą periodiniam automatiškam sinchronizavimui.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Kanalo Pavadinimas
                  </label>
                  <input
                    type="text"
                    value={externalFeedName}
                    onChange={(e) => setExternalFeedName(e.target.value)}
                    placeholder="Pvz. Airbnb Palapinės"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    iCal URL Adresas (.ics)
                  </label>
                  <input
                    type="url"
                    value={externalFeedUrl}
                    onChange={(e) => setExternalFeedUrl(e.target.value)}
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <button
                  onClick={handleAddExternalFeedUrl}
                  disabled={!externalFeedUrl.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pridėti Sinchronizavimo Nuorodą</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-150">
            <h4 className="font-extrabold text-gray-900 text-sm">Prijungti Išoriniai Kalendoriai ({activeCampsite?.icalSyncUrls?.length || 0})</h4>
            {(!activeCampsite?.icalSyncUrls || activeCampsite.icalSyncUrls.length === 0) ? (
              <p className="text-xs text-gray-400 italic">Kol kas nėra prijungtų išorinių iCal nuorodų.</p>
            ) : (
              <div className="space-y-2">
                {activeCampsite.icalSyncUrls.map(feed => (
                  <div key={feed.id} className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{feed.name}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                          Aktyvus Feed
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-500 truncate max-w-md">{feed.url}</p>
                      <span className="text-[10px] text-gray-400">Paskutinį kartą atnaujinta: {feed.lastSynced}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => importICalContentToActiveCampsite(SAMPLE_AIRBNB_ICAL, feed.name)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sinchronizuoti Dabar</span>
                      </button>
                      <button
                        onClick={() => handleRemoveFeed(feed.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        title="Pašalinti feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: iCAL EXPORT & LIVE FEED LINK */}
      {activeSubTab === 'export' && (
        <div className="space-y-6">
          <div className="p-6 bg-emerald-900 text-white rounded-3xl space-y-3 border border-emerald-800">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Eksportuoti Stovyklavietės Kalendorių</span>
            </div>
            <h3 className="text-2xl font-black">Eksportuoti užimtumą į Airbnb, Booking.com ar Google</h3>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
              Nukopijuokite šią iCal nuorodą ir įklijuokite į savo Airbnb arba Booking.com valdymo skydą ("Import Calendar"). Jūsų Campy.lt rezervacijos ir užblokuotos datos automatiškai pasirodys kitose platformose!
            </p>
          </div>

          {copySuccessNotification && (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-200">
              {copySuccessNotification}
            </div>
          )}

          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tiesioginio iCal Feed URL Nuoroda
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                readOnly
                value={liveICalExportUrl}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800"
              />
              <button
                onClick={() => copyToClipboard(liveICalExportUrl, '✅ Tiesioginė iCal nuoroda nukopijuota į iškarpinę!')}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>Kopijuoti Nuorodą</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Atsisiųsti .ics Kalendoriaus Failą</h4>
              <p className="text-xs text-gray-500">
                Atsisiųskite esamą `.ics` failą ir atidarykite jį Apple Calendar, Outlook ar Google Calendar programoje.
              </p>
            </div>
            <button
              onClick={() => downloadICalFile(`stovyklaviete-${activeCampsite?.id || 'visos'}-ical`, currentICalFeedText)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Atsisiųsti .ics Failą</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RAW iCAL TEXT EDITOR */}
      {activeSubTab === 'raw_editor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Tekstinis .ics (RFC 5545) Redaktorius</h3>
              <p className="text-xs text-gray-500">
                Tiesioginė iCal kodo peržiūra ir redagavimas VEVENT atributams tikslinti.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(rawIcsContent, '✅ .ics tekstas nukopijuotas!')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kopijuoti</span>
              </button>
              <button
                onClick={() => importICalContentToActiveCampsite(rawIcsContent, 'Rankinis .ics Redaktorius')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Atnaujinti Kalendorių Iš Teksto</span>
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            value={rawIcsContent}
            onChange={(e) => setRawIcsContent(e.target.value)}
            className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-300 rounded-2xl focus:outline-hidden border border-slate-800 shadow-inner leading-relaxed"
          />
        </div>
      )}

    </div>
  );
};
