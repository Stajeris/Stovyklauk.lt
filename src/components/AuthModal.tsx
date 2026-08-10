import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowRight, 
  KeyRound, RefreshCw, Sparkles, Check, HelpCircle, UserCheck, ShieldCheck
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { HostPhotoUploader } from './HostPhotoUploader';

export type AuthModalMode = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { 
    loginUser, 
    registerUser, 
    verifyUserEmail, 
    requestPasswordResetCode, 
    resetUserPassword, 
    recoverEmailByNameOrPhone,
    setCurrentUser
  } = useCampsites();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register inputs
  const [selectedUserType, setSelectedUserType] = useState<'client' | 'host'>('client');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [regError, setRegError] = useState('');

  // Email OTP verification state
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingUserEmail, setPendingUserEmail] = useState<string>('');
  const [emailOtp, setEmailOtp] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('4829');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [simulatedResetCode, setSimulatedResetCode] = useState('8391');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Forgot email state
  const [recoverQuery, setRecoverQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [recoverSearched, setRecoverSearched] = useState(false);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const res = loginUser(loginEmail.trim(), loginPassword.trim());
    if (res.success) {
      onClose();
    } else {
      if (res.reason === 'invalid_password') {
        setLoginError('Neteisingas slaptažodis! Patikrinkite įvestus duomenis.');
      } else {
        setLoginError('Vartotojas su šiuo el. paštu nerastas. Užregistruokite naują paskyrą.');
      }
    }
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Slaptažodžiai nesutampa!');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Slaptažodis turi būti bent 4 simbolių ilgio.');
      return;
    }

    const { user, verificationCode } = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      phone: regPhone.trim(),
      avatar: regAvatar,
      userType: selectedUserType
    });

    setPendingUserId(user.id);
    setPendingUserEmail(user.email);
    setSimulatedCode(verificationCode);
    setMode('verify-email');
  };

  // Handle Email OTP verification
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (emailOtp.trim() !== simulatedCode) {
      setVerifyError('Neteisingas verifikacijos kodas. Bandykite dar kartą.');
      return;
    }

    if (pendingUserId) {
      verifyUserEmail(pendingUserId);
      setVerifySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  // Handle Request Reset Code (Forgot Password Step 1)
  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const result = requestPasswordResetCode(resetEmail.trim());
    if (result.success && result.code) {
      setSimulatedResetCode(result.code);
      setResetStep(2);
    } else {
      setResetError(result.message || 'Vartotojas su šiuo el. paštu nerastas.');
    }
  };

  // Handle Verify Reset OTP Code (Forgot Password Step 2)
  const handleVerifyResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (resetCodeInput.trim() !== simulatedResetCode) {
      setResetError('Neteisingas atstatymo kodas!');
      return;
    }
    setResetStep(3);
  };

  // Handle New Password Submission (Forgot Password Step 3)
  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmNewPassword) {
      setResetError('Slaptažodžiai nesutampa!');
      return;
    }
    if (newPassword.length < 4) {
      setResetError('Slaptažodis turi būti bent 4 simbolių ilgio.');
      return;
    }

    const res = resetUserPassword(resetEmail.trim(), newPassword.trim());
    if (res.success) {
      setResetSuccessMessage('Slaptažodis sėkmingai pakeistas! Dabar galite prisijungti.');
      setTimeout(() => {
        setMode('login');
        setLoginEmail(resetEmail);
        setResetSuccessMessage('');
        setResetStep(1);
      }, 1500);
    } else {
      setResetError('Įvyko klaida atstatant slaptažodį.');
    }
  };

  // Handle Recover Email Search
  const handleSearchRecoverEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverQuery.trim()) return;

    const matches = recoverEmailByNameOrPhone(recoverQuery.trim());
    setFoundUsers(matches);
    setRecoverSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pr-6">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-2xl mb-1 shadow-xs">
            {mode === 'login' && <Lock className="w-6 h-6" />}
            {mode === 'register' && <User className="w-6 h-6" />}
            {mode === 'verify-email' && <Mail className="w-6 h-6" />}
            {mode === 'forgot-password' && <KeyRound className="w-6 h-6 text-amber-700" />}
            {mode === 'forgot-email' && <HelpCircle className="w-6 h-6 text-emerald-700" />}
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            {mode === 'login' && 'Prisijungti prie Paskyros'}
            {mode === 'register' && 'Naujo Vartotojo Registracija'}
            {mode === 'verify-email' && 'El. Pašto Verifikacija'}
            {mode === 'forgot-password' && 'Slaptažodžio Atstatymas'}
            {mode === 'forgot-email' && 'El. Pašto / Paskyros Paieška'}
          </h2>
          
          <p className="text-xs text-gray-500">
            {mode === 'login' && 'Įveskite el. paštą ir slaptažodį prisijungimui'}
            {mode === 'register' && 'Sukurkite savo paskyrą Campy.lt platformoje'}
            {mode === 'verify-email' && `Įveskite gautą verifikacijos kodą į ${pendingUserEmail}`}
            {mode === 'forgot-password' && 'Atstatykite prarastą slaptažodį per el. paštą'}
            {mode === 'forgot-email' && 'Raskite savo registruotą el. paštą pagal vardą arba telefoną'}
          </p>
        </div>

        {/* Tab Switcher for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-extrabold">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Prisijungti
            </button>
            <button
              onClick={() => { setMode('register'); setRegError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'register' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Registruotis
            </button>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2 font-medium">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
                {/* Prominent Recovery Link when password/email fails */}
                <div className="pt-1 border-t border-red-200/80 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot-password'); setResetEmail(loginEmail); }}
                    className="text-[11px] font-extrabold text-red-900 hover:text-red-950 underline text-left flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Pamiršote slaptažodį? Atstatyti per el. paštą →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-email')}
                    className="text-[11px] font-bold text-gray-700 hover:text-gray-900 underline text-left flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Neatsimenate savo registruoto el. pašto? Rasti paskyrą →</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                El. Paštas
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="vartotojas@campy.lt"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50/30"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  Slaptažodis
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setResetEmail(loginEmail); }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Pamiršote slaptažodį?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50/30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Prisijungti</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-gray-500">
              <span>Dar neturite paskyros? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Užregistruokite nemokamai
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* User Type Split Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Pasirinkite Paskyros Tipą *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedUserType('client')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedUserType === 'client'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">⛺</span>
                    {selectedUserType === 'client' && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Pasirinkta
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Keliautojas</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      Ieškau ir rezervuoju stovyklavietes, pirtis bei baidarių stovyklas.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserType('host')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedUserType === 'host'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏡</span>
                    {selectedUserType === 'host' && (
                      <span className="bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Pasirinkta
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Šeimininkas</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      Nuomoju savo privačią žemę, sodybą ar pakrantę stovyklautojams.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Vardas ir Pavardė *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Vardas Pavardė"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                El. Pašto Adresas *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="vardas@epastas.lt"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Telefonas (neprivaloma)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+370 600 00000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Slaptažodis *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Pakartoti Slaptažodį *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Avatar Photo Selector */}
            <HostPhotoUploader
              value={regAvatar}
              onChange={setRegAvatar}
              hostName={regName || 'Vartotojas'}
              label="Profilio Nuotrauka / Avataras"
            />

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Registruotis ir Gauti Verifikacijos Kodą</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* MODE 3: EMAIL OTP VERIFICATION */}
        {mode === 'verify-email' && (
          <div className="space-y-4">
            {verifySuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 font-sans animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-lg text-emerald-950">El. Paštas Patvirtintas!</h3>
                <p className="text-xs text-emerald-800">Jūsų paskyra aktyvuota ir esate prisijungę.</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyEmail} className="space-y-4 font-sans">
                
                {verifyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                  <p className="text-xs text-emerald-900 font-bold flex items-center justify-between">
                    <span>✉️ Verifikacijos kodas išsiųstas į {pendingUserEmail}</span>
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Jūsų kodas išmėginimui: <button type="button" onClick={() => setEmailOtp(simulatedCode)} className="bg-emerald-200 hover:bg-emerald-300 px-2.5 py-0.5 rounded text-emerald-950 font-black text-sm font-mono cursor-pointer border border-emerald-300 inline-flex items-center gap-1" title="Paspauskite įrašyti"><span>{simulatedCode}</span> <span className="text-[10px] text-emerald-900 font-bold">(Įrašyti)</span></button>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-800 mb-1.5 text-center">
                    Įveskite 4 skaitmenų El. Pašto Verifikacijos Kodą:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder={simulatedCode}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-400 text-center font-mono font-black text-xl tracking-widest bg-emerald-50/30 text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Patvirtinti El. Paštą ir Aktyvuoti</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 4: FORGOT PASSWORD RECOVERY */}
        {mode === 'forgot-password' && (
          <div className="space-y-4 font-sans">
            
            {resetSuccessMessage ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 font-sans animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-lg text-emerald-950">Slaptažodis Pakeistas!</h3>
                <p className="text-xs text-emerald-800">{resetSuccessMessage}</p>
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {/* Step 1: Request Reset Code */}
                {resetStep === 1 && (
                  <form onSubmit={handleRequestResetCode} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Įveskite savo Registruotą El. Paštą
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="jusu@epastas.lt"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>Gauti Slaptažodžio Atstatymo Kodą</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Step 2: Enter OTP Reset Code */}
                {resetStep === 2 && (
                  <form onSubmit={handleVerifyResetCode} className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <p className="text-xs text-amber-950 font-bold">
                        🔑 Slaptažodžio atstatymo kodas išsiųstas į {resetEmail}
                      </p>
                      <p className="text-xs text-amber-900 font-medium">
                        Kodas išmėginimui: <button type="button" onClick={() => setResetCodeInput(simulatedResetCode)} className="bg-amber-200 hover:bg-amber-300 px-2.5 py-0.5 rounded text-amber-950 font-black text-sm font-mono cursor-pointer border border-amber-300 inline-flex items-center gap-1" title="Paspauskite įrašyti"><span>{simulatedResetCode}</span> <span className="text-[10px] text-amber-900 font-bold">(Įrašyti)</span></button>
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-800 mb-1">
                        Įveskite 4 skaitmenų Atstatymo Kodą:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={resetCodeInput}
                        onChange={(e) => setResetCodeInput(e.target.value)}
                        placeholder={simulatedResetCode}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-400 text-center font-mono font-black text-lg tracking-widest bg-amber-50/20 text-gray-900 focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Patvirtinti Kodą ir Įvesti Naują Slaptažodį</span>
                    </button>
                  </form>
                )}

                {/* Step 3: Set New Password */}
                {resetStep === 3 && (
                  <form onSubmit={handleSetNewPassword} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Naujas Slaptažodis
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Naujas slaptažodis"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Pakartoti Naują Slaptažodį
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Pakartokite naują slaptažodį"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Išsaugoti Naują Slaptažodį</span>
                    </button>
                  </form>
                )}
              </>
            )}

            <div className="pt-2 text-center text-[11px]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-gray-600 hover:text-gray-900 underline cursor-pointer"
              >
                ← Grįžti į Prisijungimą
              </button>
            </div>
          </div>
        )}

        {/* MODE 5: FORGOT EMAIL / ACCOUNT RECOVERY */}
        {mode === 'forgot-email' && (
          <div className="space-y-4 font-sans">
            <form onSubmit={handleSearchRecoverEmail} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Įveskite Vardą, Pavardę arba Telefoną
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={recoverQuery}
                    onChange={(e) => setRecoverQuery(e.target.value)}
                    placeholder="Mantas arba +370600..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                Iškviesti Paskyros Paiešką
              </button>
            </form>

            {recoverSearched && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block">Rastos Paskyros:</span>
                {foundUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                    Paskyrų pagal įvestą paiešką nerasta. Užregistruokite naują vartotoją.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {foundUsers.map((usr) => (
                      <div key={usr.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover border border-emerald-500" />
                          <div>
                            <span className="font-extrabold text-gray-900 block">{usr.name}</span>
                            <span className="text-emerald-900 font-mono font-bold block">{usr.email}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginEmail(usr.email);
                            setMode('login');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] uppercase cursor-pointer shrink-0"
                        >
                          Prisijungti
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-center text-[11px]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-gray-600 hover:text-gray-900 underline cursor-pointer"
              >
                ← Grįžti į Prisijungimą
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
