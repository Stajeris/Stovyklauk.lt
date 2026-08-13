import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Clock, Search, MapPin, 
  Trash2, Eye, EyeOff, Plus, Sparkles, AlertCircle, Building2, User, 
  Check, X, RefreshCw, ChevronRight, ExternalLink, ShieldAlert, AlertTriangle, Star, MessageSquare,
  CreditCard, DollarSign, Zap, Download, FileText, Lock, ChevronDown, ChevronUp, UserCheck, Shield, Crown,
  Calendar as CalendarIcon, LogOut, Edit, Save, Key, Mail, Phone, Send
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, PropertyType, Review, Booking, UserProfile } from '../types';
import { OrderApproxMap } from './OrderApproxMap';
import { LocationPickerMap } from './LocationPickerMap';
import { ProtectedChatMessage } from '../utils/privacyFilter';
import { HostCalendarManager } from './HostCalendarManager';
import { generateSystemEmail, SystemEmailType } from '../utils/emailSystem';

export const AdminPanel: React.FC = () => {
  const { 
    campsites, 
    bookings, 
    chatThreads,
    replyToThread,
    currentUser,
    usersList,
    emailLogs,
    dispatchSystemEmail,
    setCurrentUser,
    logoutUser,
    openAuthModal,
    switchUserRole,
    updateUserRoleInList,
    updateUserProfileByAdmin,
    deleteUser,
    approveCampsite, 
    rejectCampsite, 
    updateCampsiteStatus, 
    deleteCampsite, 
 addCampsite,
    resolveReviewDispute,
    selectCampsiteById,
    updateHostTier,
    resetTestReservations,
    setView 
  } = useCampsites();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'add-new' | 'reviews-disputes' | 'chats' | 'users' | 'calendar' | 'email-logs'>('pending');
  const [adminEmailTab, setAdminEmailTab] = useState<SystemEmailType>('reservation_confirmed');
  const [emailLogSearch, setEmailLogSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreviewCamp, setSelectedPreviewCamp] = useState<Campsite | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Admin chat tab state
  const [selectedChatPropertyId, setSelectedChatPropertyId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // New admin property form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRegion, setNewRegion] = useState('Aukštaitija');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newLatitude, setNewLatitude] = useState<number>(55.1694);
  const [newLongitude, setNewLongitude] = useState<number>(25.4520);
  const [newType, setNewType] = useState<PropertyType>('tent');
  const [newPrice, setNewPrice] = useState(30);
  const [newMaxGuests, setNewMaxGuests] = useState(4);
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'pending'>('approved');

  const pendingCampsites = campsites.filter(c => c.status === 'pending');
  const approvedCampsites = campsites.filter(c => c.status === 'approved' || !c.status);
  const rejectedCampsites = campsites.filter(c => c.status === 'rejected');

  // Collect all disputed reviews across campsites
  const disputedReviews: { campsite: Campsite; review: Review }[] = [];
  campsites.forEach(c => {
    (c.reviews || []).forEach(r => {
      if (r.disputed || r.disputeStatus === 'pending_admin') {
        disputedReviews.push({ campsite: c, review: r });
      }
    });
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDismissDispute = (campsiteId: string, reviewId: string, authorName: string) => {
    resolveReviewDispute(campsiteId, reviewId, 'dismiss');
    showToast(`✅ Skundas atremtas: Svečio "${authorName}" atsiliepimas išsaugotas. Neigiama kritika atitinka taisykles.`);
  };

  const handleRemoveReview = (campsiteId: string, reviewId: string, authorName: string) => {
    if (window.confirm(`Ar tikrai norite pašalinti svečio "${authorName}" atsiliepimą dėl esminio taisyklių pažeidimo?`)) {
      resolveReviewDispute(campsiteId, reviewId, 'remove');
      showToast(`🗑️ Atsiliepimas pašalintas dėl taisyklių pažeidimo.`);
    }
  };

  const handleApprove = (id: string, title: string) => {
    approveCampsite(id);
    showToast(`✅ Skelbimas "${title}" sėkmingai patvirtintas ir paskelbtas viešai!`);
  };

  const handleReject = (id: string, title: string) => {
    rejectCampsite(id);
    showToast(`❌ Skelbimas "${title}" atmestas.`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Ar tikrai norite ištrinti stovyklavietę "${title}" iš sistemos?`)) {
      deleteCampsite(id);
      showToast(`🗑️ Skelbimas "${title}" ištrintas.`);
    }
  };

  const handleCreateAdminListing = (e: React.FormEvent) => {
    e.preventDefault();
    addCampsite({
      title: newTitle || 'Administratoriaus pridėtas sklypas',
      description: newDescription || 'Privati stovyklavietė gamtos apsuptyje.',
      location: newLocation || 'Utena',
      region: newRegion,
      addressLine: newAddressLine || undefined,
      postalCode: newPostalCode || undefined,
      latitude: newLatitude,
      longitude: newLongitude,
      pricePerNight: newPrice,
      propertyType: newType,
      maxGuests: newMaxGuests,
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
      ],
      host: {
        id: 'admin-host',
        name: 'Campy.lt Administratorius',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isSuperhost: true,
        joinedDate: '2026 m.',
        responseRate: '100%',
        bio: 'Oficialus platformos administratorius.'
      },
      amenities: ['Laužavietė', 'Geriamas vanduo', 'Pikniko stalas'],
      cancellationPolicy: 'flexible',
      terrainType: 'Miškas ir Ežero pakrantė',
      featured: true,
      status: newStatus,
      rules: ['Tylos valandos nuo 22:00', 'Šiukšles išsivežti']
    });

    showToast(`✨ Skelbimas sėkmingai pridėtas ir ${newStatus === 'approved' ? 'patvirtintas' : 'išsaugotas peržiūrai'}!`);
    setNewTitle('');
    setNewLocation('');
    setNewAddressLine('');
    setNewPostalCode('');
    setNewDescription('');
    setActiveTab('all');
  };

  const filteredAllCampsites = campsites.filter(c => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved' && (c.status === 'approved' || !c.status)) return true;
      if (c.status !== statusFilter) return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchLoc = c.location.toLowerCase().includes(q);
      const matchRegion = c.region.toLowerCase().includes(q);
      const matchAddress = c.addressLine?.toLowerCase().includes(q) || false;
      const matchHost = c.host.name.toLowerCase().includes(q);
      return matchTitle || matchLoc || matchRegion || matchAddress || matchHost;
    }

    return true;
  });

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-5 font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
          🛡️
        </div>
        <h2 className="text-2xl font-black text-gray-900">Atsijungta iš Admin paskyros</h2>
        <p className="text-gray-600 text-xs leading-relaxed">
          Prieiga prie platformos backend valdymo pulto galima tik prisijungus su administratoriaus teisėmis.
        </p>
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              const adminUser = usersList.find(u => u.isAdmin);
              if (adminUser) setCurrentUser(adminUser);
              else openAuthModal('login');
            }}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            👑 Prisijungti kaip Administratorius
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs transition cursor-pointer"
          >
            🔑 Prisijungti su kitu el. paštu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans bg-gray-50 min-h-screen">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-emerald-950 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistemos Backend Valdymas
            </span>
            <span className="text-xs font-semibold text-emerald-300">
              Prisijungęs: <b>{currentUser.name}</b>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Administratoriaus Panelė
          </h1>
          <p className="text-emerald-200 text-xs max-w-xl">
            Valdykite visus Stovyklaviečių skelbimus Lietuvoje, tikrinkite patvirtinimo užklausas bei administruokite platformos objektus.
          </p>
        </div>

        {/* Quick Pending Alert Pill & Unlogin Button */}
        <div className="z-10 flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('Ar tikrai norite išvalyti visus testinius užsakymus bei atlaisvinti kalendorių naujam testavimo ciklui?')) {
                resetTestReservations();
                showToast('🧹 Visi testiniai užsakymai ir kalendorių blokavimai sėkmingai išvalyti!');
              }
            }}
            className="px-4 py-3 rounded-2xl bg-amber-400/90 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Išvalo testinius užsakymus, rezervacijas ir atlaisvina kalendorius"
          >
            <span>🧹 Išvalyti testines rezervacijas</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition cursor-pointer shadow-md ${
              pendingCampsites.length > 0
                ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 animate-pulse'
                : 'bg-emerald-800 hover:bg-emerald-700 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Laukia Peržiūros ({pendingCampsites.length})</span>
          </button>

          <button
            onClick={() => logoutUser()}
            className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Atsijungti iš Admin paskyros (Unlogin)"
          >
            <LogOut className="w-4 h-4" />
            <span>Atsijungti iš Admin</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Viso Skelbimų</span>
          <div className="text-2xl font-extrabold text-gray-900">{campsites.length}</div>
          <p className="text-[11px] text-gray-500 font-medium">Sistemos objekte</p>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-1 ${pendingCampsites.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Laukia Peržiūros</span>
          <div className="text-2xl font-extrabold text-amber-900">{pendingCampsites.length}</div>
          <p className="text-[11px] text-amber-700 font-medium">Reikia patvirtinti</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Viešai Paskelbta</span>
          <div className="text-2xl font-extrabold text-emerald-800">{approvedCampsites.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Matoma ieškotojams</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Atmesta</span>
          <div className="text-2xl font-extrabold text-rose-700">{rejectedCampsites.length}</div>
          <p className="text-[11px] text-gray-500 font-medium">Neaktyvūs skelbimai</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Viso Užsakymų</span>
          <div className="text-2xl font-extrabold text-gray-900">{bookings.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Rezervacijos sistemoje</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 gap-4 pb-1">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Laukiančios Peržiūros</span>
            {pendingCampsites.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-full">
                {pendingCampsites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Visos Stovyklavietės ({campsites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add-new')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'add-new'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Pridėti sklypą (Admin)</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews-disputes')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'reviews-disputes'
                ? 'border-amber-600 text-amber-900 bg-amber-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Atsiliepimų Moderavimas & Ginčai</span>
            {disputedReviews.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-full">
                {disputedReviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'chats'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>💬 Pokalbiai pagal Skelbimą</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-700 text-white rounded-full">
              {chatThreads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>👥 Vartotojai ir Paskyrų Tipai</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
              {usersList?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'calendar'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>📅 Rezervacijų Kalendorius</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-700 text-white rounded-full">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('email-logs')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'email-logs'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>✉️ El. Pašto Logai & Šablonai (9 Tipai)</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-800 text-white rounded-full">
              {emailLogs?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING REVIEW LIST */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingCampsites.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Visos užklausos peržiūrėtos!</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto">
                Šiuo metu nėra jokių laukiančių stovyklaviečių skelbimų. Visi pateikti sklypai yra patvirtinti arba atmesti.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
              >
                Peržiūrėti visų skelbimų sąrašą
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Skelbimai, reikalaujantys administratoriaus patvirtinimo ({pendingCampsites.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {pendingCampsites.map(site => (
                  <div key={site.id} className="bg-white rounded-3xl border-2 border-amber-200 shadow-md p-6 space-y-6 transition hover:shadow-lg">
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Image Preview */}
                      <div className="w-full lg:w-72 h-48 lg:h-auto rounded-2xl overflow-hidden relative shrink-0">
                        <img 
                          src={site.images[0]} 
                          alt={site.title} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full shadow-xs">
                          ⏳ Laukia patvirtinimo
                        </span>
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-lg">
                          €{site.pricePerNight} / parai
                        </div>
                      </div>

                      {/* Listing Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              {site.propertyType === 'tent' ? '⛺ Palapinių sklypas' : site.propertyType === 'glamping' ? '✨ Glampingas' : site.propertyType === 'rv' ? '🚐 Kemperiai' : site.propertyType === 'cabin' ? '🏡 Atostogų namelis' : '🌲 Kita'}
                            </span>
                            <h3 className="text-xl font-extrabold text-gray-900 mt-1">{site.title}</h3>
                            
                            {/* Address details */}
                            <div className="mt-2 text-xs text-gray-700 space-y-1">
                              <p className="flex items-center gap-1 font-bold">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{site.location} ({site.region})</span>
                              </p>
                              {(site.addressLine || site.postalCode) && (
                                <p className="text-emerald-900 font-semibold pl-4.5 bg-emerald-50/70 py-1 px-2 rounded-lg inline-block border border-emerald-100">
                                  📍 Tikslus adresas: {site.addressLine ? site.addressLine : ''}{site.addressLine && site.postalCode ? ', ' : ''}{site.postalCode ? site.postalCode : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Host */}
                          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <img src={site.host.avatar} alt={site.host.name} className="w-9 h-9 rounded-full object-cover" />
                            <div className="text-left">
                              <span className="text-[10px] font-bold text-gray-400 block">Šeimininkas</span>
                              <span className="text-xs font-bold text-gray-900 block">{site.host.name}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {site.description}
                        </p>

                        {/* Amenities Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {site.amenities.map(a => (
                            <span key={a} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                              {a}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={() => setSelectedPreviewCamp(site)}
                            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                            <span>Peržiūrėti adreso žemėlapį ir detales</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(site.id, site.title)}
                              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Atmesti</span>
                            </button>

                            <button
                              onClick={() => handleApprove(site.id, site.title)}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Patvirtinti ir Paskelbti</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL CAMPSITES LIST & FILTER */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ieškoti pagal pavadinimą, adresą, šeimininką..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-gray-500">Filtras pagal būseną:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Visi skelbimai ({campsites.length})</option>
                <option value="approved">Patvirtinti ({approvedCampsites.length})</option>
                <option value="pending">Laukia peržiūros ({pendingCampsites.length})</option>
                <option value="rejected">Atmesti ({rejectedCampsites.length})</option>
              </select>
            </div>
          </div>

          {/* Table / Grid */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Stovyklavietė</th>
                    <th className="py-3.5 px-4">Adresas / Vieta</th>
                    <th className="py-3.5 px-4">Kaina / Parai</th>
                    <th className="py-3.5 px-4">Šeimininkas</th>
                    <th className="py-3.5 px-4">Būsena</th>
                    <th className="py-3.5 px-4 text-right">Veiksmai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredAllCampsites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 font-semibold">
                        Skelbimų pagal nurodytą paiešką nerasta.
                      </td>
                    </tr>
                  ) : (
                    filteredAllCampsites.map(site => (
                      <tr key={site.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={site.images[0]} alt={site.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200" />
                            <div>
                              <span className="font-extrabold text-gray-900 block line-clamp-1">{site.title}</span>
                              <span className="text-[10px] text-gray-400 capitalize">
                                {site.propertyType === 'tent' ? 'Palapinėms' : site.propertyType === 'glamping' ? 'Glamping' : site.propertyType === 'rv' ? 'Kemperiams' : site.propertyType === 'cabin' ? 'Atostogų namelis' : 'Kita'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-gray-800 block">{site.location}</span>
                            {site.addressLine && (
                              <span className="text-[10px] font-semibold text-emerald-800 block truncate max-w-xs">
                                📍 {site.addressLine}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-emerald-900">
                          €{site.pricePerNight}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <img src={site.host.avatar} alt={site.host.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-semibold text-gray-800">{site.host.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={site.status || 'approved'}
                            onChange={(e) => {
                              const newSt = e.target.value as 'approved' | 'pending' | 'rejected';
                              updateCampsiteStatus(site.id, newSt);
                              showToast(`Būsena pakeista į "${newSt === 'approved' ? 'Patvirtinta' : newSt === 'pending' ? 'Laukia' : 'Atmesta'}"`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                              (!site.status || site.status === 'approved')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : site.status === 'pending'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="approved">✓ Patvirtinta (Vieša)</option>
                            <option value="pending">⏳ Laukia peržiūros</option>
                            <option value="rejected">❌ Atmesta</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => selectCampsiteById(site.id)}
                              className="p-2 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="Peržiūrėti puslapį"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedPreviewCamp(site)}
                              className="p-2 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="Detalės ir Žemėlapis"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(site.id, site.title)}
                              className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Šalinti"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADD NEW PROPERTY DIRECTLY AS ADMIN */}
      {activeTab === 'add-new' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Pridėti naują stovyklavietę tiesiogiai per Administratoriaus panelę</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Pridėkite stovyklavietę kaip platformos administratorius su pasirinkta būsena.
            </p>
          </div>

          <form onSubmit={handleCreateAdminListing} className="space-y-4 text-xs font-bold text-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Stovyklavietės Pavadinimas *</label>
                <input 
                  type="text" 
                  required
                  placeholder="pvz., Nemuno Kilpų Glamping Kupolas"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Miestas / Rajonas *</label>
                <input 
                  type="text" 
                  required
                  placeholder="pvz., Birštonas, Prienų r."
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Regionas *</label>
                <select
                  value={newRegion}
                  onChange={e => setNewRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="Aukštaitija">Aukštaitija</option>
                  <option value="Dzūkija">Dzūkija</option>
                  <option value="Žemaitija">Žemaitija</option>
                  <option value="Pajūris">Pajūris</option>
                  <option value="Suvalkija">Suvalkija</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Gatvė ir Namo/Sklypo nr. (Adresas)</label>
                <input 
                  type="text" 
                  placeholder="pvz., Nemuno g. 15"
                  value={newAddressLine}
                  onChange={e => setNewAddressLine(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Pašto Kodas</label>
                <input 
                  type="text" 
                  placeholder="pvz., LT-59201"
                  value={newPostalCode}
                  onChange={e => setNewPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Map Location Picker */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                  🗺️ Pažymėkite tikslią stovyklavietės vietą žemėlapyje
                </label>
                <span className="text-[11px] text-gray-500 font-semibold">
                  Spustelėkite žemėlapį arba naudokite paiešką
                </span>
              </div>

              <LocationPickerMap
                latitude={newLatitude}
                longitude={newLongitude}
                height="280px"
                onChangeLocation={(lat, lng, addressDetails) => {
                  setNewLatitude(lat);
                  setNewLongitude(lng);
                  if (addressDetails) {
                    if (addressDetails.addressLine) setNewAddressLine(addressDetails.addressLine);
                    if (addressDetails.location && !newLocation) setNewLocation(addressDetails.location);
                    if (addressDetails.region) setNewRegion(addressDetails.region);
                    if (addressDetails.postalCode && !newPostalCode) setNewPostalCode(addressDetails.postalCode);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Kategorija</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as PropertyType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="tent">⛺ Palapinėms</option>
                  <option value="glamping">✨ Glamping</option>
                  <option value="rv">🚐 Kemperiams</option>
                  <option value="cabin">🏡 Atostogų nameliai</option>
                  <option value="other">🌲 Kita</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Kaina Parai (€)</label>
                <input 
                  type="number" 
                  min={5}
                  value={newPrice}
                  onChange={e => setNewPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Maks. Svečių</label>
                <input 
                  type="number" 
                  min={1}
                  value={newMaxGuests}
                  onChange={e => setNewMaxGuests(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Pradinė Būsena</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as 'approved' | 'pending')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-emerald-50 text-xs font-extrabold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="approved">✓ Patvirtinta (Vieša)</option>
                  <option value="pending">⏳ Laukia peržiūros</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-gray-500 mb-1">Aprašymas</label>
              <textarea 
                rows={3}
                placeholder="Trumpas stovyklavietės aprašymas..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                + Išsaugoti stovyklavietę sistemoje
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVIEWS MODERATION & DISPUTES TAB */}
      {activeTab === 'reviews-disputes' && (
        <div className="space-y-6 font-sans">
          
          {/* Moderation Guidelines Header Banner */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-amber-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5" />
                Moderavimo ir Ginčų Taisyklės
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Šeimininkų Apskųstų Atsiliepimų Valdymas</h2>
            <p className="text-amber-100 text-xs max-w-2xl leading-relaxed">
              Šeimininkai gali apskųsti atsiliepimą, jei jame yra keiksmažodžių, rasinės ar tautybės neapykantos kalbos, arba jei įrodyta, kad klientas nebuvo atvykęs. 
              <strong> Griežta taisyklė: Blogo ar kritiško atsiliepimo NEGALIMA ištrinti vien dėl to, kad jis nepatinka šeimininkui.</strong>
            </p>
          </div>

          {/* Disputed List */}
          {disputedReviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-3 shadow-2xs">
              <CheckCircle2 className="w-14 h-14 text-emerald-500/40 mx-auto" />
              <h3 className="font-bold text-xl text-gray-900">Apskųstų atsiliepimų šiuo metu nėra</h3>
              <p className="text-gray-500 text-xs max-w-sm mx-auto">
                Visi svečių palikti atsiliepimai atitinka stovyklavimo bendruomenės ir Stripe verifikuotų užsakymų standartus.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputedReviews.map(({ campsite: camp, review: rev }) => (
                <div key={rev.id} className="bg-white rounded-3xl border border-amber-200/90 p-6 shadow-xs space-y-4">
                  
                  {/* Campsite & Host Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Skundo Objektas
                      </span>
                      <h4 
                        onClick={() => selectCampsiteById(camp.id)}
                        className="font-extrabold text-base text-gray-900 hover:text-emerald-700 cursor-pointer transition mt-0.5"
                      >
                        {camp.title} ({camp.location})
                      </h4>
                      <p className="text-xs text-gray-500">Šeimininkas: {camp.host.name}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Skundo gauta</span>
                      <span className="text-xs font-extrabold text-gray-800">{rev.disputeDate || 'Pastaruoju metu'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left: Original Guest Review */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rev.authorName} (Svečias)</span>
                        </span>
                        <span className="text-xs font-black text-amber-500">★ {rev.rating}.0</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-xl border border-gray-150">
                        "{rev.comment}"
                      </p>
                      <span className="text-[10px] text-gray-400 block text-right">Paskelbta: {rev.date}</span>
                    </div>

                    {/* Right: Host Dispute Claim */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Šeimininko nurodytas pažeidimas</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-extrabold text-[10px] uppercase">
                          {rev.disputeCategory === 'profanity' ? '🤬 Keiksmažodžiai' :
                           rev.disputeCategory === 'hate_speech' ? '🚫 Neapykantos kalba' :
                           rev.disputeCategory === 'no_show' ? '❌ Klientas nebuvo atvykęs' : '⚠️ Pažeidimas'}
                        </span>
                      </div>

                      <p className="text-xs text-amber-950 font-medium leading-relaxed bg-white/90 p-3 rounded-xl border border-amber-200">
                        {rev.disputeReason || 'Šeimininkas teigia, kad atsiliepimas neatitinka platformos taisyklių.'}
                      </p>
                    </div>

                  </div>

                  {/* Admin Resolution Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Pasirinkite sprendimą: Blogo ar kritiško vertinimo negalima ištrinti, jei jame nėra šiurkščių taisyklių pažeidimų.
                    </p>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => handleDismissDispute(camp.id, rev.id, rev.authorName)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Atleisti Skundą (Atsiliepimas lieka)</span>
                      </button>

                      <button
                        onClick={() => handleRemoveReview(camp.id, rev.id, rev.authorName)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Pašalinti Atsiliepimą (Pažeidimas)</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 6: PROPERTY-BASED CHAT MESSAGES & HISTORY ARCHIVE */}
      {activeTab === 'chats' && (
        <div className="space-y-6 font-sans">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Centralizuota Saugykla • Skelbimų Pokalbiai
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Klientų ir Šeimininkų Pokalbių Istorija pagal Skelbimą
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
                Platformos administracinis archyvas. Visi klientų klausimai ir šeimininkų atsakymai yra saugomi ir priskiriami konkrečiam stovyklavietės skelbimo puslapiui. Galite peržiūrėti susirašinėjimus, stebėti užklausas bei rašyti tiesiogiai administratoriaus vardu.
              </p>
            </div>
          </div>

          {/* Search bar for chat properties */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ieškoti pagal stovyklavietę, šeimininką ar vietovę..."
                value={chatSearchTerm}
                onChange={(e) => setChatSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
            <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <span>Viso susirašinėjimų platformoje:</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-black text-xs">
                {chatThreads.length}
              </span>
            </div>
          </div>

          {/* Split view: Property Listings with Chat Threads on Left, Thread & Messages on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 cols): List of Properties with Chats */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-2">
                Stovyklavietės ir jų pokalbiai ({campsites.length})
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {campsites
                  .filter(c => {
                    if (!chatSearchTerm) return true;
                    const term = chatSearchTerm.toLowerCase();
                    return c.title.toLowerCase().includes(term) || 
                           c.location.toLowerCase().includes(term) ||
                           c.host.name.toLowerCase().includes(term);
                  })
                  .map(site => {
                    const siteThreads = chatThreads.filter(t => t.campsiteId === site.id);
                    const isSelected = (selectedChatPropertyId || campsites[0]?.id) === site.id;

                    return (
                      <div
                        key={site.id}
                        onClick={() => {
                          setSelectedChatPropertyId(site.id);
                          const firstThread = siteThreads[0];
                          if (firstThread) setSelectedThreadId(firstThread.id);
                          else setSelectedThreadId(null);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-600 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={site.images[0]}
                          alt={site.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-extrabold text-gray-900 truncate">{site.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              siteThreads.length > 0
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {siteThreads.length} {siteThreads.length === 1 ? 'pokalbis' : 'pokalbiai'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{site.location}</span>
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 pt-0.5">
                            <img
                              src={site.host.avatar}
                              alt={site.host.name}
                              className="w-4 h-4 rounded-full object-cover shrink-0"
                            />
                            <span className="font-semibold truncate">Šeimininkas: {site.host.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column (7 cols): Selected Property's Chat Threads & Active Message Feed */}
            <div className="lg:col-span-7 space-y-4">
              {(() => {
                const currentPropertyId = selectedChatPropertyId || campsites[0]?.id;
                const currentCamp = campsites.find(c => c.id === currentPropertyId) || campsites[0];

                if (!currentCamp) {
                  return (
                    <div className="bg-white rounded-3xl p-8 text-center text-gray-500 text-xs border border-gray-200">
                      Pasirinkite stovyklavietę peržiūrai
                    </div>
                  );
                }

                const propertyThreads = chatThreads.filter(t => t.campsiteId === currentCamp.id);
                const activeThreadId = selectedThreadId || propertyThreads[0]?.id;
                const activeThread = propertyThreads.find(t => t.id === activeThreadId) || propertyThreads[0];

                return (
                  <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-2xs space-y-5">
                    
                    {/* Selected Property Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentCamp.images[0]}
                          alt={currentCamp.title}
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <h3 className="text-base font-extrabold text-gray-900">{currentCamp.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <span>Šeimininkas: <strong>{currentCamp.host.name}</strong></span>
                            <span>•</span>
                            <span>{currentCamp.location}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          selectCampsiteById(currentCamp.id);
                          setView('campsite-detail');
                        }}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Atsidaryti skelbimą</span>
                      </button>
                    </div>

                    {/* Client Threads selector tabs for this property */}
                    {propertyThreads.length === 0 ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8 text-center space-y-2">
                        <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="font-bold text-sm text-gray-900">Šiai stovyklavietei kol kas nėra inicijuotų pokalbių</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                          Kai poilsiautojai nuspaus „Susisiekti su šeimininku“ skelbimo puslapyje, žinutės atsirasi čia automatiškai.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Client Thread Selector Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
                          <span className="text-[10px] font-bold uppercase text-gray-400 shrink-0">Klientai:</span>
                          {propertyThreads.map(thread => {
                            const isThreadSelected = thread.id === activeThread?.id;

                            return (
                              <button
                                key={thread.id}
                                onClick={() => setSelectedThreadId(thread.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                  isThreadSelected
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <img
                                  src={thread.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                  alt={thread.clientName}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                                <span>{thread.clientName}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Thread Message Timeline */}
                        {activeThread && (
                          <div className="space-y-4">
                            
                            {/* Thread Meta Bar */}
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-150 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">Klientas: {activeThread.clientName}</span>
                                <span className="text-gray-400">({activeThread.clientEmail})</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">Paskutinė žinutė: {activeThread.lastMessageTimestamp}</span>
                            </div>

                            {/* Message Feed */}
                            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200 space-y-3 max-h-[380px] overflow-y-auto">
                              {activeThread.messages.map(msg => {
                                const isClient = msg.role === 'client';
                                const isAdmin = msg.role === 'admin';

                                return (
                                  <div
                                    key={msg.id}
                                    className={`flex gap-3 max-w-[85%] ${isClient ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                                  >
                                    <div className="shrink-0">
                                      <img
                                        src={
                                          isClient 
                                            ? (msg.senderAvatar || activeThread.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')
                                            : isAdmin
                                            ? currentUser.avatar
                                            : (msg.senderAvatar || currentCamp.host.avatar)
                                        }
                                        alt={msg.senderName}
                                        className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-1"
                                      />
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold text-gray-600">{msg.senderName}</span>
                                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                          isClient
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : isAdmin
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'bg-blue-100 text-blue-900'
                                        }`}>
                                          {isClient ? 'Keliautojas' : isAdmin ? '👑 Adminas' : 'Šeimininkas'}
                                        </span>
                                      </div>

                                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                        isClient
                                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                                          : isAdmin
                                          ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-xs font-semibold'
                                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                                      }`}>
                                        <ProtectedChatMessage text={msg.text} role={msg.role} isCurrentUserAdmin={true} />
                                      </div>

                                      <span className={`block text-[9px] text-gray-400 mt-0.5 ${isClient ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Admin reply / intervention input box */}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!adminReplyText.trim()) return;

                                const adminSender = {
                                  id: currentUser.id || 'admin-user',
                                  name: `${currentUser.name} (Administratorius)`,
                                  avatar: currentUser.avatar,
                                  role: 'admin' as const
                                };

                                replyToThread(activeThread.id, adminSender, adminReplyText.trim());
                                setAdminReplyText('');
                                setToastMessage('✅ Pranešimas sėkmingai įrašytas į pokalbio istoriją!');
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="flex items-center gap-2 pt-2"
                            >
                              <input
                                type="text"
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="Įrašyti pranešimą administratoriaus vardu šioje žinučių gijoje..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
                              />
                              <button
                                type="submit"
                                disabled={!adminReplyText.trim()}
                                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Atsakyti v/admin</span>
                              </button>
                            </form>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* TAB 7: USER MANAGEMENT & ROLE TYPES */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Platformos Vartotojai ir Paskyrų Tipai</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Išskirstytos keliautojų (pirkėjų) ir šeimininkų (pardavėjų) paskyros. Galite akimirksniu pakeisti vartotojo tipą ar suteikti administratoriaus teises.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-150">
                <Search className="w-4 h-4 text-gray-400 ml-2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ieškoti pagal vardą ar el. paštą..." 
                  className="bg-transparent text-xs font-medium focus:outline-none w-48 sm:w-64"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider bg-gray-50/50">
                    <th className="p-3.5">Vartotojas</th>
                    <th className="p-3.5">El. Paštas & Telefonas</th>
                    <th className="p-3.5">Paskyros Tipas (Role)</th>
                    <th className="p-3.5">Šeimininko Planas (Tier)</th>
                    <th className="p-3.5">Būsena / Verifikacija</th>
                    <th className="p-3.5 text-right">Rolės Valdymas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {usersList
                    .filter(u => 
                      !searchTerm || 
                      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(u => {
                      const isClient = u.userType === 'client' || (!u.userType && !u.isAdmin && !u.isSuperhost);
                      const isHost = u.userType === 'host' || (!u.userType && (u.isSuperhost || u.id.startsWith('host-')));
                      const isAdmin = u.isAdmin || u.userType === 'admin';

                      return (
                        <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                          <td 
                            className="p-3.5 cursor-pointer group" 
                            onClick={() => setEditingUser({ ...u })}
                            title="Spustelėkite, norėdami redaguoti vartotojo informaciją"
                          >
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 group-hover:border-blue-400 transition" />
                              <div>
                                <p className="font-extrabold text-gray-900 group-hover:text-blue-700 transition flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 font-bold transition">✏️ Redaguoti</span>
                                </p>
                                <p className="text-[10px] text-gray-400">ID: {u.id}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-gray-800">{u.email}</p>
                            <p className="text-[11px] text-gray-500">{u.phone || 'Telefonas nenurodytas'}</p>
                          </td>

                          <td className="p-3.5">
                            {isAdmin && (
                              <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                                <Shield className="w-3 h-3 text-purple-600" />
                                <span>👑 Administratorius</span>
                              </span>
                            )}
                            {isHost && !isAdmin && (
                              <span className="bg-amber-100 text-amber-950 border border-amber-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                                <span>🏡 Šeimininkas</span>
                              </span>
                            )}
                            {isClient && !isAdmin && !isHost && (
                              <span className="bg-emerald-100 text-emerald-950 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                                <span>⛺ Keliautojas</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {isHost || u.hostTier ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                  {(u.hostTier === 'pro' || (!u.hostTier && (u.id === 'host-1' || u.isSuperhost))) && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 border border-amber-500 flex items-center gap-1">
                                      <Crown className="w-3 h-3 fill-amber-950" />
                                      <span>PRO (29 €/mėn.)</span>
                                    </span>
                                  )}
                                  {(u.hostTier === 'free' || (!u.hostTier && u.id !== 'host-1' && !u.isSuperhost)) && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                      FREE (0 €)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      updateHostTier(u.id, 'free');
                                      setToastMessage(`Pakeistas ${u.name} planas į FREE (0 €)`);
                                      setTimeout(() => setToastMessage(null), 3000);
                                    }}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer transition ${
                                      (u.hostTier === 'free' || (!u.hostTier && u.id !== 'host-1' && !u.isSuperhost))
                                        ? 'bg-gray-800 text-white border-gray-900 font-extrabold'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                                    }`}
                                  >
                                    Free
                                  </button>

                                  <button
                                    onClick={() => {
                                      updateHostTier(u.id, 'pro');
                                      setToastMessage(`Pakeistas ${u.name} planas į PRO (29 €/mėn.)`);
                                      setTimeout(() => setToastMessage(null), 3000);
                                    }}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer transition ${
                                      (u.hostTier === 'pro' || (!u.hostTier && (u.id === 'host-1' || u.isSuperhost)))
                                        ? 'bg-amber-400 text-amber-950 border-amber-500 font-extrabold shadow-xs'
                                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
                                    }`}
                                  >
                                    Pro
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">—</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                              u.isEmailVerified 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{u.isEmailVerified ? 'El. paštas patvirtintas' : 'Nepatvirtintas'}</span>
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  updateUserRoleInList(u.id, 'client');
                                  setToastMessage(`Pakeista vartotojo ${u.name} rolė į Keliautoją (pašalintos Admin teisės)`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className={`px-2.5 py-1.5 text-[10px] rounded-lg transition cursor-pointer font-bold ${
                                  isClient && !isAdmin
                                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                                }`}
                                title="Pakeisti rolę į Keliautoją"
                              >
                                ⛺ Keliautojas
                              </button>

                              <button
                                onClick={() => {
                                  updateUserRoleInList(u.id, 'host');
                                  setToastMessage(`Pakeista vartotojo ${u.name} rolė į Šeimininką (pašalintos Admin teisės)`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className={`px-2.5 py-1.5 text-[10px] rounded-lg transition cursor-pointer font-bold ${
                                  isHost && !isAdmin
                                    ? 'bg-amber-500 text-amber-950 shadow-xs font-extrabold'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                                }`}
                                title="Pakeisti rolę į Šeimininką"
                              >
                                🏡 Šeimininkas
                              </button>

                              <button
                                onClick={() => {
                                  updateUserRoleInList(u.id, 'admin');
                                  setToastMessage(`Vartotojui ${u.name} suteiktos Admin teisės`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className={`px-2.5 py-1.5 text-[10px] rounded-lg transition cursor-pointer font-bold ${
                                  isAdmin
                                    ? 'bg-purple-700 text-white shadow-xs font-extrabold'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900'
                                }`}
                                title="Suteikti Administratoriaus teises"
                              >
                                👑 Admin
                              </button>

                              <button
                                onClick={() => setEditingUser({ ...u })}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Redaguoti visą vartotojo informaciją"
                              >
                                <Edit className="w-3 h-3 text-white shrink-0" />
                                <span>Redaguoti</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Ar tikrai norite ištrinti vartotoją "${u.name}" (${u.email}) iš sistemos?`)) {
                                    deleteUser(u.id);
                                    setToastMessage(`🗑️ Vartotojas "${u.name}" sėkmingai ištrintas.`);
                                    setTimeout(() => setToastMessage(null), 3000);
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 border border-rose-200"
                                title="Ištrinti vartotoją iš sistemos"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>Ištrinti</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: RESERVATION CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-900 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Platformos Užsakymų & Kalendorių Administravimas</span>
            </div>
            <h2 className="text-2xl font-black">Visų Lietuvos Stovyklaviečių Rezervacijų Kalendorius</h2>
            <p className="text-xs text-emerald-200">
              Tikrinkite visų šeimininkų skelbimus, stebėkite užsakymų užimtumą, užveskite pelės žymeklį ant rezervacijų, kad pamatytumėte svečio informaciją, ir patvirtinkite arba atšaukite užsakymus vienu spustelėjimu.
            </p>
          </div>

          <HostCalendarManager campsites={campsites} isAdminView={true} />
        </div>
      )}

      {/* TAB 9: SYSTEM EMAIL LOGS & 9 LIVE TEMPLATES PREVIEW */}
      {activeTab === 'email-logs' && (
        <div className="space-y-6">
          {/* Admin Header Banner */}
          <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-900 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Administratoriui (Admin): Sistemos El. Pašto Valdymas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              El. Pašto Logai & Gyvoji Šablonų Peržiūra (9 Laiškų Tipai)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed max-w-3xl">
              Visi el. laiškų išsiuntimo įrašai atvaizduojami <strong className="text-white">System Sent Logs</strong> žurnale, o gyvoje šablonų peržiūroje galima stebėti visus 9 laiškų tipus.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-800 text-emerald-200 flex items-center gap-2">
                <span>📧 Išsiųstų laiškų skaičius:</span>
                <strong className="text-white font-extrabold text-sm">{emailLogs?.length || 0}</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-800 text-emerald-200 flex items-center gap-2">
                <span>✉️ Palaikomi Šablonų Tipai:</span>
                <strong className="text-amber-300 font-extrabold text-sm">9 / 9</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Live Email Template Switcher & HTML Preview */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 font-sans">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-stone-100 pb-4 gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-700" />
                  <span>Gyvoji Šablonų Peržiūra (Live 9 Template Preview)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pasirinkite vieną iš 9 laiško tipų, kad pamatytumėte tikrą sugeneruotą HTML turinį, adresato informaciją bei temą.
                </p>
              </div>

              <button
                onClick={() => {
                  const sampleCamp = campsites[0];
                  const sampleBk = bookings[0];
                  dispatchSystemEmail(adminEmailTab, {
                    booking: sampleBk as any,
                    campsite: sampleCamp,
                    user: currentUser,
                    verificationCode: '849201',
                    declineReason: 'Gauta didesnio prioriteto rezervacija tais pačiais datų terminais.'
                  });
                  setToastMessage(`✅ Testinis el. laiškas (${adminEmailTab}) sėkmingai sugeneruotas ir įrašytas į žurnalą!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Generuoti ir Išsiųsti Testinį Laišką</span>
              </button>
            </div>

            {/* 9 Template Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
              {[
                { id: 'welcome_user', label: '1. Vartotojo Registracija' },
                { id: 'welcome_host', label: '2. Šeimininko Registracija' },
                { id: 'reservation_request_received', label: '3. Užklausa Svečiui' },
                { id: 'new_reservation_request_host', label: '4. Užklausa Šeimininkui' },
                { id: 'reservation_confirmed', label: '5. Patvirtinimas' },
                { id: 'reservation_declined', label: '6. Atmetimas' },
                { id: 'arrival_instructions', label: '7. Atvykimo Kodai' },
                { id: 'password_reset_code', label: '8. Slaptažodžio Kodas' },
                { id: 'stay_completed_thank_you', label: '9. Atsiliepimo Kvietimas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminEmailTab(tab.id as SystemEmailType)}
                  className={`px-3.5 py-2 rounded-xl transition cursor-pointer border ${
                    adminEmailTab === tab.id
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs font-extrabold'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 font-semibold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Preview Container */}
            {(() => {
              const sampleCamp = campsites[0] || {
                id: 'camp-sample',
                title: 'Asvejos Ežero Stovyklavietė',
                location: 'Molėtai',
                pricePerNight: 45,
                images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'],
                propertyType: 'tent'
              };
              const sampleBk = bookings[0] || {
                id: 'bk-sample-101',
                campsiteTitle: sampleCamp.title,
                guestName: 'Giedrius Stajeris',
                guestEmail: 'GiedriusStajeris@gmail.com',
                guestPhone: '+37060000000',
                checkIn: '2026-08-20',
                checkOut: '2026-08-22',
                guestsCount: 2,
                totalPrice: 90
              };

              const preview = generateSystemEmail(adminEmailTab, {
                booking: sampleBk as any,
                campsite: sampleCamp as any,
                user: currentUser,
                verificationCode: '849201',
                declineReason: 'Užsakytoms datoms planuojami profilaktiniai sodybos tvarkymo darbai.'
              });

              return (
                <div className="p-4 sm:p-6 rounded-3xl bg-stone-100 border border-stone-200 space-y-4 font-sans max-w-3xl mx-auto shadow-inner">
                  <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-extrabold text-stone-500 uppercase tracking-wider text-[10px]">Šablono Tipas:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-200">
                        {adminEmailTab}
                      </span>
                    </div>
                    <p className="text-stone-600 font-bold">Gavėjas: <span className="text-stone-900 font-extrabold">{preview.recipientName} ({preview.recipientEmail})</span></p>
                    <p className="text-stone-600 font-bold">Tema: <span className="text-emerald-900 font-extrabold">{preview.subject}</span></p>
                  </div>

                  <div 
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: preview.htmlBody }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Section 2: System Sent Logs Journal */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>El. Laiškų Išsiuntimo Žurnalas (System Sent Logs)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Registruojami visi automatiniai ir rankiniu būdu sugeneruoti sisteminiai pranešimai.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ieškoti pagal gavėją ar temą..."
                    value={emailLogSearch}
                    onChange={(e) => setEmailLogSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white text-stone-900"
                  />
                </div>
              </div>
            </div>

            {(!emailLogs || emailLogs.length === 0) ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs space-y-2">
                <Mail className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-bold">El. laiškų žurnale dar nėra registruotų pranešimų.</p>
                <p className="text-[11px] text-stone-400">Atlikite testinį siuntimą viršuje arba įvykdykite rezervacijos užklausą.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {emailLogs
                  .filter(log => {
                    if (!emailLogSearch) return true;
                    const q = emailLogSearch.toLowerCase();
                    return (
                      log.recipientName?.toLowerCase().includes(q) ||
                      log.recipientEmail?.toLowerCase().includes(q) ||
                      log.subject?.toLowerCase().includes(q) ||
                      log.type?.toLowerCase().includes(q)
                    );
                  })
                  .map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                            {log.type}
                          </span>
                          <span className="font-extrabold text-stone-900">{log.recipientName}</span>
                          <span className="text-stone-500 font-mono text-[11px]">({log.recipientEmail})</span>
                        </div>
                        <p className="text-stone-900 font-extrabold text-xs">{log.subject}</p>
                        <p className="text-stone-600 font-medium text-[11px] line-clamp-2 bg-white p-2.5 rounded-xl border border-stone-200/80">
                          {log.contentPreview}
                        </p>
                      </div>
                      <div className="text-right shrink-0 text-[11px] text-stone-500 font-bold space-y-1">
                        <span className="block font-mono text-[10px] text-stone-400">{log.sentAt}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Išsiųsta (Sent)</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL INSPECTION MODAL */}
      {selectedPreviewCamp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 font-sans border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedPreviewCamp(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Administracinė skelbimo peržiūra
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{selectedPreviewCamp.title}</h3>
              <p className="text-xs text-gray-500">
                {selectedPreviewCamp.location} ({selectedPreviewCamp.region})
              </p>
            </div>

            {/* Address box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1">
              <span className="font-bold text-emerald-950 block">📍 Tikslus adresas:</span>
              <p className="text-emerald-900 font-semibold">
                {selectedPreviewCamp.addressLine ? selectedPreviewCamp.addressLine : 'Adresas nenurodytas'}, {selectedPreviewCamp.location} {selectedPreviewCamp.postalCode ? `(${selectedPreviewCamp.postalCode})` : ''}
              </p>
              <p className="text-[11px] text-emerald-700">
                GPS Koordinates: {selectedPreviewCamp.latitude.toFixed(4)}, {selectedPreviewCamp.longitude.toFixed(4)}
              </p>
            </div>

            {/* Map Preview */}
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <OrderApproxMap
                latitude={selectedPreviewCamp.latitude}
                longitude={selectedPreviewCamp.longitude}
                locationName={selectedPreviewCamp.addressLine ? `${selectedPreviewCamp.addressLine}, ${selectedPreviewCamp.location}` : selectedPreviewCamp.location}
                campsiteTitle={selectedPreviewCamp.title}
                height="220px"
              />
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-gray-500 mb-1">Aprašymas</h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {selectedPreviewCamp.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs font-extrabold text-emerald-900">
                Kaina: €{selectedPreviewCamp.pricePerNight} / parai
              </span>

              <div className="flex items-center gap-2">
                {selectedPreviewCamp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleReject(selectedPreviewCamp.id, selectedPreviewCamp.title);
                        setSelectedPreviewCamp(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                    >
                      Atmesti
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedPreviewCamp.id, selectedPreviewCamp.title);
                        setSelectedPreviewCamp(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-md"
                    >
                      Patvirtinti skelbimą
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedPreviewCamp(null)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs cursor-pointer"
                >
                  Uždaryti
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img 
                  src={editingUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                  alt={editingUser.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-stone-900">{editingUser.name}</h3>
                    <span className="text-xs bg-gray-100 font-mono text-gray-500 px-2 py-0.5 rounded-md">ID: {editingUser.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">✏️ Administratoriaus vartotojo valdymo langas</p>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition cursor-pointer"
                title="Uždaryti"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-4">
                <h4 className="font-extrabold text-xs uppercase text-stone-700 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Pagrindinė Vartotojo Informacija</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Vardas ir Pavardė *</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">El. Paštas *</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Telefonas</label>
                    <input
                      type="text"
                      value={editingUser.phone || ''}
                      onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                      placeholder="+370 600 00000"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Registracijos Data</label>
                    <input
                      type="text"
                      value={editingUser.joinedDate || ''}
                      onChange={e => setEditingUser({ ...editingUser, joinedDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Avataro Nuotraukos URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingUser.avatar || ''}
                        onChange={e => setEditingUser({ ...editingUser, avatar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' })}
                        className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Pavyzdinis
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Biografija / Aprašymas</label>
                    <textarea
                      value={editingUser.bio || ''}
                      onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Trumpas vartotojo aprašymas..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Security & Password */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase text-amber-900 tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-700" />
                    <span>Slaptažodžiai ir Saugumo Nustatymai</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = `CAMPY-${Math.floor(100000 + Math.random() * 900000)}`;
                      setEditingUser({ ...editingUser, password: generated, primaryPassword: generated });
                      setToastMessage(`⚡ Sugeneruotas naujas slaptažodis: ${generated}`);
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    className="text-[11px] font-extrabold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg transition cursor-pointer"
                  >
                    ⚡ Sugeneruoti Naują Slaptažodį
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Dabartinis / Naujas Slaptažodis</label>
                    <div className="relative">
                      <input
                        type={showModalPassword ? "text" : "password"}
                        value={editingUser.password || ''}
                        onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 bg-white border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Pirminis Prisijungimo Slaptažodis</label>
                    <input
                      type="text"
                      value={editingUser.primaryPassword || ''}
                      onChange={e => setEditingUser({ ...editingUser, primaryPassword: e.target.value })}
                      placeholder="Pirminis sugeneruotas slaptažodis"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Role & Plan Tier */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 space-y-4">
                <h4 className="font-extrabold text-xs uppercase text-purple-900 tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-700" />
                  <span>Rolė ir Šeimininkystės Planas</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Paskyros Rolė (userType)</label>
                    <select
                      value={editingUser.userType || (editingUser.isAdmin ? 'admin' : 'client')}
                      onChange={e => {
                        const val = e.target.value as 'client' | 'host' | 'admin';
                        setEditingUser({
                          ...editingUser,
                          userType: val,
                          isAdmin: val === 'admin'
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="client">⛺ Keliautojas (Client)</option>
                      <option value="host">🏡 Šeimininkas (Host)</option>
                      <option value="admin">👑 Administratorius (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Šeimininko Narystės Planas (hostTier)</label>
                    <select
                      value={(editingUser as any).hostTier || (editingUser.isSuperhost ? 'pro' : 'free')}
                      onChange={e => {
                        const val = e.target.value as 'free' | 'pro' | 'premium';
                        setEditingUser({
                          ...editingUser,
                          hostTier: val
                        } as any);
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="free">FREE (0 €) - Pagrindinis</option>
                      <option value="pro">PRO (29 €/mėn.) - Su skydeliu & kalendoriumi</option>
                      <option value="premium">PREMIUM (6-10%) - Maksimalus matomumas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Verification Checkboxes & Status Flags */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <h4 className="font-extrabold text-xs uppercase text-emerald-950 tracking-wider flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Verifikacijos ir Saugumo Varnelės</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={editingUser.isAdmin}
                      onChange={e => setEditingUser({
                        ...editingUser,
                        isAdmin: e.target.checked,
                        userType: e.target.checked ? 'admin' : (editingUser.userType === 'admin' ? 'client' : editingUser.userType)
                      })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">👑 Administratorius</p>
                      <p className="text-[10px] text-gray-500">Pilnos sistemos valdymo teisės</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={!!editingUser.isSuperhost}
                      onChange={e => setEditingUser({ ...editingUser, isSuperhost: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">⭐ Super-Šeimininkas</p>
                      <p className="text-[10px] text-gray-500">Patikimo šeimininko žženklas</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={!!editingUser.isEmailVerified}
                      onChange={e => setEditingUser({ ...editingUser, isEmailVerified: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">✉️ El. Paštas Patvirtintas</p>
                      <p className="text-[10px] text-gray-500">Verifikuotas el. pašto adresas</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={!!editingUser.isPhoneVerified}
                      onChange={e => setEditingUser({ ...editingUser, isPhoneVerified: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">📞 Telefonas Patvirtintas</p>
                      <p className="text-[10px] text-gray-500">Patvirtintas mobilus numeris</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={!!editingUser.mustChangePassword}
                      onChange={e => setEditingUser({ ...editingUser, mustChangePassword: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">🔑 Privalo Keisti Slaptažodį</p>
                      <p className="text-[10px] text-gray-500">Iššauks keitimo langą prisijungus</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-200/60 cursor-pointer hover:bg-emerald-50/50 transition">
                    <input
                      type="checkbox"
                      checked={!!editingUser.isFirstLogin}
                      onChange={e => setEditingUser({ ...editingUser, isFirstLogin: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-stone-900">🚀 Pirmojo Prisijungimo Būsena</p>
                      <p className="text-[10px] text-gray-500">Naujo vartotojo pasveikinimas</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer"
              >
                Atšaukti
              </button>

              <button
                type="button"
                onClick={() => {
                  updateUserProfileByAdmin(editingUser.id, editingUser);
                  if ((editingUser as any).hostTier) {
                    updateHostTier(editingUser.id, (editingUser as any).hostTier);
                  }
                  setToastMessage(`💾 Vartotojo "${editingUser.name}" informacija sėkmingai atnaujinta!`);
                  setTimeout(() => setToastMessage(null), 3500);
                  setEditingUser(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Išsaugoti Pakeitimus</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
