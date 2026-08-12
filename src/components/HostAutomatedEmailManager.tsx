import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, Crown, Sparkles, MapPin, Key, Wifi, FileText, Clock, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, CheckInInstructions } from '../types';

interface HostAutomatedEmailManagerProps {
  campsite: Campsite;
}

export const HostAutomatedEmailManager: React.FC<HostAutomatedEmailManagerProps> = ({ campsite }) => {
  const { updateCheckInInstructions, emailLogs, sendAutomatedEmail, bookings } = useCampsites();

  const instructions = campsite.checkInInstructions || {
    gpsCoordinates: `${campsite.latitude || 55.05812}, ${campsite.longitude || 25.45231}`,
    gateCode: '4829',
    houseRules: campsite.rules?.join(' • ') || 'Tylos valandos nuo 22:00. Laužus kūrenti tik tam skirtoje laužavietėje.',
    wifiName: 'Asveja_Camp_Guest',
    wifiPassword: 'stovyklaujamegamtose'
  };

  const [gpsCoordinates, setGpsCoordinates] = useState(instructions.gpsCoordinates);
  const [gateCode, setGateCode] = useState(instructions.gateCode || '4829');
  const [houseRules, setHouseRules] = useState(instructions.houseRules || '');
  const [wifiName, setWifiName] = useState(instructions.wifiName || '');
  const [wifiPassword, setWifiPassword] = useState(instructions.wifiPassword || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'traveler_confirmation' | 'host_notice'>('traveler_confirmation');
  const [testEmailSentToast, setTestEmailSentToast] = useState<string | null>(null);

  const handleSaveInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    updateCheckInInstructions(campsite.id, {
      gpsCoordinates,
      gateCode,
      houseRules,
      wifiName,
      wifiPassword
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestEmail = () => {
    // Find or construct a sample booking
    const sampleBooking = bookings.find(b => b.campsiteId === campsite.id) || {
      id: `bk-test-${Date.now()}`,
      campsiteId: campsite.id,
      campsiteTitle: campsite.title,
      campsiteImage: campsite.images[0],
      location: campsite.location,
      guestName: 'Gintarė Petraitienė',
      guestEmail: 'gintare.petraitiene@gmail.com',
      guestPhone: '+370 612 34567',
      guestNote: 'Noriu atvykti apie 14:00 su šunimi.',
      checkIn: '2026-08-20',
      checkOut: '2026-08-22',
      guestsCount: 2,
      totalNights: 2,
      nightlyRate: campsite.pricePerNight,
      cleaningFee: 0,
      serviceFee: 3,
      totalPrice: campsite.pricePerNight * 2 + 3,
      propertyType: campsite.propertyType,
      pitchName: campsite.pitches && campsite.pitches.length > 0 ? campsite.pitches[0].name : undefined,
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    sendAutomatedEmail(sampleBooking, activeTemplateTab === 'traveler_confirmation' ? 'confirmation_checkin' : 'new_reservation_request');
    setTestEmailSentToast(`✅ Testinis el. laiškas sėkmingai sugeneruotas ir išsiųstas adresatui!`);
    setTimeout(() => setTestEmailSentToast(null), 4000);
  };

  const campsiteEmailLogs = emailLogs.filter(l => l.campsiteId === campsite.id);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
            <Mail className="w-6 h-6 text-emerald-700" />
          </span>
          <div>
            <h3 className="font-extrabold text-xl text-stone-900 flex items-center gap-2">
              <span>Automatizuoti El. Laiškai & Atvykimo Instrukcijos</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-700" />
                <span>PRO Planas</span>
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Patvirtinus užsakymą, sistema automatizuotai išsiunčia svečiui atvykimo instrukcijas, vartų kodus bei GPS koordinates.
            </p>
          </div>
        </div>

        <button
          onClick={handleSendTestEmail}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Siųsti bandomąjį el. laišką</span>
        </button>
      </div>

      {testEmailSentToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{testEmailSentToast}</span>
        </div>
      )}

      {/* Check-in Instructions Settings Form */}
      <form onSubmit={handleSaveInstructions} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-700" />
            <span>Svečio Atsiuntimo Duomenys (Atvykimo Instrukcijos)</span>
          </h4>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instrukcijos išsaugotos!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span>Tikslios GPS Koordinatės</span>
            </label>
            <input
              type="text"
              required
              placeholder="Pvz.: 55.05812, 25.45231"
              value={gpsCoordinates}
              onChange={(e) => setGpsCoordinates(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-600" />
              <span>Vartų Kodas / Spynos Kodas</span>
            </label>
            <input
              type="text"
              placeholder="Pvz.: 4829 arba Koduotas raktas dėžutėje"
              value={gateCode}
              onChange={(e) => setGateCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-700" />
              <span>Wi-Fi Tinklas & Slaptažodis</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tinklas"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900"
              />
              <input
                type="text"
                placeholder="Slaptažodis"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-stone-600" />
            <span>Papildomos Taisyklės & Tylos Valandos</span>
          </label>
          <input
            type="text"
            placeholder="Pvz.: Tylos valandos nuo 22:00. Laužus kūrenti tik tam skirtoje laužavietėje."
            value={houseRules}
            onChange={(e) => setHouseRules(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Išsaugoti atvykimo instrukcijas
          </button>
        </div>
      </form>

      {/* Live Email Template Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>El. Laiškų Šablonų Peržiūra (Live HTML Templates)</span>
          </h4>

          {/* Template Switcher */}
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <button
              onClick={() => setActiveTemplateTab('traveler_confirmation')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTemplateTab === 'traveler_confirmation'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              1. Svečio Patvirtinimo Laiškas
            </button>
            <button
              onClick={() => setActiveTemplateTab('host_notice')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTemplateTab === 'host_notice'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              2. Šeimininko Užklausos Pranešimas
            </button>
          </div>
        </div>

        {/* Render Live Preview Frame */}
        {activeTemplateTab === 'traveler_confirmation' ? (
          <div className="p-6 rounded-3xl bg-emerald-950/5 border border-emerald-200 space-y-4 font-sans max-w-2xl mx-auto shadow-inner">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm text-stone-900">
              <div className="border-b border-stone-100 pb-3 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tema:</span>
                <p className="font-black text-sm text-emerald-900">
                  ✅ Rezervacija Patvirtinta! Atsvykimo informacija ir GPS kodo duomenys — {campsite.title}
                </p>
                <span className="text-[11px] text-stone-500 font-medium block">
                  Siuntėjas: <strong>Campy.lt Rezervacijos &lt;noreply@campy.lt&gt;</strong>
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-stone-800">
                <p className="font-bold">Sveiki, [Svečio Vardas]!</p>
                <p>
                  Jūsų rezervacija stovyklavietėje <strong>„{campsite.title}“</strong> yra sėkmingai patvirtinta!
                </p>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-950 font-medium">
                  <span className="font-bold block text-emerald-900 uppercase text-[10px]">Viešnagės Detalės:</span>
                  <p>📅 Datos: <strong>2026-08-20 — 2026-08-22 (2 naktys)</strong></p>
                  <p>⛺ Aikštelė: <strong>{campsite.pitches?.[0]?.name || 'Pagrindinė stovyklavietės vieta'}</strong></p>
                  <p>💶 Suma: <strong>€{campsite.pricePerNight * 2} (Apmokėta)</strong></p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-stone-900">
                  <span className="font-black text-amber-900 uppercase text-[10px] block flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>Atsvykimo ir Patekimo Instrukcijos:</span>
                  </span>
                  <p>📍 <strong>GPS Koordinatės:</strong> {gpsCoordinates}</p>
                  <p>🔑 <strong>Vartų spynos kodas:</strong> {gateCode}</p>
                  {wifiName && <p>📶 <strong>Wi-Fi Tinklas:</strong> {wifiName} (Slaptažodis: {wifiPassword})</p>}
                  {houseRules && <p>📜 <strong>Taisyklės:</strong> {houseRules}</p>}
                </div>

                <p className="text-stone-500 text-[11px] pt-2 border-t border-stone-100">
                  Kilus klausimams galite susisiekti su šeimininku <strong>{campsite.host.name}</strong> per Campy.lt platformos žinutes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-amber-950/5 border border-amber-200 space-y-4 font-sans max-w-2xl mx-auto shadow-inner">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm text-stone-900">
              <div className="border-b border-stone-100 pb-3 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tema:</span>
                <p className="font-black text-sm text-amber-900">
                  📩 Nauja Rezervacijos Užklausa — {campsite.title} ([Svečio Vardas])
                </p>
                <span className="text-[11px] text-stone-500 font-medium block">
                  Kam: <strong>{campsite.host.email || 'seimininkas@campy.lt'}</strong>
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-stone-800">
                <p className="font-bold">Sveiki, {campsite.host.name}!</p>
                <p>
                  Gautas naujas rezervacijos prašymas stovyklavietėje <strong>„{campsite.title}“</strong>. Datos kalendoriuje laikinai užrakintos.
                </p>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 text-stone-900">
                  <p>👤 Poilsiautojas: <strong>Gintarė Petraitienė</strong></p>
                  <p>📅 Užsakymo datos: <strong>2026-08-20 — 2026-08-22</strong></p>
                  <p>💶 Užsakymo vertė: <strong>€{campsite.pricePerNight * 2}</strong></p>
                </div>

                <div className="flex gap-2 pt-2">
                  <span className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl">
                    ✅ Patvirtinti užsakymą
                  </span>
                  <span className="px-4 py-2 bg-rose-100 text-rose-800 font-bold text-xs rounded-xl">
                    ❌ Atmesti
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log History */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <h4 className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Automatizuotų El. Laiškų Išsiuntimo Žurnalas (Sent Logs)</span>
          </span>
          <span className="text-xs font-bold text-stone-500">Iš viso: {campsiteEmailLogs.length}</span>
        </h4>

        {campsiteEmailLogs.length === 0 ? (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
            El. laiškų žurnale dar nėra registruotų pranešimų.
          </div>
        ) : (
          <div className="space-y-2">
            {campsiteEmailLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase">
                      {log.type === 'confirmation_checkin' ? '✅ Svečio Patvirtinimas' : '📩 Užklausa Šeimininkui'}
                    </span>
                    <span className="font-bold text-stone-900">{log.recipientName} ({log.recipientEmail})</span>
                  </div>
                  <p className="text-stone-600 font-medium text-[11px] line-clamp-1">{log.contentPreview}</p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-stone-400 font-bold">
                  <span>{log.sentAt}</span>
                  <span className="block text-emerald-700 font-extrabold">🟢 Delivered</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
