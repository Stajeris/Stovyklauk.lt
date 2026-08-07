import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Upload, Link, 
  RefreshCw, Check, X, DollarSign, Lock, Unlock, AlertCircle, Plus, Trash2, 
  FileText, Copy, Sparkles, ExternalLink, ShieldCheck, Tag, Info, Crown
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, ICalSyncFeed, ImportedCalendarEvent } from '../types';
import { 
  generateICalFeed, 
  parseICalContent, 
  downloadICalFile, 
  SAMPLE_AIRBNB_ICAL 
} from '../utils/ical';

interface HostCalendarManagerProps {
  campsites: Campsite[];
  selectedCampsiteId?: string;
}

export const HostCalendarManager: React.FC<HostCalendarManagerProps> = ({ 
  campsites, 
  selectedCampsiteId: initialCampsiteId 
}) => {
  const { updateCampsite, bookings, hostTier, setHostTier, t } = useCampsites();

  // Active campsite selection
  const [activeCampsiteId, setActiveCampsiteId] = useState<string>(
    initialCampsiteId && campsites.some(c => c.id === initialCampsiteId)
      ? initialCampsiteId
      : campsites[0]?.id || ''
  );

  // Active campsite object
  const activeCampsite = useCampsites().campsites.find(c => c.id === activeCampsiteId) || campsites[0];

  // Calendar view navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'import' | 'export' | 'raw_editor'>('calendar');

  // Date range selection state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Custom price modal/input state
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isSettingPriceModalOpen, setIsSettingPriceModalOpen] = useState<boolean>(false);

  // Manual event addition state
  const [manualEventSummary, setManualEventSummary] = useState<string>('');
  const [isManualEventModalOpen, setIsManualEventModalOpen] = useState<boolean>(false);

  // iCal Import states
  const [pastedIcsText, setPastedIcsText] = useState<string>('');
  const [externalFeedUrl, setExternalFeedUrl] = useState<string>('');
  const [externalFeedName, setExternalFeedName] = useState<string>('Airbnb Calendar');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Raw .ics editor content
  const [rawIcsContent, setRawIcsContent] = useState<string>('');
  const [copySuccessNotification, setCopySuccessNotification] = useState<string | null>(null);

  // Generate date calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentMonthDate(new Date());

  // Month name formatting (Lithuanian / English)
  const monthName = currentMonthDate.toLocaleDateString('lt-LT', { month: 'long', year: 'numeric' });

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

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

    // Next month padding to fill 35 or 42 grid cells
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

  if (!activeCampsite) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-150">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-700">Neturite įkeltų stovyklaviečių.</p>
      </div>
    );
  }

  // Active campsite bookings
  const campsiteBookings = bookings.filter(
    b => b.campsiteId === activeCampsite.id && b.status !== 'rejected'
  );

  // Helper to check status of a specific date
  const getDateInfo = (dateStr: string) => {
    // 1. Check guest bookings
    const booking = campsiteBookings.find(b => dateStr >= b.checkIn && dateStr <= b.checkOut);
    if (booking) {
      return { type: 'booked', label: `Užsakyta (${booking.guestName})`, booking };
    }

    // 2. Check imported iCal events
    const importedEvt = activeCampsite.importedEvents?.find(
      e => dateStr >= e.startDate && dateStr <= e.endDate
    );
    if (importedEvt) {
      return { 
        type: 'imported', 
        label: `${importedEvt.source || 'iCal'}: ${importedEvt.summary}`,
        importedEvt 
      };
    }

    // 3. Check blocked by host
    const isBlocked = activeCampsite.blockedDates?.includes(dateStr);
    if (isBlocked) {
      return { type: 'blocked', label: 'Užblokuota šeimininko' };
    }

    // 4. Custom price or standard price
    const customPrice = activeCampsite.customPrices?.[dateStr];
    return { 
      type: 'available', 
      label: 'Laisva', 
      price: customPrice ?? activeCampsite.pricePerNight 
    };
  };

  // Date selection click handler
  const handleDateClick = (dateStr: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      setSelectedDates([dateStr]);
    } else {
      // Complete range selection
      if (dateStr >= rangeStart) {
        setRangeEnd(dateStr);
        // Expand range dates
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

  // Clear date selection
  const clearSelection = () => {
    setSelectedDates([]);
    setRangeStart(null);
    setRangeEnd(null);
  };

  // Toggle block/unblock for selected dates
  const handleBlockSelectedDates = (block: boolean) => {
    if (selectedDates.length === 0) return;
    const currentBlocked = new Set(activeCampsite.blockedDates || []);
    selectedDates.forEach(d => {
      if (block) currentBlocked.add(d);
      else currentBlocked.delete(d);
    });

    updateCampsite(activeCampsite.id, {
      blockedDates: Array.from(currentBlocked),
    });

    clearSelection();
  };

  // Apply custom price for selected dates
  const handleApplyCustomPrice = () => {
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
  };

  // Clear custom price for selected dates
  const handleRemoveCustomPrice = () => {
    if (selectedDates.length === 0) return;
    const currentPrices = { ...(activeCampsite.customPrices || {}) };
    selectedDates.forEach(d => {
      delete currentPrices[d];
    });

    updateCampsite(activeCampsite.id, {
      customPrices: currentPrices,
    });

    clearSelection();
  };

  // Add manual reservation / iCal event
  const handleAddManualReservation = () => {
    if (selectedDates.length === 0 || !manualEventSummary.trim()) return;
    const sorted = [...selectedDates].sort();
    const newEvent: ImportedCalendarEvent = {
      id: `manual-${Date.now()}`,
      startDate: sorted[0],
      endDate: sorted[sorted.length - 1],
      summary: manualEventSummary.trim(),
      source: 'Rankinis Įrašas',
      uid: `manual-res-${Date.now()}@stovyklauk.lt`,
    };

    const currentEvents = [...(activeCampsite.importedEvents || []), newEvent];
    updateCampsite(activeCampsite.id, {
      importedEvents: currentEvents,
    });

    setIsManualEventModalOpen(false);
    setManualEventSummary('');
    clearSelection();
  };

  // Handle iCal file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importICalContentToActiveCampsite(content, file.name.replace('.ics', ''));
      }
    };
    reader.readAsText(file);
  };

  // Process iCal text import
  const importICalContentToActiveCampsite = (icsString: string, sourceName: string) => {
    const events = parseICalContent(icsString, sourceName);
    if (events.length === 0) {
      setImportNotification('❌ Nepavyko rasti galiojančių VEVENT įrašų šiame .ics faile.');
      return;
    }

    // Merge new events with existing, deduplicating by UID or start+end
    const existing = activeCampsite.importedEvents || [];
    const merged = [...existing];

    events.forEach(ev => {
      const isDuplicate = merged.some(
        m => m.uid === ev.uid || (m.startDate === ev.startDate && m.endDate === ev.endDate)
      );
      if (!isDuplicate) {
        merged.push(ev);
      }
    });

    updateCampsite(activeCampsite.id, {
      importedEvents: merged,
    });

    setImportNotification(`✅ Sėkmingai importuota ${events.length} užsakymo/rezervacijos įrašų iš "${sourceName}"!`);
    setTimeout(() => setImportNotification(null), 6000);
  };

  // Load sample Airbnb calendar for testing
  const handleLoadSampleAirbnbICal = () => {
    importICalContentToActiveCampsite(SAMPLE_AIRBNB_ICAL, 'Airbnb (Pavyzdinis)');
  };

  // Add external iCal sync URL feed
  const handleAddExternalFeedUrl = () => {
    if (!externalFeedUrl.trim()) return;
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

    // Automatically simulate parsing sample items
    importICalContentToActiveCampsite(SAMPLE_AIRBNB_ICAL, newFeed.name);

    setExternalFeedUrl('');
    setExternalFeedName('Airbnb Calendar');
  };

  // Remove external sync feed
  const handleRemoveFeed = (feedId: string) => {
    const updated = (activeCampsite.icalSyncUrls || []).filter(f => f.id !== feedId);
    updateCampsite(activeCampsite.id, { icalSyncUrls: updated });
  };

  // Remove imported event
  const handleRemoveImportedEvent = (eventId: string) => {
    const updated = (activeCampsite.importedEvents || []).filter(e => e.id !== eventId);
    updateCampsite(activeCampsite.id, { importedEvents: updated });
  };

  // Generated live iCal feed text
  const currentICalFeedText = useMemo(() => {
    return generateICalFeed(activeCampsite, campsiteBookings);
  }, [activeCampsite, campsiteBookings]);

  // Live feed URL
  const liveICalExportUrl = `https://stovyklauk.lt/api/ical/${activeCampsite.id}.ics?token=${activeCampsite.icalExportToken || 'campsite-key-2026'}`;

  // Copy text helper
  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessNotification(msg);
    setTimeout(() => setCopySuccessNotification(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 font-sans">
      
      {/* Header & Campsite Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-extrabold text-gray-900">Užimtumo ir iCal Kalendorius</h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
              iCalendar / RFC 5545
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Valdykite laisvas ir užblokuotas datas, nustatykite sezonines kainas bei sinchronizuokite su Airbnb ar Booking.com.
          </p>
        </div>

        {/* Listing Selector */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-500 pl-2 shrink-0">Stovyklavietė:</label>
          <select
            value={activeCampsiteId}
            onChange={(e) => {
              setActiveCampsiteId(e.target.value);
              clearSelection();
            }}
            className="bg-white text-gray-900 font-bold text-xs py-2 px-3 rounded-xl border border-gray-200 focus:outline-hidden cursor-pointer"
          >
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
          <span>Mėnesio Kalendorius ir Datos</span>
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
          <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
            <Crown className="w-2.5 h-2.5" /> PRO
          </span>
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
          <span>Tekstinis .ics Redaktorius</span>
        </button>
      </div>

      {/* SUB-TAB 1: MONTH CALENDAR GRID */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-5">
          
          {/* Month Navigation Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
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

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Laisva</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Užblokuota</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Rezervuota (Svečio)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span>iCal Importas</span>
              </span>
            </div>
          </div>

          {/* Action Bar for Selected Dates */}
          {selectedDates.length > 0 && (
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
                  <span>Rankinė Rezervacija</span>
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

          {/* Modal: Set Custom Price */}
          {isSettingPriceModalOpen && (
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
          {isManualEventModalOpen && (
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

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
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
                const info = getDateInfo(cell.dateStr);
                const isSelected = selectedDates.includes(cell.dateStr);
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(cell.dateStr)}
                    className={`min-h-[85px] sm:min-h-[100px] p-1.5 sm:p-2 bg-white flex flex-col justify-between cursor-pointer transition-all relative ${
                      !cell.isCurrentMonth ? 'opacity-40 bg-gray-50' : 'hover:bg-emerald-50/50'
                    } ${isSelected ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-50' : ''}`}
                  >
                    {/* Top Row: Date Number & Today Indicator */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs' 
                          : cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {/* Custom price tag indicator */}
                      {info.type === 'available' && activeCampsite.customPrices?.[cell.dateStr] && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded-md border border-amber-200">
                          €{info.price}
                        </span>
                      )}
                    </div>

                    {/* Status Badge / Details */}
                    <div className="mt-1">
                      {info.type === 'booked' && (
                        <div className="p-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-bold leading-tight truncate">
                          <span className="block truncate">🔒 {info.label}</span>
                        </div>
                      )}

                      {info.type === 'imported' && (
                        <div className="p-1 rounded-lg bg-purple-100 border border-purple-300 text-purple-950 text-[10px] font-bold leading-tight truncate">
                          <span className="block truncate">🌐 {info.label}</span>
                        </div>
                      )}

                      {info.type === 'blocked' && (
                        <div className="p-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 text-[10px] font-bold leading-tight">
                          <span>❌ Užblokuota</span>
                        </div>
                      )}

                      {info.type === 'available' && (
                        <div className="text-[10px] text-gray-400 font-semibold mt-2">
                          €{info.price}/nakt.
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

      {/* SUB-TAB 2: iCAL IMPORT & SYNCHRONIZATION */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          
          {/* Top Banner */}
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
            
            {/* Box 1: File Upload or Sample Load */}
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

            {/* Box 2: Automatic iCal URL Sync */}
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

          {/* List of Connected External Sync Feeds */}
          <div className="space-y-3 pt-4 border-t border-gray-150">
            <h4 className="font-extrabold text-gray-900 text-sm">Prijungti Išoriniai Kalendoriai ({activeCampsite.icalSyncUrls?.length || 0})</h4>
            {(!activeCampsite.icalSyncUrls || activeCampsite.icalSyncUrls.length === 0) ? (
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

          {/* List of Imported Calendar Events */}
          <div className="space-y-3 pt-4 border-t border-gray-150">
            <h4 className="font-extrabold text-gray-900 text-sm">
              Importuoti iCal Įrašai IR Rezervacijos ({activeCampsite.importedEvents?.length || 0})
            </h4>
            {(!activeCampsite.importedEvents || activeCampsite.importedEvents.length === 0) ? (
              <p className="text-xs text-gray-400 italic">Šiuo metu nėra importuotų iCal dienų.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeCampsite.importedEvents.map(evt => (
                  <div key={evt.id} className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[9px] font-extrabold rounded-md uppercase">
                        {evt.source || 'iCal'}
                      </span>
                      <h5 className="font-bold text-xs text-purple-950 leading-tight">{evt.summary}</h5>
                      <p className="text-[10px] text-purple-700 font-medium">
                        {evt.startDate} iki {evt.endDate}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveImportedEvent(evt.id)}
                      className="text-purple-400 hover:text-rose-600 cursor-pointer p-1"
                      title="Pašalinti įrašą"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              Nukopijuokite šią iCal nuorodą ir įklijuokite į savo Airbnb arba Booking.com valdymo skydą ("Import Calendar"). Jūsų Stovyklauk.lt rezervacijos ir užblokuotos datos automatiškai pasirodys kitose platformose!
            </p>
          </div>

          {copySuccessNotification && (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-200">
              {copySuccessNotification}
            </div>
          )}

          {/* Export Link Box */}
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

          {/* Download Button */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Atsisiųsti .ics Kalendoriaus Failą</h4>
              <p className="text-xs text-gray-500">
                Atsisiųskite esamą `.ics` failą ir atidarykite jį Apple Calendar, Outlook ar Google Calendar programoje.
              </p>
            </div>
            <button
              onClick={() => downloadICalFile(`stovyklaviete-${activeCampsite.id}-ical`, currentICalFeedText)}
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
