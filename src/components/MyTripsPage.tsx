import React, { useState } from 'react';
import { 
  Briefcase, Calendar, MapPin, CheckCircle2, Clock, XCircle, Tent, ArrowRight, 
  Map, Star, ShieldCheck, Upload, Building2, Copy, Check, Search, AlertTriangle, FileText
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { OrderApproxMap } from './OrderApproxMap';
import { ReviewModal } from './ReviewModal';
import { VisitArrivalConfirmationCard } from './VisitArrivalConfirmationCard';
import { ConfirmedBookingDetailsCard } from './ConfirmedBookingDetailsCard';
import { HoldCountdownTimer } from './HoldCountdownTimer';
import { PaymentProofUploadModal } from './PaymentProofUploadModal';
import { GuestPortalModal } from './GuestPortalModal';
import { Booking, Campsite } from '../types';

export const MyTripsPage: React.FC = () => {
  const { campsites, bookings, setView, selectCampsiteById, uploadPaymentProof } = useCampsites();
  const [openMapBookingId, setOpenMapBookingId] = useState<string | null>(null);
  
  // Modals
  const [selectedReviewTarget, setSelectedReviewTarget] = useState<{ booking: Booking; campsite: Campsite } | null>(null);
  const [uploadModalBooking, setUploadModalBooking] = useState<Booking | null>(null);
  const [isGuestPortalOpen, setIsGuestPortalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleMap = (id: string) => {
    setOpenMapBookingId(prev => prev === id ? null : id);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div id="my-trips-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-gray-50 font-sans">
      
      {/* Review Modal */}
      {selectedReviewTarget && (
        <ReviewModal
          isOpen={!!selectedReviewTarget}
          onClose={() => setSelectedReviewTarget(null)}
          booking={selectedReviewTarget.booking}
          campsite={selectedReviewTarget.campsite}
        />
      )}

      {/* Payment Proof Upload Modal */}
      {uploadModalBooking && (
        <PaymentProofUploadModal
          isOpen={!!uploadModalBooking}
          onClose={() => setUploadModalBooking(null)}
          booking={uploadModalBooking}
          onUploadSuccess={(url, note) => {
            uploadPaymentProof(uploadModalBooking.id, url, note);
          }}
        />
      )}

      {/* Guest Portal Lookup Modal */}
      <GuestPortalModal
        isOpen={isGuestPortalOpen}
        onClose={() => setIsGuestPortalOpen(false)}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 font-sans">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-emerald-600" />
            <span>Mano Užsakymai ir Kelionės</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Stebėkite 4 žingsnių rezervacijos būseną, atlikite bankinį pavedimą bei atsisiųskite atvykimo instrukcijas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGuestPortalOpen(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Užsakymo paieška pagal kodą</span>
          </button>

          <button
            onClick={() => setView('search')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-all"
          >
            Ieškoti stovyklaviečių
          </button>
        </div>
      </div>

      {/* Trips list */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-150 text-center space-y-4 shadow-xs font-sans">
          <Tent className="w-16 h-16 text-emerald-600/30 mx-auto" />
          <h3 className="font-bold text-2xl text-gray-900">Užsakytų kelionių dar nėra</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
            Raskite išskirtines privačias stovyklavietes, glamping namelius bei kemperių aikšteles visoje Lietuvoje.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setIsGuestPortalOpen(true)}
              className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 font-bold rounded-xl text-xs cursor-pointer"
            >
              Įvesti kodo nr.
            </button>
            <button
              onClick={() => setView('search')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
            >
              Ieškoti stovyklaviečių
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {bookings.map(bk => {
            const camp = campsites.find(c => c.id === bk.campsiteId);
            const isMapOpen = openMapBookingId === bk.id;
            const lat = camp?.latitude || 55.1694;
            const lng = camp?.longitude || 23.8813;
            const bank = bk.hostBankDetails || {
              iban: 'LT79 7044 0600 0123 4567',
              bankName: 'Swedbank',
              receiverName: camp?.host.name || 'Šeimininkas',
              paymentReference: bk.id
            };

            // Progress step mapping (1-4)
            let currentStep = 1;
            if (bk.status === 'held_for_payment') currentStep = 2;
            if (bk.status === 'payment_submitted' || bk.status === 'payment_not_found') currentStep = 3;
            if (bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed') currentStep = 4;
            const isCancelled = bk.status === 'declined_by_host' || bk.status === 'payment_hold_expired' || bk.status === 'rejected';

            return (
              <div
                key={bk.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6 overflow-hidden"
              >
                {/* Top Info Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-950 rounded-xl font-mono text-xs font-black tracking-wider">
                      {bk.accessCode || bk.id}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">Užsakyta {bk.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : bk.status === 'held_for_payment'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : bk.status === 'payment_submitted'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Patvirtinta ir Apmokėta</span>
                        </>
                      ) : bk.status === 'held_for_payment' ? (
                        <>
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Mokėjimo Laikymas (12 val.)</span>
                        </>
                      ) : bk.status === 'payment_submitted' ? (
                        <>
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Mokėjimo Kvitai Tikrinami</span>
                        </>
                      ) : isCancelled ? (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Atsaukta / Pasibaigusi</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Laukiama Šeimininko Patvirtinimo</span>
                        </>
                      )}
                    </span>

                    {bk.holdExpiresAt && (bk.status === 'held_for_payment' || bk.status === 'payment_submitted') && (
                      <HoldCountdownTimer expiresAt={bk.holdExpiresAt} />
                    )}
                  </div>
                </div>

                {/* 4-Step Lifecycle Progress Bar */}
                {!isCancelled && (
                  <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-150">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-3">
                      Rezervacijos Eiga (4 Žingsniai)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      
                      <div className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        currentStep >= 1 
                          ? 'bg-white text-emerald-950 border-emerald-300 shadow-2xs' 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                            currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>1</span>
                          <span className="font-extrabold text-[11px]">Svečio Užklausa</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal block">Pateikta šeimininkui</span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        currentStep >= 2 
                          ? 'bg-white text-emerald-950 border-emerald-300 shadow-2xs' 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                            currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>2</span>
                          <span className="font-extrabold text-[11px]">12 val. Laikymas</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal block">Datos užrakintos</span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        currentStep >= 3 
                          ? 'bg-white text-emerald-950 border-emerald-300 shadow-2xs' 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                            currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>3</span>
                          <span className="font-extrabold text-[11px]">Banko Įrodymas</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal block">Kvitai įkelti</span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        currentStep >= 4 
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                            currentStep >= 4 ? 'bg-white text-emerald-900' : 'bg-gray-300 text-gray-600'
                          }`}>4</span>
                          <span className="font-extrabold text-[11px]">Patvirtinta & Kodas</span>
                        </div>
                        <span className={`text-[10px] font-normal block ${currentStep >= 4 ? 'text-emerald-100' : 'text-gray-500'}`}>Atvykimo raktas</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* Main Card Content */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={bk.campsiteImage}
                      alt={bk.campsiteTitle}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 cursor-pointer bg-gray-100"
                      onClick={() => selectCampsiteById(bk.campsiteId)}
                    />
                    <div className="space-y-1.5">
                      <h3 
                        onClick={() => selectCampsiteById(bk.campsiteId)}
                        className="font-bold text-gray-900 text-lg hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        {bk.campsiteTitle}
                      </h3>

                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {bk.location}
                      </p>

                      <p className="text-xs text-gray-700 font-bold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{bk.checkIn} iki {bk.checkOut} ({bk.totalNights} nakt.)</span>
                        <span>•</span>
                        <span>{bk.guestsCount} asm.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 flex-wrap">
                    <button
                      onClick={() => toggleMap(bk.id)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isMapOpen 
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs' 
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <Map className="w-4 h-4 text-current shrink-0" />
                      <span>{isMapOpen ? 'Slėpti žemėlapį' : 'Apytikslė vieta'}</span>
                    </button>

                    <div className="text-right ml-2">
                      <span className="block text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Sumokėti Šeimininkui
                      </span>
                      <span className="text-xl font-black text-emerald-800 block mt-0.5">€{bk.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Review Action for Confirmed Stays */}
                    {(bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed') && camp && (() => {
                      const existingReview = camp.reviews?.find(r => r.bookingId === bk.id);
                      if (existingReview) {
                        return (
                          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Įvertinta: {existingReview.rating}.0 ★</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => setSelectedReviewTarget({ booking: bk, campsite: camp })}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          <span>Palikti atsiliepimą</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* STEP 2: Held For Payment - Bank Transfer Details Card & Proof Upload */}
                {bk.status === 'held_for_payment' && (
                  <div className="bg-amber-50/90 rounded-2xl p-5 border border-amber-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-700" />
                          Šeimininkas patvirtino galimybę! Atlikite bankinį pavedimą per 12 val.
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Jūsų datos užrakintos. Atlikę bankinį pervedimą, įkelkite mokėjimo išrašą.
                        </p>
                      </div>

                      <button
                        onClick={() => setUploadModalBooking(bk)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer shrink-0 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>📤 Įkelti bankinio mokėjimo kvitą</span>
                      </button>
                    </div>

                    {/* Bank Account Info Box */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
                      <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Gavėjas</span>
                          <span className="font-bold text-gray-900">{bank.receiverName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.receiverName, `rec-${bk.id}`)}
                          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-800 transition-colors"
                        >
                          {copiedField === `rec-${bk.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Sąskaita IBAN ({bank.bankName})</span>
                          <span className="font-mono font-bold text-emerald-900">{bank.iban}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.iban, `iban-${bk.id}`)}
                          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-800 transition-colors"
                        >
                          {copiedField === `iban-${bk.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Mokėjimo paskirtis</span>
                          <span className="font-bold text-gray-900">{bank.paymentReference}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.paymentReference, `ref-${bk.id}`)}
                          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-800 transition-colors"
                        >
                          {copiedField === `ref-${bk.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment Submitted - Reviewing Proof */}
                {bk.status === 'payment_submitted' && (
                  <div className="bg-blue-50/90 rounded-2xl p-5 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Mokėjimo kvitai sėkmingai įkelti! Šeimininkas tikrina banko pavedimą.</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-black">
                        Tikrinama
                      </span>
                    </div>

                    {bk.paymentProofUrl && (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-200/60">
                        <img src={bk.paymentProofUrl} alt="Kvitai" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        <div className="text-xs">
                          <span className="font-bold text-gray-800 block">Įkeltas bankinis išrašas</span>
                          {bk.paymentProofNote && <span className="text-gray-500 italic block">"{bk.paymentProofNote}"</span>}
                          <span className="text-[10px] text-gray-400">{bk.paymentProofUploadedAt ? new Date(bk.paymentProofUploadedAt).toLocaleString('lt-LT') : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Confirmed Travel, Exact Location & Arrival Instructions Card */}
                {(bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed') && camp && (
                  <div className="pt-2">
                    <ConfirmedBookingDetailsCard booking={bk} campsite={camp} defaultExpanded={true} />
                  </div>
                )}

                {/* Visit Arrival Confirmation & Escrow Section */}
                {(bk.status === 'confirmed' || bk.status === 'approved' || bk.status === 'completed') && (
                  <div className="pt-1">
                    <VisitArrivalConfirmationCard booking={bk} role="guest" />
                  </div>
                )}

                {/* Map Section */}
                {isMapOpen && (
                  <div className="pt-2 border-t border-gray-100 animate-in fade-in duration-200">
                    <OrderApproxMap 
                      latitude={lat} 
                      longitude={lng} 
                      locationName={bk.location} 
                      campsiteTitle={bk.campsiteTitle}
                      height="220px" 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
