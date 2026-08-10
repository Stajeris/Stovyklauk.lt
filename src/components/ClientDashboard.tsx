import React, { useState } from 'react';
import { 
  Calendar, MapPin, Heart, MessageSquare, User, ShieldCheck, 
  Key, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight, 
  ExternalLink, QrCode, Sparkles, RefreshCw, Send, Lock, Compass,
  ChevronRight, Star, Clock, AlertTriangle, Shield
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { VisitArrivalConfirmationCard } from './VisitArrivalConfirmationCard';

export const ClientDashboard: React.FC = () => {
  const { 
    currentUser, 
    bookings, 
    campsites, 
    favorites, 
    chatThreads, 
    sendMessageInThread, 
    replyToThread,
    updateUserProfile,
    resetUserPassword,
    verifyUserEmail,
    switchUserRole,
    setView,
    selectCampsiteById
  } = useCampsites();

  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'messages' | 'profile'>('bookings');
  
  // Selected booking for QR Arrival Pass modal
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<any | null>(null);

  // Chat tab state
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Profile Edit Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Update State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');

  // Verify Email State
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('4829');
  const [showEmailVerifyBox, setShowEmailVerifyBox] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  // Filter client's bookings
  const clientBookings = bookings.filter(b => 
    b.userId === currentUser.id || 
    b.userEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  // Filter client's chat threads
  const clientThreads = chatThreads.filter(t => 
    t.clientId === currentUser.id || 
    t.clientEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  const activeThread = clientThreads.find(t => t.id === selectedThreadId) || clientThreads[0] || null;

  // Filter favorited campsites
  const favoritedCampsites = campsites.filter(c => favorites.includes(c.id));

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      phone: editPhone,
      bio: editBio
    });
    setProfileSuccessMsg('Profilio duomenys sėkmingai atnaujinti!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccessMsg('');

    if (currentUser.password && currentPass !== currentUser.password) {
      setPassError('Dabartinis slaptažodis neteisingas!');
      return;
    }

    if (newPass.length < 4) {
      setPassError('Naujas slaptažodis turi būti bent 4 simbolių ilgio.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError('Nauji slaptažodžiai nesutampa!');
      return;
    }

    resetUserPassword(currentUser.email, newPass);
    setPassSuccessMsg('Slaptažodis sėkmingai pakeistas!');
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    setTimeout(() => setPassSuccessMsg(''), 3000);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOtpInput.trim() !== simulatedOtp) {
      setVerifyMsg('Neteisingas verifikacijos kodas!');
      return;
    }
    verifyUserEmail(currentUser.id);
    setVerifyMsg('El. paštas sėkmingai patvirtintas!');
    setShowEmailVerifyBox(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeThread) return;

    replyToThread(
      activeThread.id,
      {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: 'client'
      },
      chatInput.trim()
    );

    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black">{currentUser.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-400" />
                  <span>Keliautojo / Pirkėjo Paskyra</span>
                </span>
                {currentUser.isEmailVerified && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>El. Paštas Patvirtintas</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 flex items-center gap-2">
                <span>✉️ {currentUser.email}</span>
                {currentUser.phone && <span>• 📞 {currentUser.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={() => {
                switchUserRole('host');
                setView('host-dashboard');
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-900 font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>🏡 Noriu Nuomoti Sodybą (Tapti Šeimininku)</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">Viso Užsakymų</p>
            <p className="text-2xl font-black text-white mt-1">{clientBookings.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">Išsaugoti Objektai</p>
            <p className="text-2xl font-black text-white mt-1">{favoritedCampsites.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">Žinutės Šeimininkams</p>
            <p className="text-2xl font-black text-white mt-1">{clientThreads.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">Paskyros Būsena</p>
            <p className="text-sm font-bold text-emerald-300 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Aktyvus Pirkėjas</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-150 p-2 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Mano Kelionės ir Užsakymai ({clientBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Išsaugoti Objektai ({favoritedCampsites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Pokalbiai su Šeimininkais ({clientThreads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Paskyros Nustatymai & Saugumas</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS & TRIPS */}
        {activeTab === 'bookings' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Jūsų Rezervuotos Kelionės</span>
              </h2>
              <button
                onClick={() => setView('search')}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Ieškoti Naujos Stovyklavietės</span>
              </button>
            </div>

            {clientBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2 justify-center mx-auto text-2xl">
                  🏕️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Dar Neturite Aktyvių Rezervacijų</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Atradote nuostabių privačių sodybų, pakrančių ir glamping palapinių visoje Lietuvoje. Pasirinkite datą ir užsisakykite savo poilsį!
                  </p>
                </div>
                <button
                  onClick={() => setView('search')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  Ieškoti Stovyklaviečių Żemėlapyje
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientBookings.map((b) => {
                  const camp = campsites.find(c => c.id === b.campsiteId);
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            ID: {b.id.slice(0, 8)}
                          </span>
                          <h3 className="text-base font-extrabold text-gray-900 mt-2">
                            {b.campsiteTitle || camp?.title || 'Stovyklavietė'}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{camp?.location || 'Lietuva'}</span>
                          </p>
                        </div>
                        {camp?.images?.[0] && (
                          <img 
                            src={camp.images[0]} 
                            alt={b.campsiteTitle} 
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl text-xs font-medium border border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Atvykimas – Išvykimas</p>
                          <p className="font-extrabold text-gray-800 mt-0.5">{b.checkIn} – {b.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Svečių Skaičius</p>
                          <p className="font-extrabold text-gray-800 mt-0.5">{b.guests} asmenys</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Mokėjimo Suma</p>
                          <p className="text-lg font-black text-emerald-700">€{b.totalPrice}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBookingForPass(b)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Atvykimo Bilietas (QR)</span>
                          </button>

                          {camp && (
                            <button
                              onClick={() => {
                                selectCampsiteById(camp.id);
                                setView('detail');
                              }}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Peržiūrėti
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span>Išsaugoti Mėgstamiausi Objektai</span>
            </h2>

            {favoritedCampsites.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ❤️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Mėgstamiausių Sąrašas Tuščias</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Spustelėkite širdutės piktogramą ant bet kurios stovyklavietės kortelės, kad išsaugotumėte ją vėlesnei kelionei!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritedCampsites.map(camp => (
                  <div key={camp.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <img 
                      src={camp.images[0]} 
                      alt={camp.title} 
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">{camp.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{camp.location}</span>
                          </p>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          €{camp.pricePerNight}/naktis
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          selectCampsiteById(camp.id);
                          setView('detail');
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition cursor-pointer"
                      >
                        Rezervuoti / Peržiūrėti
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MESSAGES & CHAT WITH HOSTS */}
        {activeTab === 'messages' && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Pranešimai ir Tiesioginiai Pokalbiai su Šeimininkais</span>
            </h2>

            {clientThreads.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  💬
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Užklausų ar Žinučių Dar Neturite</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Atidarykite bet kurios stovyklavietės puslapį ir spustelėkite "Užduoti Klausimą Šeimininkui", kad pradėtumėte pokalbį dėl laisvų datų, pirties ar atvykimo sąlygų.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm min-h-[500px]">
                {/* Threads Sidebar */}
                <div className="border-r border-gray-150 p-4 space-y-2 bg-gray-50/50">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Pokalbiai ({clientThreads.length})</p>
                  {clientThreads.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedThreadId(t.id)}
                      className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex items-center gap-3 ${
                        (activeThread?.id === t.id)
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                      }`}
                    >
                      <img 
                        src={t.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} 
                        alt={t.hostName} 
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold truncate">{t.hostName}</p>
                        <p className={`text-[11px] truncate ${activeThread?.id === t.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {t.campsiteTitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Chat Thread Box */}
                <div className="lg:col-span-2 p-6 flex flex-col justify-between">
                  {activeThread ? (
                    <>
                      <div>
                        <div className="pb-4 border-b border-gray-150 flex items-center gap-3">
                          <img 
                            src={activeThread.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} 
                            alt={activeThread.hostName} 
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900">{activeThread.hostName} (Šeimininkas)</h3>
                            <p className="text-xs text-emerald-700 font-bold">{activeThread.campsiteTitle}</p>
                          </div>
                        </div>

                        <div className="py-6 space-y-3 max-h-[350px] overflow-y-auto pr-2">
                          {activeThread.messages.map((m) => {
                            const isMe = m.role === 'client' || m.senderId === currentUser.id;
                            return (
                              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-medium shadow-sm ${
                                  isMe 
                                    ? 'bg-emerald-600 text-white rounded-br-none' 
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                                }`}>
                                  <p>{m.text}</p>
                                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                                    {m.timestamp}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-gray-150 flex gap-2">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Parašykite žinutę šeimininkui..." 
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Siųsti</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="text-center my-auto text-gray-400 text-xs">
                      Pasirinkite pokalbį iš sąrašo kairėje
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info Form */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Asmeniniai Profilio Duomenys</span>
              </h2>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Vardas ir Pavardė</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Telefonas</label>
                  <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+370 600 00000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Apie mane / Biografija</label>
                  <textarea 
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Išsaugoti Profilio Pakeitimus
                </button>
              </form>
            </div>

            {/* Password & Security */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Saugumas & Slaptažodžio Pakeitimas</span>
              </h2>

              {passError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Dabartinis Slaptažodis</label>
                  <input 
                    type="password" 
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Naujas Slaptažodis</label>
                  <input 
                    type="password" 
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Bent 4 simboliai"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Pakartoti Naują Slaptažodį</label>
                  <input 
                    type="password" 
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Pakeisti Slaptažodį
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* QR Arrival Pass Modal */}
      {selectedBookingForPass && (
        <VisitArrivalConfirmationCard
          booking={selectedBookingForPass}
          campsite={campsites.find(c => c.id === selectedBookingForPass.campsiteId)}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}
    </div>
  );
};
