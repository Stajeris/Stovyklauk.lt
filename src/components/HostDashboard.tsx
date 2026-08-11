import React, { useState } from 'react';
import { 
  DollarSign, Calendar, Star, Users, CheckCircle, XCircle, Sparkles, 
  PlusCircle, ShieldCheck, TrendingUp, CreditCard, Tent, MapPin, AlertCircle, Clock, Edit, Camera, Eye, ShieldAlert, AlertTriangle, MessageSquare, Send, Crown, Zap, Check, BarChart3, Heart, MousePointer, X, LogOut
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, Review } from '../types';
import { EditCampsiteModal } from './EditCampsiteModal';
import { DisputeReviewModal } from './DisputeReviewModal';
import { HostCalendarManager } from './HostCalendarManager';
import { HostVerificationSection } from './HostVerificationSection';
import { VisitArrivalConfirmationCard } from './VisitArrivalConfirmationCard';
import { HostPhotoUploader } from './HostPhotoUploader';
import { ProtectedChatMessage, maskContactInfoText } from '../utils/privacyFilter';

export const HostDashboard: React.FC = () => {
  const { 
    bookings, 
    campsites, 
    currentUser,
    logoutUser,
    openAuthModal,
    chatThreads,
    replyToThread,
    updateBookingStatus, 
    releaseEscrowPayout,
    setView, 
    promoDaysRemaining,
    selectCampsiteById,
    hostTier,
    setHostTier,
    updateUserProfile
  } = useCampsites();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'calendar' | 'payouts' | 'reviews' | 'chats' | 'membership'>('overview');
  const [selectedCalendarCampsiteId, setSelectedCalendarCampsiteId] = useState<string | undefined>(undefined);
  const [editingCampsite, setEditingCampsite] = useState<Campsite | null>(null);
  const [disputingReview, setDisputingReview] = useState<{ campsiteId: string; review: Review } | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [hostReplyText, setHostReplyText] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(currentUser?.avatar || '');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 font-sans">
        <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
          🏡
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Šeimininko paskyra atsijungusi</h2>
        <p className="text-gray-600 text-xs leading-relaxed">
          Esate atsijungę iš paskyros. Norėdami valdyti savo skelbimus, stebėti užsakymus bei priimti svečių užklausas, prisijunkite prie šeimininko paskyros.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
        >
          🔑 Prisijungti kaip Šeimininkas
        </button>
      </div>
    );
  }

  // Filter campsites and bookings for current logged-in host if not admin
  const userCampsites = currentUser.isAdmin
    ? campsites
    : campsites.filter(
        c => c.host?.id === currentUser.id || 
             c.host?.name?.toLowerCase() === currentUser.name?.toLowerCase() ||
             (c.host as any)?.email === currentUser.email
      );

  const userCampsiteIds = new Set(userCampsites.map(c => c.id));

  const userBookings = currentUser.isAdmin
    ? bookings
    : bookings.filter(b => userCampsiteIds.has(b.campsiteId));

  // Calculate total PRO monthly cost based on 1 night price for each listing
  const totalProMonthlyCost = userCampsites.reduce((sum, c) => sum + (c.pricePerNight || 0), 0);

  // Calculate metrics
  const approvedBookings = userBookings.filter(b => b.status === 'approved');
  const pendingBookings = userBookings.filter(b => b.status === 'pending');
  const totalEarnings = approvedBookings.reduce((sum, b) => sum + (b.hostPayoutAmount || b.bookingSubtotal || b.totalPrice), 0);

  return (
    <div id="host-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50">
      
      {/* Header & Title with Host Profile Avatar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 font-sans">
        <div className="flex items-center gap-4">
          
          {/* Host Avatar Badge with Edit Trigger */}
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-white flex items-center justify-center">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-emerald-800">
                  {currentUser.name?.charAt(0) || 'Š'}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setTempAvatar(currentUser.avatar || '');
                setShowAvatarModal(true);
              }}
              className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="Įkelti ar keisti šeimininko nuotrauką"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {currentUser.name || 'Šeimininko Valdymo Skydas'}
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Patvirtintas Šeimininkas
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-1">Valdykite stovyklaviečių skelbimus, tvirtinkite svečių užsakymus ir sekite pajamas.</p>
            
            <button
              onClick={() => {
                setTempAvatar(currentUser.avatar || '');
                setShowAvatarModal(true);
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>Įkelti / keisti profilio nuotrauką →</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={() => setView('add-listing')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Pridėti naują sklypą</span>
          </button>

          <button
            onClick={() => logoutUser()}
            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            title="Atsijungti iš Šeimininko paskyros"
          >
            <LogOut className="w-4 h-4 text-rose-700" />
            <span className="hidden sm:inline">Atsijungti</span>
          </button>
        </div>
      </div>

      {/* 1. HIGHLY VISIBLE 0% COMMISSION PROMOTION ALERT BANNER */}
      <div className="relative rounded-2xl bg-emerald-900 p-6 text-white shadow-md overflow-hidden border border-emerald-800 font-sans">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aktyvus Pradžios Pasiūlymas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Liko {promoDaysRemaining} d. 0% Šeimininko Mokesčio Pasiūlymo
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
              Iš jūsų nakvynės kainos neimame jokio mokesčio 6 mėnesių pristatymo laikotarpiu. 100% svečių įmokų keliauja tiesiai į jūsų banko sąskaitą.
            </p>
          </div>

          <div className="px-4 py-2 bg-amber-400 text-emerald-950 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0">
            0% Mokestis Aktyvus
          </div>
        </div>
      </div>

      {/* 2. TOP METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        
        <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Mėnesio Pajamos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">€{totalEarnings}</div>
          <span className="inline-block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
            ↑ 100% Išmokėjimas (0% mokestis)
          </span>
        </div>

        <div 
          onClick={() => setView('pending-requests')}
          className="p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-2 cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Ateinantys Užsakymai</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {approvedBookings.length + pendingBookings.length + 5}
          </div>
          <span className="inline-block text-[10px] text-amber-600 font-bold hover:underline">
            {pendingBookings.length} laukia patvirtinimo (Atidaryti užklausas →)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Vidutinis Įvertinimas</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">4.95 ★</div>
          <span className="inline-block text-[10px] text-amber-700 font-bold uppercase tracking-wider">
            Super-šeimininko Statusas
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Skelbimo Peržiūros</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">1,280</div>
          <span className="inline-block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
            ↑ +18% šią savaitę
          </span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-gray-800'
          }`}
        >
          Apžvalga ir Užklausos ({pendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'listings' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-gray-800'
          }`}
        >
          Mano Stovyklavietės ({userCampsites.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'calendar' ? 'border-emerald-600 text-emerald-800 font-extrabold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kalendorius ir iCal Sync</span>
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payouts' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-gray-800'
          }`}
        >
          Išmokėjimų Nustatymai
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reviews' ? 'border-amber-600 text-amber-900 font-extrabold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Atsiliepimai ir Moderavimas ({userCampsites.reduce((sum, c) => sum + (c.reviews?.length || 0), 0)})</span>
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'chats' ? 'border-emerald-600 text-emerald-800 font-extrabold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Poilsiautojų Žinutės ({chatThreads.filter(t => userCampsites.some(c => c.id === t.campsiteId)).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('membership')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'membership' ? 'border-amber-600 text-amber-900 font-black' : 'border-transparent hover:text-gray-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Narystė & PRO Paketas</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
            hostTier === 'pro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {hostTier === 'pro' ? 'PRO Aktyvus' : 'Bazinė'}
          </span>
        </button>
      </div>

      {/* 3. RECENT BOOKING REQUESTS WITH APPROVE & REJECT BUTTONS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Host Verification Section */}
          <HostVerificationSection />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-2xl text-gray-900">Laukiančios Užsakymo Užklausos</h3>
              <p className="text-xs font-sans text-gray-500 font-medium">Patvirtinkite arba atmeskite svečių užklausas bei tikrinkite apsilankymų patvirtinimus</p>
            </div>
            <button
              onClick={() => setView('pending-requests')}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Platesnis Užklausų Puslapis →</span>
            </button>
          </div>

          {userBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-150 text-center text-gray-500 text-xs font-sans">
              Šiuo metu laukiančių užklausų nėra.
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map(bk => (
                <div 
                  key={bk.id}
                  className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={bk.campsiteImage}
                      alt={bk.campsiteTitle}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{bk.campsiteTitle}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          bk.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          bk.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {bk.status === 'approved' ? 'Patvirtinta' : bk.status === 'rejected' ? 'Atmesta' : 'Laukia'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600">
                        Svečias: <strong className="text-gray-900">{bk.guestName}</strong> ({bk.guestEmail})
                      </p>

                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{bk.checkIn} iki {bk.checkOut} ({bk.totalNights} nakt.)</span>
                        <span>•</span>
                        <span>{bk.guestsCount} asm.</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Price & Approve/Reject Actions */}
                  <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400">Gausite</span>
                        <span className="text-xl font-black text-emerald-800">€{bk.totalPrice}</span>
                      </div>

                      {bk.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            id={`approve-btn-${bk.id}`}
                            onClick={() => updateBookingStatus(bk.id, 'approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Patvirtinti</span>
                          </button>
                          <button
                            id={`reject-btn-${bk.id}`}
                            onClick={() => updateBookingStatus(bk.id, 'rejected')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Atmesti</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Visit Confirmation and 24h Escrow Countdown Card for Approved Bookings */}
                    {bk.status === 'approved' && (
                      <div className="w-full md:w-80">
                        <VisitArrivalConfirmationCard booking={bk} role="host" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY CAMPSITES TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-2xl text-gray-900">Mano Stovyklavietės ir Objektai</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  hostTier === 'pro' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {hostTier === 'pro' ? 'PRO (Keli sklypai)' : `Bazinė (${userCampsites.length}/1 sklypas)`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Valdykite savo objektų informaciją, kainas ir atnaujinkite galerijos nuotraukas.</p>
            </div>

            <button
              id="add-new-listing-btn"
              onClick={() => setView('add-listing')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pridėti naują stovyklavietę</span>
              {hostTier === 'free' && userCampsites.length >= 1 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[9px] uppercase">
                  PRO reikalingas 2+
                </span>
              )}
            </button>
          </div>

          {/* Free Tier Limit Warning Banner in Listings Tab */}
          {hostTier === 'free' && userCampsites.length >= 1 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Nemokama (Bazinė) versija: Pasiektas 1 sklypo limitas</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Bazinėje versijoje galite valdyti tik <strong>1 skelbimą</strong>. Norėdami registruoti ir valdyti <strong>daugiau nei 1 sklypą (kelis objektus)</strong>, aktyvuokite <strong>PRO paketą</strong>.
                  Mėnesinis PRO mokestis skaičiuojamas pagal kiekvieno sklypo 1 nakvynės kainą per mėnesį.
                </p>
              </div>

              <button
                onClick={() => setHostTier('pro')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Atnaujinti į PRO paketą</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userCampsites.map(site => (
              <div key={site.id} className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 group">
                    <img src={site.images[0]} alt={site.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform" />
                    
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3 text-amber-300" />
                      <span>{site.images.length} nuotraukos</span>
                    </div>

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider">
                        {site.propertyType === 'tent' ? '⛺ Palapinėms' : site.propertyType === 'glamping' ? '✨ Glamping' : site.propertyType === 'rv' ? '🚐 Kemperiams' : site.propertyType === 'cabin' ? '🏡 Atostogų namelis' : '🌲 Kita'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-xs ${
                        (!site.status || site.status === 'approved')
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : site.status === 'pending'
                          ? 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-950 border-rose-300'
                      }`}>
                        {(!site.status || site.status === 'approved') ? '✓ Patvirtinta' : site.status === 'pending' ? '⏳ Laukia peržiūros' : '❌ Atmesta'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-gray-900 text-base leading-snug">{site.title}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{site.location} ({site.region})</span>
                    </p>
                    {(site.addressLine || site.postalCode) && (
                      <p className="text-[11px] text-emerald-800 font-semibold mt-0.5 pl-4.5 truncate">
                        {site.addressLine ? site.addressLine : ''}{site.addressLine && site.postalCode ? ', ' : ''}{site.postalCode ? site.postalCode : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-emerald-900 text-base">€{site.pricePerNight} <span className="text-xs font-normal text-gray-500">/ naktį</span></span>
                    <span className="text-amber-500 font-bold">★ {site.rating} ({site.reviewCount})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id={`edit-campsite-btn-${site.id}`}
                      onClick={() => setEditingCampsite(site)}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Redaguoti</span>
                    </button>

                    <button
                      onClick={() => setView('detail', site.id)}
                      className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>Peržiūrėti</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCalendarCampsiteId(site.id);
                      setActiveTab('calendar');
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Valdyti Kalendorių ir iCal Sync</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR & iCAL MANAGER TAB */}
      {activeTab === 'calendar' && (
        <HostCalendarManager 
          campsites={userCampsites} 
          selectedCampsiteId={selectedCalendarCampsiteId} 
        />
      )}

      {/* EDIT CAMPSITE MODAL DIALOG */}
      {editingCampsite && (
        <EditCampsiteModal
          campsite={editingCampsite}
          onClose={() => setEditingCampsite(null)}
        />
      )}

      {/* STRIPE CONNECT PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="space-y-6 font-sans">
          
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900">Stripe Escrow Išmokėjimo & Mokesčių Valdymas</h3>
                  <p className="text-xs text-gray-500 font-medium">Svečių įmokos saugiai užlaikomos „Stripe Escrow“ depozite iki atvykimo dienos.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Stripe Verified Connect</span>
              </span>
            </div>

            {/* Escrow Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider text-[10px] block">
                  🔒 Laikoma Escrow (Laukia viešnagės)
                </span>
                <span className="text-2xl font-black text-amber-950">
                  €{userBookings
                    .filter(b => b.escrowStatus === 'held_in_escrow' || !b.escrowStatus)
                    .reduce((sum, b) => sum + (b.hostPayoutAmount || b.bookingSubtotal || b.totalPrice), 0)
                    .toFixed(2)}
                </span>
                <p className="text-amber-800 text-[11px]">Pinigai bus atiduoti svečiui atvykus</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="font-extrabold text-emerald-900 uppercase tracking-wider text-[10px] block">
                  🏦 Išmokėta į Banko Sąskaitą
                </span>
                <span className="text-2xl font-black text-emerald-950">
                  €{userBookings
                    .filter(b => b.escrowStatus === 'payout_released_to_host')
                    .reduce((sum, b) => sum + (b.hostPayoutAmount || b.bookingSubtotal || b.totalPrice), 0)
                    .toFixed(2)}
                </span>
                <p className="text-emerald-800 text-[11px]">Sąskaita: IBAN LT79 **** **** 4821</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] block">
                  📊 Taikoma Platformos Mokesčių Pakopa
                </span>
                <span className="text-2xl font-black text-gray-900">5% – 10%</span>
                <p className="text-gray-500 text-[11px]">Mokestis moka svečias (Min. 5.00 EUR Stripe apsauga)</p>
              </div>
            </div>

            {/* Escrow Bookings Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-base text-gray-900">Užsakymų Išmokėjimų ir Escrow Būsenos Suvestinė</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase text-[10px] bg-gray-50">
                      <th className="py-2.5 px-3">Užsakymas</th>
                      <th className="py-2.5 px-3">Svečias & Datos</th>
                      <th className="py-2.5 px-3">Suma (Subtotal)</th>
                      <th className="py-2.5 px-3">Platformos Mokestis</th>
                      <th className="py-2.5 px-3">Jūsų Išmoka</th>
                      <th className="py-2.5 px-3">Escrow Būsena</th>
                      <th className="py-2.5 px-3 text-right">Veiksmas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {userBookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-900 block">{b.campsiteTitle}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {b.id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-gray-800 block">{b.guestName}</span>
                          <span className="text-[10px] text-gray-500">{b.checkIn} iki {b.checkOut}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">
                          €{(b.bookingSubtotal || b.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-emerald-800 font-semibold">
                          €{(b.platformFeeEur || b.serviceFee || 5).toFixed(2)} ({b.feePercentage || 10}%)
                        </td>
                        <td className="py-3 px-3 font-extrabold text-emerald-900 text-sm">
                          €{(b.hostPayoutAmount || b.bookingSubtotal || b.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          {b.escrowStatus === 'payout_released_to_host' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Išmokėta į banką
                            </span>
                          ) : b.escrowStatus === 'refunded_to_guest' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              ↩ Grąžinta svečiui
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                              🔒 Escrow Užlaikymas
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {b.escrowStatus !== 'payout_released_to_host' && b.status === 'approved' && (
                            <button
                              onClick={() => {
                                releaseEscrowPayout(b.id);
                                alert(`Sėkmingai atšaldytos lėšos €${b.hostPayoutAmount || b.bookingSubtotal}! Pervedimas į jūsų banką inicijuotas.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] shadow-xs cursor-pointer"
                            >
                              Atšaldyti & Pervesti Išmoką
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* HOST REVIEWS & DISPUTES TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 font-sans">
          
          <div className="bg-amber-900 text-white p-6 rounded-2xl shadow-md border border-amber-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-300 text-amber-950">
                Šeimininko Moderavimo Taisyklės
              </span>
            </div>
            <h3 className="text-xl font-extrabold">Atsiliepimų Valdymas ir Apskundimo Langas</h3>
            <p className="text-amber-100 text-xs leading-relaxed max-w-2xl">
              Čia matote visus verifikuotų svečių atsiliepimus. Jei atsiliepimas pažeidžia taisykles (keiksmažodžiai, neapykantos kalba arba įrodytas svečio neatvykimas), galite jį apskųsti administratoriams. 
              <strong> Pastaba: Blogo ar neigiamo vertinimo negalima pašalinti vien dėl to, kad jis jums nepatinka.</strong>
            </p>
          </div>

          <div className="space-y-6">
            {userCampsites.map(camp => (
              <div key={camp.id} className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h4 
                      onClick={() => selectCampsiteById(camp.id)}
                      className="font-extrabold text-base text-gray-900 hover:text-emerald-700 cursor-pointer transition"
                    >
                      {camp.title} ({camp.location})
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">Vidutinis įvertinimas: ★ {camp.rating} ({camp.reviews?.length || 0} atsiliepimai)</p>
                  </div>

                  <button
                    onClick={() => selectCampsiteById(camp.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs cursor-pointer transition"
                  >
                    Atidaryti skelbimą →
                  </button>
                </div>

                {(!camp.reviews || camp.reviews.length === 0) ? (
                  <p className="text-xs text-gray-400 italic py-2">Ši stovyklavietė dar neturi svečių atsiliepimų.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camp.reviews.map(rev => (
                      <div key={rev.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 font-sans text-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-900">{rev.authorName}</span>
                            <span className="font-black text-amber-500">★ {rev.rating}.0</span>
                          </div>
                          <p className="text-gray-700 italic bg-white p-2.5 rounded-lg border border-gray-150">
                            "{rev.comment}"
                          </p>
                          <span className="text-[10px] text-gray-400 block">{rev.date} • Stripe Verifikuotas</span>
                        </div>

                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                          {rev.disputeStatus === 'pending_admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Apskūsta administracijai</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Aktyvus vertinimas</span>
                          )}

                          <button
                            onClick={() => setDisputingReview({ campsiteId: camp.id, review: rev })}
                            className="text-[10px] font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Apskųsti administratoriui</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 7. CHATS TAB FOR HOST */}
      {activeTab === 'chats' && (
        <div className="space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-2xl text-gray-900">Poilsiautojų Žinutės ir Užklausos</h3>
              <p className="text-xs text-gray-500">Bendraukite su svečiais, atsakinėkite į klausimus apie stovyklavietes.</p>
            </div>
          </div>

          {(() => {
            const myCampsiteIds = new Set(userCampsites.map(c => c.id));
            const myThreads = chatThreads.filter(t => myCampsiteIds.has(t.campsiteId));

            if (myThreads.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Kol kas žinučių nėra</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Kai poilsiautojai paspaus „Susisiekti su šeimininku“ Jūsų stovyklaviečių skelbimuose, jų žinutės bus rodomos čia realiu laiku.
                  </p>
                </div>
              );
            }

            const activeThread = myThreads.find(t => t.id === selectedThreadId) || myThreads[0];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Threads list */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-4 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider px-1">
                    Klientų pokalbiai ({myThreads.length})
                  </h4>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {myThreads.map(thread => {
                      const isSelected = thread.id === activeThread.id;

                      return (
                        <div
                          key={thread.id}
                          onClick={() => setSelectedThreadId(thread.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={thread.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                alt={thread.clientName}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-200"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-extrabold text-gray-900 truncate">{thread.clientName}</h5>
                                <p className="text-[10px] text-gray-500 truncate">{thread.campsiteTitle}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{thread.lastMessageTimestamp}</span>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-1 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                            {maskContactInfoText(thread.lastMessage).maskedText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message detail window */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeThread.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={activeThread.clientName}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">{activeThread.clientName}</h4>
                        <p className="text-xs text-gray-500">Skelbimas: <strong>{activeThread.campsiteTitle}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-3 max-h-[360px] overflow-y-auto">
                    {activeThread.messages.map(msg => {
                      const isHost = msg.role === 'host';
                      const isAdmin = msg.role === 'admin';

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 max-w-[85%] ${isHost ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          {!isHost && (
                            <img
                              src={msg.senderAvatar || activeThread.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={msg.senderName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-gray-200"
                            />
                          )}

                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-gray-500">{msg.senderName}</span>
                              {isAdmin && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[9px]">
                                  👑 Admin
                                </span>
                              )}
                            </div>

                            <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isHost
                                ? 'bg-emerald-700 text-white rounded-tr-xs font-medium'
                                : isAdmin
                                ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-xs font-medium'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs font-medium'
                            }`}>
                              <ProtectedChatMessage text={msg.text} role={msg.role} />
                            </div>

                            <span className={`block text-[9px] text-gray-400 mt-0.5 ${isHost ? 'text-right' : 'text-left'}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!hostReplyText.trim()) return;

                      const hostSender = {
                        id: currentUser.id || 'host-user',
                        name: currentUser.name || 'Šeimininkas',
                        avatar: currentUser.avatar,
                        role: 'host' as const
                      };

                      replyToThread(activeThread.id, hostSender, hostReplyText.trim());
                      setHostReplyText('');
                    }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={hostReplyText}
                      onChange={(e) => setHostReplyText(e.target.value)}
                      placeholder={`Atsakyti poilsiautojui ${activeThread.clientName}...`}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!hostReplyText.trim()}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Siųsti</span>
                    </button>
                  </form>

                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* MEMBERSHIP & PRO TIER TAB */}
      {activeTab === 'membership' && (
        <div className="space-y-8 font-sans">
          
          {/* Active Plan Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Šeimininkų Narystės Struktūra</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {hostTier === 'pro' && (
                    <span className="flex items-center gap-2">
                      <span>Jūsų aktyvus planas:</span>
                      <span className="text-amber-400">2. PRO (29 € / mėn.)</span>
                    </span>
                  )}
                  {hostTier === 'premium' && (
                    <span className="flex items-center gap-2">
                      <span>Jūsų aktyvus planas:</span>
                      <span className="text-purple-300">3. PREMIUM (0 € + 6-10% komisinis)</span>
                    </span>
                  )}
                  {hostTier === 'free' && (
                    <span>Jūsų aktyvus planas: <span className="text-emerald-300">1. FREE (0 € pirmus 1 m., vėliau 15 €/mėn.)</span></span>
                  )}
                </h2>
                
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  {hostTier === 'pro' && 'Jūsų skelbimai rodomi pirmoje vietoje rekomenduojamose poilsio vietose su „PRO Šeimininkas“ ženkleliu. Nėra jokio rezervacijos komisinio mokesčio!'}
                  {hostTier === 'premium' && 'Didžiausias patogumas: pilna automatika su Stripe mokėjimais ir automatiniu rezervacijų tvarkymu.'}
                  {hostTier === 'free' && 'Nemokamas planas pradedantiems smulkiems šeimininkams, norintiems tiesiog būti matomiems.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200 pt-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>Lanksčios narystės sąlygos ir skaidrios taisyklės</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>Keiskite planą bet kuriuo metu</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 space-y-2 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center sm:text-left min-w-[220px]">
                <div className="text-xs text-emerald-200">Greitas plano pasirinkimas:</div>
                <div className="space-y-2">
                  <button
                    onClick={() => setHostTier('free')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                      hostTier === 'free' ? 'bg-emerald-500 text-white font-extrabold shadow-sm' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <span>1. Free (0 €)</span>
                    {hostTier === 'free' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHostTier('pro')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                      hostTier === 'pro' ? 'bg-amber-400 text-amber-950 font-black shadow-sm' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <span>2. Pro (29 €/mėn.)</span>
                    {hostTier === 'pro' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHostTier('premium')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                      hostTier === 'premium' ? 'bg-purple-500 text-white font-black shadow-sm' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <span>3. Premium (6-10%)</span>
                    {hostTier === 'premium' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Pricing & Feature Comparison Table */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-black text-gray-900">Nauja Plano Struktūra Šeimininkams</h3>
              <p className="text-xs text-gray-500">Pasirinkite sau tinkamiausią bendradarbiavimo ir matomumo lygį.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* 1. Free Card */}
              <div className={`bg-white rounded-3xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
                hostTier === 'free' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md' : 'border-gray-200'
              }`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">1. Plano lygis</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-0.5">Free</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                      0 € / mėn.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-black text-gray-900">
                      0 € <span className="text-xs font-medium text-gray-500">(1 m. nemokamai, vėliau 15 €/mėn.)</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      Komisinis (nuo rezervacijos): **Nėra (0%)**
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <strong>Kam skirta:</strong> Pradedantiems, smulkiems hostams, kurie nori tik „būti matomi“.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="font-bold text-gray-900">Funkcijos:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Nemokama registracija ir matomumas stovyklaviečių kataloge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Tiesioginiai klientų užklausų srautai</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-400 line-through">
                        <XCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                        <span>Prioritetinis rodymas rekomendacijose viršuje</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setHostTier('free')}
                  disabled={hostTier === 'free'}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition mt-4 ${
                    hostTier === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-default font-extrabold'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                  }`}
                >
                  {hostTier === 'free' ? 'Dabartinis Planas' : 'Pasirinkti Free Planą'}
                </button>
              </div>

              {/* 2. Pro Card */}
              <div className={`bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 rounded-3xl p-6 border-2 transition-all space-y-5 flex flex-col justify-between relative overflow-hidden ${
                hostTier === 'pro' ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-xl' : 'border-amber-300 hover:border-amber-400'
              }`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">2. Plano lygis</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-0.5 flex items-center gap-1.5">
                        <span>Pro</span>
                        <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full shadow-xs">
                      PRO REKOMENDUOJAMA
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-black text-amber-950">
                      29 € <span className="text-xs font-bold text-gray-500">/ mėn.</span>
                    </div>
                    <div className="text-xs font-bold text-amber-900 bg-amber-100/80 p-2 rounded-lg border border-amber-200">
                      Komisinis (nuo rezervacijos): **Nėra (0%)**
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                    <strong>Kam skirta:</strong> Profesionaliems hostams, kurie nori skelbti kemperius, valdyti kalendorius ir gauti tiesioginius klientų užklausų srautus.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="font-bold text-gray-900">PRO Privalumai:</div>
                    <ul className="space-y-2 text-gray-700 font-medium">
                      <li className="flex items-start gap-2 bg-amber-100/60 p-2 rounded-lg border border-amber-200 text-amber-950 font-extrabold">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Rekomenduojamų vietų pirmenybė:</strong> Rodo PRO skelbimus pačioje viršuje</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Kalendorių ir iCal sinchronizavimo valdymas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Kemperių, palapinių ir sodybų skelbimų valdymas</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setHostTier('pro')}
                  disabled={hostTier === 'pro'}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition mt-4 flex items-center justify-center gap-2 ${
                    hostTier === 'pro'
                      ? 'bg-amber-500 text-white cursor-default shadow-xs'
                      : 'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black shadow-md cursor-pointer'
                  }`}
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>{hostTier === 'pro' ? 'Dabartinis PRO Planas' : 'Pasirinkti Pro Planą'}</span>
                </button>
              </div>

              {/* 3. Premium Card */}
              <div className={`bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 rounded-3xl p-6 border-2 transition-all space-y-5 flex flex-col justify-between ${
                hostTier === 'premium' ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-xl' : 'border-purple-200 hover:border-purple-300'
              }`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider">3. Plano lygis</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-0.5 flex items-center gap-1.5">
                        <span>Premium</span>
                        <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-bold text-xs rounded-full border border-purple-200">
                      Pilna automatika
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-black text-purple-950">
                      0 € <span className="text-xs font-bold text-gray-500">(tik prenumeratos nereikia)</span>
                    </div>
                    <div className="text-xs font-bold text-purple-900 bg-purple-100/80 p-2 rounded-lg border border-purple-200">
                      Komisinis (nuo rezervacijos): **6% – 10%**
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium bg-purple-50/80 p-3 rounded-xl border border-purple-100">
                    <strong>Kam skirta:</strong> Didžiausio patogumo ieškantiems: pilna automatika su Stripe, klientas rezervuoja pats, hostui nereikia nieko administruoti.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="font-bold text-gray-900">Premium Privalumai:</div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Pilnas Stripe momentinis apmokėjimas ir Escrow apsauga</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Automatiniai pranešimai ir patvirtinimai svečiams</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Nuliniam administravimo poreikiui – automatizuotas srautas</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setHostTier('premium')}
                  disabled={hostTier === 'premium'}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition mt-4 ${
                    hostTier === 'premium'
                      ? 'bg-purple-600 text-white cursor-default font-extrabold shadow-xs'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer'
                  }`}
                >
                  {hostTier === 'premium' ? 'Dabartinis Premium Planas' : 'Pasirinkti Premium Planą'}
                </button>
              </div>

            </div>
          </div>

          {/* Dynamic PRO Pricing Calculation Breakdown Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-100/40 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 font-sans space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-xs">
                <Crown className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h4 className="font-black text-lg text-gray-900">Jūsų Skelbimų PRO Mėnesinio Mokesčio Apskaičiavimas</h4>
                <p className="text-xs text-gray-600">
                  Taisyklė: PRO narystės kaina už kiekvieną objektą = **to sklypo 1 nakvynės kaina per mėnesį**.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-3">
              <div className="text-xs font-bold text-gray-900 border-b border-gray-150 pb-2 flex justify-between items-center">
                <span>Jūsų Registruoti Sklypai ({userCampsites.length})</span>
                <span className="text-amber-900">1 Nakvynės Kaina ➔ PRO Mokestis / mėn.</span>
              </div>

              {userCampsites.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  Jūs dar neturite užregistruotų sklypų. Pridėjus sklypą (pvz. už €30/naktį), jo PRO mėnesinis mokestis bus lygiai €30/mėn.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {userCampsites.map((site) => (
                    <div key={site.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-1.5 border-b border-gray-50 text-gray-800 font-medium gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">• {site.title}</span>
                        <span className="text-[10px] text-gray-400">({site.location})</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold self-end sm:self-auto">
                        <span>€{site.pricePerNight} / naktį</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black border border-amber-300">
                          €{site.pricePerNight} / mėn.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-black text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  <span>Bendras PRO Mėnesinis Mokestis Visiems Objektams:</span>
                  <span className="text-xs font-normal text-gray-500">({userCampsites.length} sklypai)</span>
                </div>
                <div className="text-emerald-800 text-lg sm:text-xl font-extrabold flex items-center gap-1.5 self-end sm:self-auto">
                  <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>€{totalProMonthlyCost} / mėn.</span>
                </div>
              </div>
            </div>
          </div>

          {/* PRO ANALYTICS & STATISTICS PREVIEW */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-extrabold text-gray-900">PRO Lankomumo Analitika ir Statistika</h3>
                  {hostTier === 'free' && (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-full border border-amber-300">
                      PRO Įrankis
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pamatykite, kaip poilsiautojai randa jūsų stovyklavietę ir kiek užsakymų sulaukiate.</p>
              </div>

              {hostTier === 'free' && (
                <button
                  onClick={() => setHostTier('pro')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 fill-white" />
                  <span>Atrakinti Analitiką</span>
                </button>
              )}
            </div>

            {/* Metrics cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${hostTier === 'free' ? 'blur-xs opacity-60 pointer-events-none' : ''}`}>
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Skelbimo Peržiūros</span>
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-950">
                  {userCampsites.reduce((sum, c) => sum + (c.stats?.views || 342), 0)}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+24% daugiau per pastarąsias 30 dienų</span>
                </div>
              </div>

              <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                  <span>Paieškos Rodymai</span>
                  <MousePointer className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-blue-950">
                  {userCampsites.reduce((sum, c) => sum + (c.stats?.searchImpressions || 1850), 0)}
                </div>
                <div className="text-[11px] font-semibold text-blue-700">
                  Aukščiausioje paieškos pozicijoje
                </div>
              </div>

              <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                  <span>Įtraukimai į Favoritus</span>
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                </div>
                <div className="text-3xl font-black text-rose-950">
                  {userCampsites.reduce((sum, c) => sum + (c.stats?.wishlistCount || 28), 0)}
                </div>
                <div className="text-[11px] font-semibold text-rose-700">
                  Didelis poilsiautojų susidomėjimas
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* RENDER DISPUTE MODAL */}
      {disputingReview && (
        <DisputeReviewModal
          isOpen={!!disputingReview}
          onClose={() => setDisputingReview(null)}
          campsiteId={disputingReview.campsiteId}
          review={disputingReview.review}
        />
      )}

      {/* RENDER HOST AVATAR UPLOAD MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Įkelti / Keisti Šeimininko Nuotrauką</h3>
                  <p className="text-xs text-gray-500">Pasirinkite failą iš įrenginio arba pavyzdinį avatarą</p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <HostPhotoUploader
              value={tempAvatar}
              onChange={(newUrl) => setTempAvatar(newUrl)}
              hostName={currentUser.name}
              label="Nauja Profilio Nuotrauka"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Atšaukti
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempAvatar) {
                    updateUserProfile({ avatar: tempAvatar });
                  }
                  setShowAvatarModal(false);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Išsaugoti Nuotrauką</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

