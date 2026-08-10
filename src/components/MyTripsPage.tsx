import React, { useState } from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle, Clock, XCircle, Tent, ArrowRight, Map, Star, ShieldCheck } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { OrderApproxMap } from './OrderApproxMap';
import { ReviewModal } from './ReviewModal';
import { VisitArrivalConfirmationCard } from './VisitArrivalConfirmationCard';
import { ConfirmedBookingDetailsCard } from './ConfirmedBookingDetailsCard';
import { Booking, Campsite } from '../types';

export const MyTripsPage: React.FC = () => {
  const { campsites, bookings, setView, selectCampsiteById } = useCampsites();
  const [openMapBookingId, setOpenMapBookingId] = useState<string | null>(null);
  
  // Active modal state for leaving a review
  const [selectedReviewTarget, setSelectedReviewTarget] = useState<{ booking: Booking; campsite: Campsite } | null>(null);

  const toggleMap = (id: string) => {
    setOpenMapBookingId(prev => prev === id ? null : id);
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
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 font-sans">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-emerald-600" />
            <span>Mano Užsakymai ir Kelionės</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Tvarkykite savo užsakytas stovyklavietes bei glamping vietas.</p>
        </div>

        <button
          onClick={() => setView('search')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all"
        >
          Ieškoti kitos vietos
        </button>
      </div>

      {/* Trips list */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-150 text-center space-y-4 shadow-xs font-sans">
          <Tent className="w-16 h-16 text-emerald-600/30 mx-auto" />
          <h3 className="font-bold text-2xl text-gray-900">Užsakytų kelionių dar nėra</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
            Raskite išskirtines privačias stovyklavietes, glamping namelius bei kemperių aikšteles visoje Lietuvoje.
          </p>
          <button
            onClick={() => setView('search')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
          >
            Ieškoti stovyklaviečių
          </button>
        </div>
      ) : (
        <div className="space-y-4 font-sans">
          {bookings.map(bk => {
            const camp = campsites.find(c => c.id === bk.campsiteId);
            const isMapOpen = openMapBookingId === bk.id;
            const lat = camp?.latitude || 55.1694;
            const lng = camp?.longitude || 23.8813;

            return (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={bk.campsiteImage}
                      alt={bk.campsiteTitle}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 cursor-pointer bg-gray-100"
                      onClick={() => selectCampsiteById(bk.campsiteId)}
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 
                          onClick={() => selectCampsiteById(bk.campsiteId)}
                          className="font-bold text-gray-900 text-lg hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          {bk.campsiteTitle}
                        </h3>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          bk.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          bk.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {bk.status === 'approved' ? '✓ Patvirtinta' : bk.status === 'rejected' ? 'Atmesta' : 'Laukia patvirtinimo'}
                        </span>
                      </div>

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
                        🔒 Stripe Escrow
                      </span>
                      <span className="text-xl font-black text-emerald-800 block mt-0.5">€{bk.totalPrice}</span>
                      {bk.platformFeeEur && (
                        <span className="text-[10px] text-gray-400 block">
                          (Platformos mokestis: €{bk.platformFeeEur})
                        </span>
                      )}
                    </div>

                    {/* Review Action for Paid/Approved Bookings */}
                    {(bk.status === 'approved' || bk.status === 'completed') && camp && (() => {
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

                    <button
                      onClick={() => selectCampsiteById(bk.campsiteId)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs border border-gray-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Peržiūrėti</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Confirmed Travel, Exact Location, Host Arrival Instructions & Navigation Card */}
                {(bk.status === 'approved' || bk.status === 'completed') && camp && (
                  <div className="pt-2">
                    <ConfirmedBookingDetailsCard booking={bk} campsite={camp} defaultExpanded={true} />
                  </div>
                )}

                {/* Visit Arrival Confirmation & Stripe Escrow 24h Payout Section */}
                {(bk.status === 'approved' || bk.status === 'completed') && (
                  <div className="pt-1">
                    <VisitArrivalConfirmationCard booking={bk} role="guest" />
                  </div>
                )}

                {/* Expandable Order Location Map */}
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

