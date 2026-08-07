import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Mail, ShieldAlert, DollarSign, Send, Zap, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import { Booking } from '../types';
import { useCampsites } from '../context/CampsiteContext';

interface VisitArrivalConfirmationCardProps {
  booking: Booking;
  role?: 'guest' | 'host' | 'admin';
}

export const VisitArrivalConfirmationCard: React.FC<VisitArrivalConfirmationCardProps> = ({ booking, role = 'guest' }) => {
  const { confirmVisitStart, releaseEscrowPayout } = useCampsites();
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Today ISO YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckInDayOrPassed = booking.checkIn <= todayStr;

  // Calculate remaining time for 24h escrow release
  const calculateEscrowTimer = () => {
    if (!booking.escrowPayoutReleaseAt) return null;
    const releaseTime = new Date(booking.escrowPayoutReleaseAt).getTime();
    const currentTime = now.getTime();
    const diffMs = releaseTime - currentTime;

    if (diffMs <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, expired: false };
  };

  const escrowTimer = calculateEscrowTimer();

  const handleConfirmArrival = () => {
    confirmVisitStart(booking.id);
  };

  const handleSimulate24hPayout = () => {
    releaseEscrowPayout(booking.id);
  };

  if (booking.status !== 'approved' && booking.status !== 'completed') {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white p-5 space-y-4 shadow-md font-sans border border-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-white">Stripe Escrow Apsilankymo Saugumas</h4>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                16:00 Check-In Taisyklė
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Apsilankymo pradžios patvirtinimas ir 24h šeimininko išmokėjimo laikmatis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEmailModal(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Žiūrėti 16:00 El. Laišką</span>
        </button>
      </div>

      {/* Case 1: Payout already released */}
      {booking.escrowStatus === 'payout_released_to_host' || booking.stripePaymentStatus === 'payout_released' ? (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Stripe Escrow Lėšos Sėkmingai Išmokėtos Šeimininkui</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">
              €{booking.hostPayoutAmount || booking.totalPrice} Išmokėta
            </span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Apsilankymas sėkmingai patvirtintas ir praėjo 24 val. po atvykimo. Lėšos pervestos į šeimininko banko sąskaitą per Stripe.
          </p>
        </div>
      ) : booking.visitConfirmedByGuest ? (
        /* Case 2: Visit confirmed by guest, 24h timer counting down */
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/40 pb-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-extrabold text-amber-200 text-xs">Apsilankymo Pradžia Patvirtinta!</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Patvirtinta: {booking.visitConfirmedAt ? new Date(booking.visitConfirmedAt).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }) : 'Šiandien'}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="px-3.5 py-2 bg-amber-500/20 rounded-xl border border-amber-400/50 font-mono text-center">
              <span className="block text-[9px] uppercase tracking-wider text-amber-300 font-sans font-bold">Išmokėjimas po 24h</span>
              <span className="text-amber-200 font-black text-sm">
                {escrowTimer?.expired ? '24h Praėjo (Pasiruošta išmokėti)' : `${escrowTimer?.hours}val. ${escrowTimer?.minutes}min. ${escrowTimer?.seconds}s.`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-md">
              Šeimininkas gaus <strong>€{booking.hostPayoutAmount || booking.totalPrice}</strong> išmokėjimą po 24 val. po apsilankymo pradžios patvirtinimo.
            </p>

            <button
              type="button"
              onClick={handleSimulate24hPayout}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 self-start sm:self-auto"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Simuliuoti 24h Prabėgimą (Išmokėti)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Case 3: Waiting for guest confirmation after start day 16:00 */
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-white text-xs">
                  {isCheckInDayOrPassed ? 'Atvykimo Diena (Po 16:00 Check-In)' : `Laukiama atvykimo dienos (${booking.checkIn})`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El. laiškas išsiųstas klientui. Įsikūrę stovyklavietėje, paspauskite mygtuką žemiau patvirtinimui.
              </p>
            </div>

            {isCheckInDayOrPassed ? (
              <button
                type="button"
                onClick={handleConfirmArrival}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shrink-0 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Patvirtinti Apsilankymo Pradžią</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 bg-slate-800 text-slate-400 rounded-xl text-[11px] font-bold border border-slate-700">
                Apsilankymo patvirtinimas aktyvuosis {booking.checkIn} nuo 16:00 val.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulated Email Notification Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <div className="flex justify-between items-start border-b border-gray-150 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900">Simuliuotas 16:00 Check-In El. Laiškas</h3>
                  <p className="text-xs text-gray-500">Išsiųstas klientui {booking.guestEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Email Message Preview Box */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-3 leading-relaxed text-gray-800">
              <div className="border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-500 block">Nuo: info@stovyklauk.lt</span>
                <span className="font-bold text-gray-900 block mt-0.5">Tema: ⛺ Sveiki atvykę į {booking.campsiteTitle}! Patvirtinkite apsilankymo pradžią</span>
              </div>

              <p className="font-bold text-gray-900">Sveiki, {booking.guestName},</p>

              <p>
                Šiandien 16:00 val. prasidėjo jūsų rezervacija stovyklavietėje <strong>„{booking.campsiteTitle}“</strong> ({booking.location}).
              </p>

              <p>
                Norėdami užtikrinti sklandų Stripe Escrow saugų išmokėjimą šeimininkui, prašome patvirtinti, kad jau atvykote ir įsikūrėte.
              </p>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Kaip veikia Stripe Escrow?</span>
                </div>
                <p className="text-[11px]">
                  Paspaudus „Patvirtinti Apsilankymą“, pradedamas skaičiuoti <strong>24 valandų laikmatis</strong>. Lėšos šeimininkui bus pervestos tik praėjus 24 valandoms po atvykimo patvirtinimo.
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmArrival();
                    setShowEmailModal(false);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Patvirtinti Apsilankymo Pradžią Dabar</span>
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Uždaryti peržiūrą
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
