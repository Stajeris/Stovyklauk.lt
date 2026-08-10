import React, { useState } from 'react';
import { ShieldCheck, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

interface HostVerificationSectionProps {
  onVerificationSuccess?: () => void;
  compact?: boolean;
}

export const HostVerificationSection: React.FC<HostVerificationSectionProps> = ({ onVerificationSuccess, compact = false }) => {
  const { currentUser, verifyHostPhoneOrEmail } = useCampsites();

  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  
  // Phone State
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+370 600 12345');
  const [phoneCodeSent, setPhoneCodeSent] = useState(true); // Default true so the verification code field is immediately visible
  const [phoneOtp, setPhoneOtp] = useState('');
  const [simulatedPhoneCode, setSimulatedPhoneCode] = useState('8492');
  const [phoneError, setPhoneError] = useState('');

  // Email State
  const [emailAddress, setEmailAddress] = useState(currentUser.email || 'seimininkas@campy.lt');
  const [emailCodeSent, setEmailCodeSent] = useState(true); // Default true so the verification code field is immediately visible
  const [emailOtp, setEmailOtp] = useState('');
  const [simulatedEmailCode, setSimulatedEmailCode] = useState('5914');
  const [emailError, setEmailError] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendPhoneCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setPhoneError('Įveskite galiojantį tel. numerį (pvz. +370 600 12345)');
      return;
    }
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedPhoneCode(generatedCode);
    setPhoneCodeSent(true);
    setPhoneError('');
  };

  const handleVerifyPhoneCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtp.trim() === simulatedPhoneCode || phoneOtp.trim() === '1234') {
      verifyHostPhoneOrEmail('phone', phoneNumber);
      setIsSuccess(true);
      if (onVerificationSuccess) onVerificationSuccess();
    } else {
      setPhoneError(`Neteisingas SMS kodas. Panaudokite simuliacinį kodą: ${simulatedPhoneCode}`);
    }
  };

  const handleSendEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress || !emailAddress.includes('@')) {
      setEmailError('Įveskite galiojantį el. pašto adresą');
      return;
    }
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedEmailCode(generatedCode);
    setEmailCodeSent(true);
    setEmailError('');
  };

  const handleVerifyEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.trim() === simulatedEmailCode || emailOtp.trim() === '1234') {
      verifyHostPhoneOrEmail('email', emailAddress);
      setIsSuccess(true);
      if (onVerificationSuccess) onVerificationSuccess();
    } else {
      setEmailError(`Neteisingas el. pašto kodas. Panaudokite simuliacinį kodą: ${simulatedEmailCode}`);
    }
  };

  const isVerified = currentUser.isPhoneVerified || currentUser.isEmailVerified || isSuccess;

  if (isVerified) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 font-sans space-y-2">
        <div className="flex items-center gap-3 text-emerald-950 font-black">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-gray-900">Verifikuotas Šeimininkas</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px] uppercase tracking-wider">
                ✓ Automatinis Patvirtinimas Aktyvus
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              Jūsų tapatybė verifikuota per {currentUser.isPhoneVerified ? `Telefoną (${currentUser.verifiedPhone || currentUser.phone})` : `El. Paštą (${currentUser.verifiedEmail || currentUser.email})`}. Visi nauji skelbimai bus **automatiškai patvirtinami** be laukimo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-gray-50 border-2 border-emerald-300 ${compact ? 'p-4' : 'p-6'} font-sans space-y-4 shadow-xs`}>
      <div className="flex items-start gap-3">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-gray-900">Šeimininko Verifikacija (Automatinis Skelbimų Aktyvavimas)</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase border border-amber-300">
              Užtrunka 10 sek.
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Verifikuokite savo telefoną arba el. paštą ir jūsų skelbimai bus <strong>automatiškai patvirtinami (Automatic Approval)</strong> be rankinio administratoriaus laukimo!
          </p>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => { setActiveTab('phone'); setPhoneError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'phone' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Telefonu (SMS Kodas)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('email'); setEmailError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'email' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>El. Paštu (Patvirtinimo Kodas)</span>
        </button>
      </div>

      {/* Phone Tab Form */}
      {activeTab === 'phone' && (
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-emerald-100 text-xs">
          {!phoneCodeSent ? (
            <form onSubmit={handleSendPhoneCode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Mobiliosios Mobiliojo Telefons Numeris (Lietuva +370)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+370 600 12345"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>Gauti SMS kodą</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {phoneError && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {phoneError}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneCode} className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-[11px] text-emerald-900 font-bold flex items-center justify-between">
                  <span>📲 SMS Verifikacijos kodas išsiųstas į {phoneNumber}!</span>
                  <button
                    type="button"
                    onClick={() => setPhoneCodeSent(false)}
                    className="text-emerald-700 hover:underline text-[10px] cursor-pointer"
                  >
                    Keisti tel. nr.
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Jūsų SMS kodas išmėginimui: <button type="button" onClick={() => setPhoneOtp(simulatedPhoneCode)} className="bg-emerald-200 hover:bg-emerald-300 px-2.5 py-0.5 rounded text-emerald-950 font-black text-sm font-mono cursor-pointer border border-emerald-300 inline-flex items-center gap-1" title="Paspauskite, kad įrašytumėte"><span>{simulatedPhoneCode}</span> <span className="text-[9px] font-sans font-bold text-emerald-800"> (Įrašyti)</span></button>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-gray-800 mb-1">
                  Įveskite gautą 4 skaitmenų SMS verifikacijos kodą:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder={simulatedPhoneCode}
                    className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 text-center font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Patvirtinti SMS Kodą ir Aktyvuoti</span>
                  </button>
                </div>
              </div>

              {phoneError && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {phoneError}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Email Tab Form */}
      {activeTab === 'email' && (
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-emerald-100 text-xs">
          {!emailCodeSent ? (
            <form onSubmit={handleSendEmailCode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Šeimininko El. Pašto Adresas
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="seimininkas@campy.lt"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>Siųsti kodo laišką</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {emailError && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {emailError}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailCode} className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-[11px] text-emerald-900 font-bold flex items-center justify-between">
                  <span>✉️ El. pašto verifikacijos kodas išsiųstas į {emailAddress}!</span>
                  <button
                    type="button"
                    onClick={() => setEmailCodeSent(false)}
                    className="text-emerald-700 hover:underline text-[10px] cursor-pointer"
                  >
                    Keisti el. paštą
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Jūsų el. pašto kodas išmėginimui: <button type="button" onClick={() => setEmailOtp(simulatedEmailCode)} className="bg-emerald-200 hover:bg-emerald-300 px-2.5 py-0.5 rounded text-emerald-950 font-black text-sm font-mono cursor-pointer border border-emerald-300 inline-flex items-center gap-1" title="Paspauskite, kad įrašytumėte"><span>{simulatedEmailCode}</span> <span className="text-[9px] font-sans font-bold text-emerald-800"> (Įrašyti)</span></button>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-gray-800 mb-1">
                  Įveskite gautą el. pašto verifikacijos kodą:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder={simulatedEmailCode}
                    className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 text-center font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Patvirtinti El. Pašto Kodą ir Aktyvuoti</span>
                  </button>
                </div>
              </div>

              {emailError && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {emailError}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};
