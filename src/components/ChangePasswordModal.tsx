import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLoginPrompt?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isFirstLoginPrompt = false
}) => {
  const { currentUser, changeUserPassword } = useCampsites();

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setErrorMsg('');
      setSuccessMsg('');
      setNewPassword('');
      setConfirmPassword('');
      // If user has primary password set, prefill current password
      if (currentUser.primaryPassword) {
        setCurrentPasswordInput(currentUser.primaryPassword);
      } else if (currentUser.password) {
        setCurrentPasswordInput(currentUser.password);
      } else {
        setCurrentPasswordInput('');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Silpnas', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Vidutinis', color: 'bg-amber-500' };
    return { score: 3, label: 'Stiprus', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let generated = 'CAMPY-';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPasswords(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Naujas slaptažodis turi būti bent 6 simbolių ilgio.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Nauji slaptažodžiai nesutampa! Patikrinkite įvestį.');
      return;
    }

    setIsSubmitting(true);
    const res = changeUserPassword(currentUser.id, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Slaptažodis sėkmingai pakeistas ir atnaujintas!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Nepavyko pakeisti slaptažodžio.');
    }
  };

  const isMustChange = currentUser.mustChangePassword || isFirstLoginPrompt;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Close Button */}
        {!isMustChange && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pr-2">
          <div className="inline-flex p-3 bg-amber-100 text-amber-900 rounded-2xl mb-1 shadow-xs border border-amber-200">
            <KeyRound className="w-7 h-7 text-amber-700" />
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            {isMustChange ? 'Pirminio Slaptažodžio Keitimas' : 'Keisti Paskyros Slaptažodį'}
          </h2>
          
          <p className="text-xs text-gray-500">
            {isMustChange 
              ? 'Prisijungėte su pirminiu slaptažodžiu. Sukurkite naują asmeninį slaptažodį saugumui užtikrinti.'
              : 'Įveskite naują saugų slaptažodį savo paskyros apsaugai.'
            }
          </p>
        </div>

        {/* Primary Password First Login Banner */}
        {isMustChange && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5 font-medium">
            <div className="flex items-center gap-2 font-black text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pirminis Prisijungimas Sėkmingas!</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Dėl saugumo reikalavimų, po pirmojo prisijungimo privalote susikurti asmeninį naują slaptažodį.
            </p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-black text-base text-emerald-950">{successMsg}</h3>
            <p className="text-xs text-emerald-800">Uždaroma...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Current / Primary Password field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Dabartinis / Pirminis Slaptažodis
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Dabartinis slaptažodis"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-gray-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  Naujas Slaptažodis *
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Sugeneruoti saugų</span>
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Naujas slaptažodis (bent 6 simba)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-gray-500">Slaptažodžio stiprumas:</span>
                    <span className={`font-black ${strength.score === 1 ? 'text-rose-600' : strength.score === 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Pakartokite Naują Slaptažodį *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Pakartokite naują slaptažodį"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Validation checklist */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-[11px] text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className={newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {newPassword.length >= 6 ? '✓' : '○'} Bent 6 simbolių ilgio
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {newPassword && newPassword === confirmPassword ? '✓' : '○'} Slaptažodžiai sutampa
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-950" />
              <span>{isMustChange ? 'Išsaugoti Naują Slaptažodį Ir Tęsti' : 'Atnaujinti Slaptažodį'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
