import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, User, Mail, Phone, MessageSquare, 
  MapPin, ArrowLeft, Filter, Check, X, ShieldCheck, DollarSign, Upload, Building2, Eye, FileText
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Booking } from '../types';
import { OrderApproxMap } from './OrderApproxMap';
import { MiniReservationCalendar } from './MiniReservationCalendar';
import { HoldCountdownTimer } from './HoldCountdownTimer';

export const PendingRequestsPage: React.FC = () => {
  const { 
    campsites, bookings, approveHostAvailability, confirmHostPayment, 
    markPaymentNotFound, declineBooking, setView, t 
  } = useCampsites();

  const [filterTab, setFilterTab] = useState<'all' | 'awaiting' | 'held' | 'proof' | 'confirmed'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedContactBooking, setSelectedContactBooking] = useState<Booking | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<{ url: string; note?: string } | null>(null);

  const awaitingCount = bookings.filter(b => b.status === 'awaiting_host_response' || b.status === 'pending' || b.status === 'free_inquiry').length;
  const heldCount = bookings.filter(b => b.status === 'held_for_payment').length;
  const proofSubmittedCount = bookings.filter(b => b.status === 'payment_submitted').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved' || b.status === 'completed').length;

  const filteredBookings = bookings.filter(b => {
    if (filterTab === 'awaiting') return b.status === 'awaiting_host_response' || b.status === 'pending' || b.status === 'free_inquiry';
    if (filterTab === 'held') return b.status === 'held_for_payment';
    if (filterTab === 'proof') return b.status === 'payment_submitted' || b.status === 'payment_not_found';
    if (filterTab === 'confirmed') return b.status === 'confirmed' || b.status === 'approved' || b.status === 'completed';
    return true;
  });

  const handleApproveAvailability = (id: string, guestName: string) => {
    approveHostAvailability(id);
    setToastMessage(`Laisvumas patvirtintas! Svečiui ${guestName} nustatytas 12 val. laikymo laikas ir išsiųsti rekvizitai.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmPayment = (id: string, guestName: string) => {
    confirmHostPayment(id);
    setToastMessage(`Mokėjimas patvirtintas! Svečiui ${guestName} atrakintos atvykimo instrukcijos.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePaymentNotFound = (id: string) => {
    markPaymentNotFound(id);
    setToastMessage(`Mokėjimas pažymėtas kaip nerastas.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDecline = (id: string) => {
    declineBooking(id);
    setToastMessage(`Užklausa atmesta.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div id="pending-requests-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 min-h-screen">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Proof Preview Modal */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">Įkeltas Banko Pavedimo Kvietas</h3>
              <button onClick={() => setViewProofUrl(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={viewProofUrl.url} alt="Banko kvitai" className="w-full h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50" />
            {viewProofUrl.note && (
              <p className="text-xs text-gray-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 italic">
                Svečio pastaba: "{viewProofUrl.note}"
              </p>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewProofUrl(null)}
                className="px-5 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl"
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Back Action */}
      <div className="space-y-4 font-sans">
        <button
          onClick={() => setView('host-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Grįžti į Šeimininko Skydą</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Užsakymų ir Mokėjimų Valdymas
              </h1>
              {awaitingCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-xs animate-pulse">
                  {awaitingCount} Naujos užklausos
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1">
              4 žingsnių sistema: Užklausa ➔ 12 val. Laikymas ➔ Banko Kvitų Tikrinimas ➔ Patvirtinimas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Filter Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 font-sans">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterTab === 'all' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          Visi užsakymai ({bookings.length})
        </button>

        <button
          onClick={() => setFilterTab('awaiting')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterTab === 'awaiting' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <span>📩 Naujos užklausos</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{awaitingCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('held')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterTab === 'held' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span>⏳ 12 val. Laikymas</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{heldCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('proof')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterTab === 'proof' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span>📄 Mokėjimų tikrinimas</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{proofSubmittedCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('confirmed')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterTab === 'confirmed' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-emerald-950 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span>✅ Patvirtinti</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{confirmedCount}</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-6 font-sans">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-3">
            <Clock className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">Šioje kategorijoje užsakymų nėra</h3>
            <p className="text-xs text-gray-500">Pasirinkite kitą skirtuką arba laukite naujų svečių užklausų.</p>
          </div>
        ) : (
          filteredBookings.map(bk => {
            const camp = campsites.find(c => c.id === bk.campsiteId);

            return (
              <div 
                key={bk.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-950 rounded-xl font-mono text-xs font-black">
                      {bk.accessCode || bk.id}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{bk.campsiteTitle}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {bk.holdExpiresAt && (bk.status === 'held_for_payment' || bk.status === 'payment_submitted') && (
                      <HoldCountdownTimer expiresAt={bk.holdExpiresAt} />
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : bk.status === 'held_for_payment'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : bk.status === 'payment_submitted'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : bk.status === 'payment_not_found'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed' ? '✓ Patvirtinta' :
                       bk.status === 'held_for_payment' ? '12 val. Laikymas' :
                       bk.status === 'payment_submitted' ? 'Mokėjimo Kvitai Įkelti' :
                       bk.status === 'payment_not_found' ? 'Mokėjimas Nerastas' :
                       'Laukia Atsakymo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Guest info & note */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                      <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                        {bk.guestName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-gray-900 text-sm">{bk.guestName}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <a href={`mailto:${bk.guestEmail}`} className="flex items-center gap-1 hover:text-emerald-700">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{bk.guestEmail}</span>
                          </a>
                          {bk.guestPhone && (
                            <a href={`tel:${bk.guestPhone}`} className="flex items-center gap-1 hover:text-emerald-700">
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-bold">{bk.guestPhone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {bk.guestNote && (
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 italic">
                        <span className="font-bold uppercase text-[10px] text-stone-400 block not-italic mb-1">Žinutė Šeimininkui</span>
                        "{bk.guestNote}"
                      </div>
                    )}

                    {/* Proof Preview Banner for Host */}
                    {bk.paymentProofUrl && (
                      <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={bk.paymentProofUrl} alt="Banko Kvitai" className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-white" />
                          <div className="text-xs">
                            <span className="font-extrabold text-blue-950 block">Įkeltas bankinis kvitus/išrašas</span>
                            {bk.paymentProofNote && <span className="text-blue-800 italic block">"{bk.paymentProofNote}"</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => setViewProofUrl({ url: bk.paymentProofUrl!, note: bk.paymentProofNote })}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Peržiūrėti kvitą</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions per step */}
                  <div className="lg:col-span-5 space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                    
                    <div className="text-xs space-y-2 border-b border-gray-200/80 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Datos:</span>
                        <span className="font-bold text-gray-900">{bk.checkIn} — {bk.checkOut} ({bk.totalNights} nakt.)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Svečiai:</span>
                        <span className="font-bold text-gray-900">{bk.guestsCount} asm.</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                        <span className="font-extrabold text-gray-900">Suma:</span>
                        <span className="text-xl font-black text-emerald-900">€{bk.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action buttons based on status */}
                    {(bk.status === 'awaiting_host_response' || bk.status === 'pending' || bk.status === 'free_inquiry') && (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => handleApproveAvailability(bk.id, bk.guestName)}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Patvirtinti laisvumą ir laikyti (12 val.)</span>
                        </button>

                        <button
                          onClick={() => handleDecline(bk.id)}
                          className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Atmesti užklausą</span>
                        </button>
                      </div>
                    )}

                    {bk.status === 'held_for_payment' && (
                      <div className="space-y-2 pt-1 text-center">
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
                          ⏳ Datos laikinai užrakintos. Laukiama, kol svečias atliks bankinį pervedimą.
                        </div>
                        <button
                          onClick={() => handleDecline(bk.id)}
                          className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-gray-200 text-xs font-bold rounded-xl"
                        >
                          Atšaukti laikymą
                        </button>
                      </div>
                    )}

                    {bk.status === 'payment_submitted' && (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => handleConfirmPayment(bk.id, bk.guestName)}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>✓ Patvirtinti mokėjimo gavimą</span>
                        </button>

                        <button
                          onClick={() => handlePaymentNotFound(bk.id)}
                          className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Mokėjimas nerastas</span>
                        </button>
                      </div>
                    )}

                    {(bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed') && (
                      <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-extrabold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-700" />
                        <span>Rezervacija galutinai patvirtinta!</span>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
