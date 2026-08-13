import React, { useState } from 'react';
import { 
  Star, MapPin, Heart, Share2, ShieldCheck, CheckCircle2, AlertCircle, 
  User, Calendar, Users, Flame, Waves, Zap, Wifi, ShowerHead, Sparkles, 
  Tent, ShieldAlert, DollarSign, Info, ArrowLeft, MessageSquare, ChevronRight, X, Trees, AlertTriangle, MessageSquarePlus, Crown,
  Mail, Phone, Send, CheckCircle
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, Booking, Review } from '../types';
import { AmenityBadge } from './AmenityBadge';
import { DateRangePicker } from './DateRangePicker';
import { HostChatModal } from './HostChatModal';
import { OrderApproxMap } from './OrderApproxMap';
import { ReviewModal } from './ReviewModal';
import { DisputeReviewModal } from './DisputeReviewModal';
import { calculateFullPricing, getCampsiteCleaningFee } from '../utils/pricing';

export const CampsiteDetailPage: React.FC = () => {
  const { selectedCampsite, setView, isDateBlocked, favorites, toggleFavorite, bookings, userMode, addBooking, currentUser } = useCampsites();

  if (!selectedCampsite) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 bg-gray-50 font-sans">
        <p className="text-gray-500">Pasirinkta stovyklavietė nerasta.</p>
        <button onClick={() => setView('search')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer">
          Grįžti į paiešką
        </button>
      </div>
    );
  }

  const camp = selectedCampsite;
  const isFav = favorites.includes(camp.id);

  // Booking & Traveler Inquiry Form State (No registration required)
  const [checkIn, setCheckIn] = useState('2026-08-15');
  const [checkOut, setCheckOut] = useState('2026-08-17');
  const [guests, setGuests] = useState(2);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(
    camp.pitches && camp.pitches.length > 0 ? camp.pitches[0].id : null
  );
  const [travelerName, setTravelerName] = useState(currentUser?.name || '');
  const [travelerEmail, setTravelerEmail] = useState(currentUser?.email || '');
  const [travelerPhone, setTravelerPhone] = useState(currentUser?.phone || '');
  const [travelerMessage, setTravelerMessage] = useState('');
  const [inquirySubmittedBooking, setInquirySubmittedBooking] = useState<Booking | null>(null);
  const [inquiryFormError, setInquiryFormError] = useState<string | null>(null);

  // Auto-populate logged-in user details if available
  React.useEffect(() => {
    if (currentUser && !travelerEmail) {
      if (currentUser.name) setTravelerName(currentUser.name);
      if (currentUser.email) setTravelerEmail(currentUser.email);
      if (currentUser.phone) setTravelerPhone(currentUser.phone);
    }
  }, [currentUser]);

  const [showWidgetCalendar, setShowWidgetCalendar] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Pitch calculation
  const selectedPitch = camp.pitches?.find(p => p.id === selectedPitchId);
  const effectiveBasePrice = selectedPitch ? selectedPitch.basePrice : camp.pricePerNight;

  // Calculate Nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const cleaningFee = getCampsiteCleaningFee(camp);
  const pricing = calculateFullPricing(effectiveBasePrice, nights, cleaningFee, checkIn, checkOut, camp.customPrices, camp.seasonalRules);
  const totalPrice = pricing.totalGuestPrice;

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName.trim()) {
      setInquiryFormError('Prašome įvesti savo vardą ir pavardę.');
      return;
    }
    if (!travelerEmail.trim() || !travelerEmail.includes('@')) {
      setInquiryFormError('Prašome įvesti galiojantį el. pašto adresą.');
      return;
    }
    if (datesAreBlocked) {
      setInquiryFormError('Pasirinktos datos užimtos. Pasirinkite kitas kalendoriuje.');
      return;
    }

    setInquiryFormError(null);

    const isHostPro = camp.isPro || camp.host?.tier === 'pro' || camp.host?.tier === 'premium';
    
    const created = addBooking({
      campsiteId: camp.id,
      campsiteTitle: camp.title,
      campsiteImage: camp.images[0],
      location: camp.location,
      guestName: travelerName,
      guestEmail: travelerEmail,
      guestPhone: travelerPhone,
      guestNote: travelerMessage,
      checkIn,
      checkOut,
      guestsCount: guests,
      totalNights: nights,
      nightlyRate: effectiveBasePrice,
      cleaningFee,
      serviceFee: pricing.platformFeeEur,
      totalPrice: pricing.totalGuestPrice,
      propertyType: camp.propertyType,
      pitchId: selectedPitchId || undefined,
      pitchName: selectedPitch?.name || undefined,
      status: isHostPro ? 'pending' : 'free_inquiry'
    });

    setInquirySubmittedBooking(created);
  };

  // Review & Dispute Modals State
  const [reviewBookingTarget, setReviewBookingTarget] = useState<Booking | null>(null);
  const [disputeReviewTarget, setDisputeReviewTarget] = useState<Review | null>(null);

  // Find user's valid paid booking for this campsite if exists
  const userValidBooking = bookings.find(b => b.campsiteId === camp.id && (b.status === 'approved' || b.status === 'completed'));
  const userHasReviewed = userValidBooking ? camp.reviews.some(r => r.bookingId === userValidBooking.id) : false;

  // Check if selected date range has any blocked date
  const hasBlockedDateInRange = () => {
    if (!checkIn || !checkOut) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isDateBlocked(camp.id, dateStr)) {
        return true;
      }
    }
    return false;
  };

  const datesAreBlocked = hasBlockedDateInRange();

  return (
    <div id="campsite-detail-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 bg-gray-50">
      
      {/* Back button & Title Header */}
      <div className="space-y-3">
        <button
          onClick={() => setView('search')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Grįžti į stovyklaviečių paiešką</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {camp.title}
              </h1>
              {camp.isPro && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xs border border-amber-300 shrink-0">
                  <Crown className="w-3.5 h-3.5 text-amber-100" />
                  <span>PRO Rekomenduojama</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2 font-sans">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {camp.rating} ({camp.reviewCount} atsiliepimai)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {camp.location} ({camp.region})
              </span>
              <span>•</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                {camp.propertyType === 'tent' ? 'Palapinėms' : camp.propertyType === 'glamping' ? 'Glamping' : camp.propertyType === 'rv' ? 'Kemperiams' : camp.propertyType === 'cabin' ? 'Atostogų namelis' : 'Kita'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(camp.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'text-rose-600 fill-rose-600' : 'text-gray-600'}`} />
              <span>{isFav ? 'Išsaugota' : 'Išsaugoti'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. PHOTO GALLERY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[340px] sm:h-[450px] shadow-sm border border-gray-150 relative bg-gray-100">
        <div 
          className="md:col-span-2 h-full bg-gray-100 cursor-pointer overflow-hidden relative group"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={camp.images[0]}
            alt={camp.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
          {camp.images.slice(1, 5).map((imgUrl, i) => (
            <div
              key={i}
              className="bg-gray-100 cursor-pointer overflow-hidden relative group h-full"
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img
                src={imgUrl}
                alt={`${camp.title} ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-gray-900 font-bold text-xs shadow-md hover:bg-white border border-gray-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Visos nuotraukos ({camp.images.length})</span>
        </button>
      </div>

      {/* 2. MAIN DETAIL CONTENT & STICKY BOOKING WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Host Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-gray-150 shadow-xs gap-4">
            <div className="flex items-center gap-4">
              <img
                src={camp.host.avatar}
                alt={camp.host.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shrink-0"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Šeimininkas: {camp.host.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-sans flex-wrap">
                  {camp.host.isSuperhost && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                      ★ Super-šeimininkas
                    </span>
                  )}
                  <span>Narys nuo {camp.host.joinedDate}</span>
                  <span>•</span>
                  <span>Atsako greitai</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/90 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Parašyti šeimininkui</span>
            </button>
          </div>

          {/* Property Overview Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-gray-150">
              <Tent className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tipas</span>
              <span className="text-xs font-bold text-gray-900 capitalize">{camp.propertyType}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-150">
              <Users className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Svečiai</span>
              <span className="text-xs font-bold text-gray-900">Iki {camp.maxGuests} asm.</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-150">
              <Trees className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Paviršius</span>
              <span className="text-xs font-bold text-gray-900">{camp.terrainType}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-150">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Atšaukimas</span>
              <span className="text-xs font-bold text-gray-900 capitalize">{camp.cancellationPolicy}</span>
            </div>
          </div>

          {/* About Spot Description & Approximate Location */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-2xl text-gray-900">Apie šią stovyklavietę</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-sans">
              {camp.description}
            </p>

            {/* Approximate Location Map in Description */}
            <div className="space-y-2 pt-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stovyklavietės vieta ir privatumas</span>
                </h4>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-800 block">
                    {camp.location} ({camp.region})
                  </span>
                  {(camp.addressLine || camp.postalCode) && (
                    <span className="text-[11px] font-semibold text-emerald-800 block">
                      📍 {camp.addressLine ? camp.addressLine : ''}{camp.addressLine && camp.postalCode ? ', ' : ''}{camp.postalCode ? camp.postalCode : ''}
                    </span>
                  )}
                </div>
              </div>

              <OrderApproxMap
                latitude={camp.latitude}
                longitude={camp.longitude}
                locationName={camp.addressLine ? `${camp.addressLine}, ${camp.location}` : camp.location}
                campsiteTitle={camp.title}
                height="240px"
              />
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 pt-4 border-t border-gray-200 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-2xl text-gray-900">Patogumai vietoje</h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {camp.amenities.length} patogumai
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {camp.amenities.map((amenity, i) => (
                <AmenityBadge key={i} amenity={amenity} size="md" />
              ))}
            </div>
          </div>

          {/* CANCELLATION POLICY BLOCK */}
          <div className="p-6 rounded-2xl bg-white border border-gray-150 space-y-3 font-sans">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-lg">Atšaukimo taisyklės</h3>
              <span className="ml-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200">
                {camp.cancellationPolicy}
              </span>
            </div>

            <p className="text-gray-600 text-xs leading-relaxed">
              Nemokamas atšaukimas likus daugiau nei 24 valandoms iki atvykimo pradžios.
            </p>
          </div>

          {/* House / Camp Rules */}
          <div className="space-y-3 pt-2 font-sans">
            <h3 className="font-bold text-xl text-gray-900">Taisyklės ir saugumas</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              {camp.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Availability / Reserved Dates Calendar Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200 font-sans">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  <span>Užimtumas ir datų pasirinkimas</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pasirinkite atvykimo ir išvykimo datas. Užimtos ir rezervuotos dienos yra pažymėtos raudonai ir perbrauktos.
                </p>
              </div>
            </div>

            <DateRangePicker
              campsiteId={camp.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDates={(inIso, outIso) => {
                setCheckIn(inIso);
                setCheckOut(outIso);
              }}
              isDateBlocked={isDateBlocked}
            />
          </div>

          {/* Guest Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-gray-200 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
                  <span>Svečių atsiliepimai</span>
                  <span className="flex items-center text-amber-500 font-bold text-base bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-500 mr-1" />
                    {camp.rating} ({camp.reviews.length})
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  100% tikri ir verifikuoti po Stripe apmokėjimo atlikti vertinimai.
                </p>
              </div>

              {/* Review button if valid booking exists */}
              {userValidBooking && !userHasReviewed && (
                <button
                  onClick={() => setReviewBookingTarget(userValidBooking)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Rašyti atsiliepimą</span>
                </button>
              )}
            </div>

            {/* Verified Booking Notice Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1 text-emerald-950">
              <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Tik patvirtintų rezervacijų atsiliepimai:</span>
              </div>
              <p className="text-emerald-900 font-medium leading-relaxed">
                Atsiliepimą ar reitingą gali palikti tik tas vartotojas, kuris realiai atliko užsakymą per platformą ir sumokėjo per „Stripe“. <strong>Jokių nepatikrintų atsiliepimų „iš gatvės“.</strong>
              </p>
            </div>

            {/* Reviews Grid */}
            {camp.reviews.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-150 space-y-2">
                <Star className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-700 text-sm">Atsiliepimų dar nėra</p>
                <p className="text-gray-500 text-xs">Būkite pirmasis verifikuotas svečias, palikęs atsiliepimą po viešnagės!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {camp.reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-gray-150 space-y-3 font-sans shadow-2xs relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img src={rev.authorAvatar} alt={rev.authorName} className="w-9 h-9 rounded-full object-cover border border-emerald-200" />
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 block">{rev.authorName}</span>
                            <span className="text-[10px] text-gray-400 block">{rev.date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-amber-500 block">★ {rev.rating}.0</span>
                          {rev.verifiedStay && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Stripe verifikuotas</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed italic pt-1">"{rev.comment}"</p>
                    </div>

                    {/* Dispute & Moderation Status / Action */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      {rev.disputeStatus === 'pending_admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Apskūsta šeimininko (Atsiliepimas tikrinamas)</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Verifikuota atsiliepimo būsena</span>
                      )}

                      {/* Host action to dispute review */}
                      <button
                        onClick={() => setDisputeReviewTarget(rev)}
                        className="text-[10px] font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                        title="Apskųsti atsiliepimą administracijai dėl taisyklių pažeidimo"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Apskųsti atsiliepimą</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Render Modals */}
          {reviewBookingTarget && (
            <ReviewModal
              isOpen={!!reviewBookingTarget}
              onClose={() => setReviewBookingTarget(null)}
              booking={reviewBookingTarget}
              campsite={camp}
            />
          )}

          {disputeReviewTarget && (
            <DisputeReviewModal
              isOpen={!!disputeReviewTarget}
              onClose={() => setDisputeReviewTarget(null)}
              campsiteId={camp.id}
              review={disputeReviewTarget}
            />
          )}

        </div>

        {/* RIGHT COLUMN: STICKY BOOKING / INQUIRY WIDGET (4 cols) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-md space-y-5 font-sans">
            
            {/* Price Header & Plan Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-3xl font-black text-emerald-800">€{camp.pricePerNight}</span>
                <span className="text-xs text-gray-500 font-semibold"> / parai</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{camp.rating}</span>
                  <span className="text-gray-400">({camp.reviewCount})</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                  camp.isPro || camp.host?.tier === 'pro' || camp.host?.tier === 'premium'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {camp.isPro || camp.host?.tier === 'pro' || camp.host?.tier === 'premium' ? '⚡ PRO Rezervacija' : '✉️ FREE Užklausa'}
                </span>
              </div>
            </div>

            {!inquirySubmittedBooking ? (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                
                {/* Interactive Date Range Picker */}
                <div className="space-y-3 font-sans">
                  <div 
                    onClick={() => setShowWidgetCalendar(prev => !prev)}
                    className="p-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all cursor-pointer space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        <span>Pasirinkite datas</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-800 underline">
                        {showWidgetCalendar ? 'Sutraukti' : 'Rodyti kalendorių'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-800 pt-1.5 border-t border-emerald-200/70">
                      <div>
                        <span className="block text-[9px] font-bold text-gray-400 uppercase">Atvykimas</span>
                        <span className="text-emerald-950 font-extrabold">{checkIn || 'Nepasirinkta'}</span>
                      </div>
                      <div className="border-l border-emerald-200 pl-2">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase">Išvykimas</span>
                        <span className="text-emerald-950 font-extrabold">{checkOut || 'Nepasirinkta'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Interactive Month Calendar with Disabled Reserved Dates */}
                  {showWidgetCalendar && (
                    <div className="animate-in fade-in duration-200">
                      <DateRangePicker
                        campsiteId={camp.id}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onSelectDates={(inIso, outIso) => {
                          setCheckIn(inIso);
                          setCheckOut(outIso);
                        }}
                        isDateBlocked={isDateBlocked}
                      />
                    </div>
                  )}

                  {/* Blocked Date Warning */}
                  {datesAreBlocked && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Pasirinktomis dienomis vieta užimta! Pasirinkite kitas datas kalendoriuje.</span>
                    </div>
                  )}

                  {/* Guests Selector */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-gray-400">Svečiai</span>
                      <span className="text-xs font-bold text-gray-800">{guests} asm.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-7 h-7 rounded-lg bg-gray-200 text-gray-800 font-bold flex items-center justify-center hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(camp.maxGuests, guests + 1))}
                        className="w-7 h-7 rounded-lg bg-gray-200 text-gray-800 font-bold flex items-center justify-center hover:bg-gray-300 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pitch Selection (Pro Plan Pitch-Level Inventory) */}
                  {camp.pitches && camp.pitches.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2 font-sans">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1">
                          <Tent className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Pasirinkite Aikštelę / Vietą</span>
                        </label>
                        <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {camp.pitches.length} pasirinkimai
                        </span>
                      </div>

                      <select
                        value={selectedPitchId || ''}
                        onChange={(e) => setSelectedPitchId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        {camp.pitches.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.type === 'tent' ? 'Palapinė' : p.type === 'camper' ? 'Kemperis' : p.type === 'glamping' ? 'Glampingas' : 'Namelis'}) — €{p.basePrice}/parai
                          </option>
                        ))}
                      </select>

                      {selectedPitch && (
                        <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-xs text-gray-800 space-y-1">
                          <div className="flex justify-between items-center font-extrabold text-emerald-900 text-xs">
                            <span>{selectedPitch.name}</span>
                            <span className="text-emerald-800">€{selectedPitch.basePrice} / parai</span>
                          </div>
                          {selectedPitch.description && (
                            <p className="text-[10px] text-gray-600 leading-tight">{selectedPitch.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-gray-700 font-semibold pt-0.5">
                            <span>👥 Max {selectedPitch.maxGuests} sveč.</span>
                            {selectedPitch.hasElectricity && (
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">⚡ Elektra</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Seasonal Price Rule Banner */}
                  {pricing.activeSeasonalRule && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Sezoninė Kaina ({pricing.activeSeasonalRule.name}): paros kaina pakoreguota pagal pasirinktas datas!
                      </span>
                    </div>
                  )}
                </div>

                {/* Traveler Form Fields (No Registration Required) */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-black uppercase text-stone-600 tracking-wider">
                      Poilsiautojo Kontaktai (Registracija nebūtina)
                    </span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Neregistruotiems leidžiama
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      SVARBU: Užsakymo patvirtinimas bus išsiųstas tiesiai į žemiau nurodytą el. pašto adresą.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-0.5">
                      Vardas ir Pavardė *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Pvt. Jonas Jonaitis"
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-0.5">
                      El. pašto adresas * (Šiuo adresu atsiųsime patvirtinimą)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jonas@pavyzdys.lt"
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-xl bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-0.5">
                      Telefono numeris
                    </label>
                    <input
                      type="tel"
                      placeholder="+370 600 00000"
                      value={travelerPhone}
                      onChange={(e) => setTravelerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-0.5">
                      Žinutė šeimininkui (nebūtina)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Pvt. Atvykstame apie 16 val., keliaujame su šunimi..."
                      value={travelerMessage}
                      onChange={(e) => setTravelerMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>€{camp.pricePerNight} × {nights} nakt.</span>
                    <span className="font-semibold text-gray-900">€{pricing.nightsSubtotal}</span>
                  </div>
                  {cleaningFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Valymo mokestis</span>
                      <span className="font-semibold text-gray-900">€{cleaningFee}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold text-gray-900">
                    <span>Numatoma suma:</span>
                    <span className="font-black text-xl text-emerald-800">€{pricing.totalGuestPrice}</span>
                  </div>
                </div>

                {inquiryFormError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
                    {inquiryFormError}
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  id="send-inquiry-button"
                  disabled={datesAreBlocked}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    datesAreBlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-800/20'
                  }`}
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>Siųsti užklausą šeimininkui</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Rašyti žinutę šeimininkui</span>
                </button>

              </form>
            ) : (
              /* Success / Inquiry Confirmation Response Card */
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-7 h-7 text-emerald-700" />
                </div>

                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                    ✓ Užklausa Sėkmingai Išsiųsta
                  </span>
                  <h3 className="text-lg font-black text-gray-900">Ačiū, {inquirySubmittedBooking.guestName}!</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Jūsų užklausa stovyklavietei <strong>"{camp.title}"</strong> ({checkIn} — {checkOut}) išsiųsta šeimininkui <strong>{camp.host.name}</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2 font-sans shadow-2xs">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Patvirtinimo el. laiškas išsiųstas jūsų nurodytu adresu: <strong className="underline text-emerald-900">{inquirySubmittedBooking.guestEmail}</strong>
                  </span>
                </div>

                {/* FREE PLAN DIRECT CONTACT BRIDGE */}
                {inquirySubmittedBooking.status === 'free_inquiry' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-black text-xs">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      <span>Tiesioginiai Šeimininko Kontaktai (Free Planas):</span>
                    </div>
                    <p className="text-emerald-900 text-[11px] leading-relaxed">
                      Šeimininkas naudojasi nemokamu „Free“ planu. Galite susisiekti su juo tiesiogiai telefonu ar el. paštu dėl galutinio patvirtinimo ir atsiskaitymo offline:
                    </p>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 font-sans">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>Telefonas:</span>
                        <a href={`tel:${camp.host.phone || '+370 600 12345'}`} className="text-emerald-800 hover:underline">
                          {camp.host.phone || '+370 600 12345'}
                        </a>
                      </div>
                      <div className="flex items-center justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5">
                        <span>El. paštas:</span>
                        <a href={`mailto:${camp.host.email || 'seimininkas@campy.lt'}`} className="text-emerald-800 hover:underline truncate max-w-[180px]">
                          {camp.host.email || 'seimininkas@campy.lt'}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PRO PLAN TEMPORARY DATE LOCK RESPONSE */
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Laikinai Užrakintos Datos (PRO Planas):</span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      Jūsų pasirinktos datos ({checkIn} — {checkOut}) yra <strong>laikinai rezervuotos kalendoriuje</strong>, kad kiti poilsiautojai jų neužimtų. Šeimininkas peržiūrės užklausą savo valdymo skyde ir pateiks patvirtinimą arba atmetimą.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setInquirySubmittedBooking(null)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Siųsti kitą užklausą / keisti datas
                </button>

              </div>
            )}

            <p className="text-[10px] text-gray-400 text-center font-sans">
              Campy.lt užklausų sistema • Jokių paslėptų mokesčių
            </p>

          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={camp.images[lightboxIndex]}
            alt={`${camp.title} photo`}
            className="max-w-4xl max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Host Direct Inquiry Chat Modal */}
      <HostChatModal
        campsite={camp}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
      />

    </div>
  );
};

