import React, { useState } from 'react';
import { Campsite, Booking } from '../types';
import { useCampsites } from '../context/CampsiteContext';
import { CheckCircle, ShieldCheck, X, MapPin, CreditCard, Lock, Shield, Info, ArrowRight } from 'lucide-react';
import { OrderApproxMap } from './OrderApproxMap';
import { calculateFullPricing } from '../utils/pricing';

interface BookingModalProps {
  campsite: Campsite;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalNights: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  campsite,
  checkIn,
  checkOut,
  guestsCount,
  totalNights,
  nightlyRate,
  cleaningFee,
  onClose
}) => {
  const { addBooking, setView } = useCampsites();

  const [guestName, setGuestName] = useState('Giedrius Stajeris');
  const [guestEmail, setGuestEmail] = useState('giedrius@example.com');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Exact dynamic pricing calculation according to user formula
  const pricing = calculateFullPricing(nightlyRate, totalNights, cleaningFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const created = addBooking({
        campsiteId: campsite.id,
        campsiteTitle: campsite.title,
        campsiteImage: campsite.images[0],
        location: campsite.location,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        guestsCount,
        totalNights,
        nightlyRate,
        cleaningFee,
        serviceFee: pricing.platformFeeEur,
        totalPrice: pricing.totalGuestPrice,
        bookingSubtotal: pricing.bookingSubtotal,
        platformFeeCents: pricing.platformFeeCents,
        platformFeeEur: pricing.platformFeeEur,
        feePercentage: pricing.feePercentage,
        hostPayoutAmount: pricing.hostPayoutAmount,
        stripePaymentStatus: 'succeeded_escrow_held',
        escrowStatus: 'held_in_escrow',
        paymentMethodType: 'card',
        stripePaymentIntentId: `pi_stripe_escrow_${Date.now()}`,
        propertyType: campsite.propertyType,
      });

      setIsProcessing(false);
      setConfirmedBooking(created);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-150 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Stripe Escrow Apsaugotas Mokėjimas</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Mokėjimas ir Užsakymas</h3>
            </div>

            {/* Campsite summary card */}
            <div className="flex gap-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-150">
              <img
                src={campsite.images[0]}
                alt={campsite.title}
                className="w-18 h-18 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{campsite.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {campsite.location}
                </p>
                <p className="text-xs font-bold text-emerald-800">
                  {checkIn} iki {checkOut} ({totalNights} nakt., {guestsCount} sveč.)
                </p>
              </div>
            </div>

            {/* Price Breakdown according to requested tiered formula */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{totalNights} nakt. × €{nightlyRate}</span>
                <span className="font-bold text-gray-900">€{pricing.nightsSubtotal}</span>
              </div>

              {cleaningFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Valymo / paruošimo mokestis</span>
                  <span className="font-bold text-gray-900">€{cleaningFee}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700 font-bold border-t border-gray-200 pt-1.5">
                <span>Užsakymo tarpinė suma (Subtotal)</span>
                <span>€{pricing.bookingSubtotal}</span>
              </div>

              {/* Dynamic Tiered Platform Fee Calculation */}
              <div className="flex justify-between items-center text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                <div>
                  <span className="font-extrabold block">Platformos paslaugų mokestis ({pricing.feePercentageLabel})</span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Stripe mokesčių apsaugos min. 5.00 EUR ({pricing.platformFeeCents} ct)
                  </span>
                </div>
                <span className="font-black text-sm text-emerald-800">€{pricing.platformFeeEur}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-black text-base text-gray-900">
                <span>Viso mokėti (Ašaldoma Escrow):</span>
                <span className="text-xl text-emerald-700">€{pricing.totalGuestPrice}</span>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-blue-900">
                <Lock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Stripe Escrow Pinigų Užlaikymas:</span>
              </div>
              <p className="text-blue-900 leading-relaxed font-medium">
                Jūsų sumokėta <strong>€{pricing.totalGuestPrice}</strong> suma bus saugiai užlaikyta „Stripe Escrow“ depozite. Šeimininkas gaus išmoką (<strong>€{pricing.hostPayoutAmount}</strong>) tik atvykimo dieną. Taip pat atlikę šį apmokėjimą įgysite <strong>100% teisę palikti verifikuotą atsiliepimą</strong> po viešnagės.
              </p>
            </div>

            {/* Guest details inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Vardas ir Pavardė *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">El. pašto adresas *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Interactive Stripe Payment Card Element */}
              <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Mokėjimo Kortelė (Stripe Checkout)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                    256-bit SSL
                  </span>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Kortelės numeris</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Galiojimas</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">CVC / CVC2</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-emerald-200" />
              <span>
                {isProcessing ? 'Tvirtinamas Stripe Escrow Mokėjimas...' : `Apmokėti €${pricing.totalGuestPrice} per Stripe Escrow`}
              </span>
            </button>
          </form>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                ✓ Stripe Escrow Užstatas Patvirtintas
              </span>
              <h3 className="text-2xl font-black text-gray-900">Užsakymas Apmokėtas ir Patvirtintas!</h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                Jūsų užsakymas (ID: <strong className="text-gray-900">{confirmedBooking?.id}</strong>) yra sėkmingai apmokėtas per Stripe. Pinigai saugiai užlaikyti Escrow sistemoje.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-150 text-left text-xs space-y-2 font-sans">
              <div className="flex justify-between text-gray-600">
                <span>Stovyklavietė:</span>
                <span className="font-bold text-gray-900">{campsite.title}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Datos:</span>
                <span className="font-bold text-gray-900">{checkIn} iki {checkOut} ({totalNights} nakt.)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Apmokėta suma (Ašaldyta Escrow):</span>
                <span className="font-black text-emerald-800">€{pricing.totalGuestPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platformos mokestis ({pricing.feePercentageLabel}):</span>
                <span className="font-bold text-gray-900">€{pricing.platformFeeEur} ({pricing.platformFeeCents} ct)</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-1.5">
                <span>Šeimininko išmoka atvykus:</span>
                <span className="font-bold text-gray-900">€{pricing.hostPayoutAmount}</span>
              </div>
            </div>

            <OrderApproxMap 
              latitude={campsite.latitude} 
              longitude={campsite.longitude} 
              locationName={campsite.location} 
              campsiteTitle={campsite.title}
              height="140px" 
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  setView('my-trips');
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Mano Užsakymai & Atsiliepimai</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
