import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Send, Crown, MapPin, Key, Wifi, FileText, Clock, Eye, Server, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite } from '../types';
import { generateSystemEmail, SystemEmailType } from '../utils/emailSystem';

interface HostAutomatedEmailManagerProps {
  campsite: Campsite;
}

export const HostAutomatedEmailManager: React.FC<HostAutomatedEmailManagerProps> = ({ campsite }) => {
  const { updateCheckInInstructions, emailLogs, dispatchSystemEmail, bookings } = useCampsites();

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
  const [activeTemplateTab, setActiveTemplateTab] = useState<SystemEmailType>('reservation_confirmed');
  const [testEmailSentToast, setTestEmailSentToast] = useState<string | null>(null);

  // Live SMTP status & diagnostic state
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [isLoadingSmtpStatus, setIsLoadingSmtpStatus] = useState(false);
  const [testRecipientInput, setTestRecipientInput] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testSmtpOutput, setTestSmtpOutput] = useState<any>(null);
  const [showSmtpGuide, setShowSmtpGuide] = useState(false);

  const fetchSmtpStatus = async () => {
    setIsLoadingSmtpStatus(true);
    try {
      const res = await fetch('/api/smtp-status');
      const data = await res.json();
      if (data.success) {
        setSmtpStatus(data.status);
      }
    } catch (e) {
      console.warn('Could not fetch SMTP status:', e);
    } finally {
      setIsLoadingSmtpStatus(false);
    }
  };

  useEffect(() => {
    fetchSmtpStatus();
  }, []);

  const handleTestSmtpConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientInput) return;
    setIsTestingSmtp(true);
    setTestSmtpOutput(null);

    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: testRecipientInput })
      });
      const data = await res.json();
      setTestSmtpOutput(data);
    } catch (err: any) {
      setTestSmtpOutput({ success: false, error: err.message });
    } finally {
      setIsTestingSmtp(false);
    }
  };

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

  const sampleBooking = bookings.find(b => b.campsiteId === campsite.id) || {
    id: `bk-sample-101`,
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
    pitchName: campsite.pitches && campsite.pitches.length > 0 ? campsite.pitches[0].name : 'Vieta prie ežero',
    status: 'approved',
    createdAt: '2026-08-12'
  };

  const handleSendTestEmail = () => {
    dispatchSystemEmail(activeTemplateTab, {
      booking: sampleBooking as any,
      campsite,
      user: {
        id: 'u-test',
        name: 'Gintarė Petraitienė',
        email: 'gintare.petraitiene@gmail.com',
        avatar: '',
        joinedDate: '2026',
        isAdmin: false
      },
      verificationCode: '4829',
      declineReason: 'Užsakytoms datoms planuojami profilaktiniai sodybos tvarkymo darbai.'
    });

    setTestEmailSentToast(`✅ Testinis el. laiškas (${activeTemplateTab}) sugeneruotas ir įrašytas į išsiųstųjų žurnalą!`);
    setTimeout(() => setTestEmailSentToast(null), 4000);
  };

  const previewEmail = generateSystemEmail(activeTemplateTab, {
    booking: sampleBooking as any,
    campsite,
    user: {
      id: 'u-test',
      name: 'Gintarė Petraitienė',
      email: 'gintare.petraitiene@gmail.com',
      avatar: '',
      joinedDate: '2026',
      isAdmin: false
    },
    verificationCode: '4829',
    declineReason: 'Atsiprašome, šiomis dienomis sodyboje vyks suplanuotas pirties remontas.'
  });

  const campsiteEmailLogs = emailLogs.filter(l => l.campsiteId === campsite.id || !l.campsiteId);

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
              <span>Automatizuota El. Pašto Sistema</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-700" />
                <span>Visas Sistemos Ciklas</span>
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Automatizuotas laiškų siuntimas: registracija, užklausos, patvirtinimai / atmetimai, atvykimo kodai bei atsiliepimai.
            </p>
          </div>
        </div>

        <button
          onClick={handleSendTestEmail}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Siųsti pasirinktą laišką</span>
        </button>
      </div>

      {testEmailSentToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{testEmailSentToast}</span>
        </div>
      )}

      {/* Supabase SMTP & Resend Diagnostics Panel */}
      <div className="p-5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-stone-100 flex items-center gap-2">
                <span>Supabase SMTP & Resend Siuntimo Būsenos Skydelis</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Live Engine
                </span>
              </h4>
              <p className="text-[11px] text-stone-400">
                Tikrasis el. pašto siuntimo serveris (Nodemailer SMTP / Resend API / Simuliacija)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSmtpStatus}
              disabled={isLoadingSmtpStatus}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSmtpStatus ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Atnaujinti būseną</span>
            </button>
            <button
              onClick={() => setShowSmtpGuide(!showSmtpGuide)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <span>{showSmtpGuide ? 'Slėpti gidą' : 'Supabase SMTP Gidas'}</span>
            </button>
          </div>
        </div>

        {/* Live Config Indicators */}
        {smtpStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-750">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1">
                Supabase / Direct SMTP
              </div>
              <div className="flex items-center gap-2 font-bold text-stone-200">
                {smtpStatus.smtpConfigured ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aktyvus ({smtpStatus.smtpHost})</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Neaktyvus (Simuliacija)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-750">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1">
                Resend API
              </div>
              <div className="flex items-center gap-2 font-bold text-stone-200">
                {smtpStatus.resendConfigured ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Prijungtas API Raktas</span>
                  </span>
                ) : (
                  <span className="text-stone-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Numatytasis Mode</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-750">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1">
                Siuntėjo Adresas
              </div>
              <div className="font-mono text-emerald-300 font-bold text-[11px] truncate">
                "Campy.lt" &lt;noreply@campy.lt&gt;
              </div>
            </div>
          </div>
        )}

        {/* Test SMTP connection form */}
        <form onSubmit={handleTestSmtpConnection} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="email"
            required
            placeholder="Įveskite savo el. paštą bandomajam siuntimui..."
            value={testRecipientInput}
            onChange={(e) => setTestRecipientInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTestingSmtp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTestingSmtp ? 'Siunčiama...' : 'Tikrinti SMTP Ryšį'}</span>
          </button>
        </form>

        {/* Test Output Box */}
        {testSmtpOutput && (
          <div className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
            testSmtpOutput.testResult?.success || testSmtpOutput.success
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border-rose-800 text-rose-200'
          }`}>
            <p className="font-extrabold flex items-center gap-2">
              <span>{testSmtpOutput.testResult?.success ? '🟢 Testas Sėkmingas!' : '⚠️ Testo Rezultatas:'}</span>
            </p>
            <p className="text-[11px] text-stone-300">{testSmtpOutput.testResult?.message || JSON.stringify(testSmtpOutput)}</p>
          </div>
        )}

        {/* Step-by-step Supabase SMTP configuration guide */}
        {showSmtpGuide && (
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-2 text-stone-300 animate-in fade-in">
            <h5 className="font-extrabold text-stone-100 text-sm flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Kaip Konfigūruoti Supabase Custom SMTP:</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-300 text-[11px] leading-relaxed">
              <li>Atsidarykite <strong>Supabase Dashboard</strong> ir pasirinkite savo projektą.</li>
              <li>Eikite į <strong>Project Settings → Authentication → SMTP Settings</strong>.</li>
              <li>Aktivuokite <strong>"Enable Custom SMTP"</strong> jungiklį.</li>
              <li>
                Įveskite SMTP nustatymus:
                <ul className="list-disc list-inside ml-4 text-stone-400 mt-1 space-y-0.5 font-mono text-[10px]">
                  <li>Host: <span className="text-emerald-300">smtp.resend.com</span></li>
                  <li>Port: <span className="text-emerald-300">587</span></li>
                  <li>User: <span className="text-emerald-300">resend</span></li>
                  <li>Password: <span className="text-emerald-300">jūsų_resend_api_raktas</span></li>
                  <li>Sender Name: <span className="text-emerald-300">Campy.lt Stovyklavietės</span></li>
                  <li>Sender Email: <span className="text-emerald-300">noreply@campy.lt</span></li>
                </ul>
              </li>
              <li>Aplikacijos backend `.env` faile taip pat galite nurodyti <code className="text-amber-300">SMTP_HOST</code>, <code className="text-amber-300">SMTP_USER</code>, <code className="text-amber-300">SMTP_PASS</code> kintamuosius tiesioginiam siuntimui per Express backend.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Check-in Instructions Settings Form */}
      <form onSubmit={handleSaveInstructions} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-700" />
            <span>Atvykimo Instrukcijos ir Patekimo Kodai</span>
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

      {/* Live Email Template Switcher & HTML Preview */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-3 gap-3">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>Sistemos El. Laiškų Šablonų Peržiūra (Live Preview)</span>
          </h4>

          {/* Template Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold">
            {[
              { id: 'welcome_user', label: '1. Vartotojo Registracija' },
              { id: 'welcome_host', label: '2. Šeimininko Registracija' },
              { id: 'reservation_request_received', label: '3. Užklausa Svečiui' },
              { id: 'new_reservation_request_host', label: '4. Užklausa Šeimininkui' },
              { id: 'reservation_confirmed', label: '5. Patvirtinimas' },
              { id: 'reservation_declined', label: '6. Atmetimas' },
              { id: 'arrival_instructions', label: '7. Atvykimo Kodai' },
              { id: 'password_reset_code', label: '8. Slaptažodžio Kodas' },
              { id: 'stay_completed_thank_you', label: '9. Atsiliepimo Kvietimas' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTemplateTab(tab.id as SystemEmailType)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTemplateTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Render Live Email HTML Box */}
        <div className="p-4 rounded-3xl bg-stone-100 border border-stone-200 space-y-3 font-sans max-w-2xl mx-auto shadow-inner">
          <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-1 text-xs">
            <p className="text-stone-500 font-bold">Adresatas: <span className="text-stone-900 font-extrabold">{previewEmail.recipientName} ({previewEmail.recipientEmail})</span></p>
            <p className="text-stone-500 font-bold">Tema: <span className="text-emerald-900 font-extrabold">{previewEmail.subject}</span></p>
          </div>

          <div 
            className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
            dangerouslySetInnerHTML={{ __html: previewEmail.htmlBody }}
          />
        </div>
      </div>

      {/* Log History */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <h4 className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>El. Laiškų Išsiuntimo Žurnalas (System Sent Logs)</span>
          </span>
          <span className="text-xs font-bold text-stone-500">Iš viso: {campsiteEmailLogs.length}</span>
        </h4>

        {campsiteEmailLogs.length === 0 ? (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
            El. laiškų žurnale dar nėra registruotų pranešimų.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {campsiteEmailLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase">
                      {log.type}
                    </span>
                    <span className="font-bold text-stone-900">{log.recipientName} ({log.recipientEmail})</span>
                  </div>
                  <p className="text-stone-800 font-bold text-[11px]">{log.subject}</p>
                  <p className="text-stone-600 font-medium text-[10px] line-clamp-1">{log.contentPreview}</p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-stone-400 font-bold">
                  <span>{log.sentAt}</span>
                  <span className="block text-emerald-700 font-extrabold">🟢 Sent</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

