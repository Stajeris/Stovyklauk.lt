import React, { useState } from 'react';
import { Tent, MapPin, Search, Calendar, Compass, PlusCircle, ShieldCheck, User, Sparkles, Briefcase, Clock, ChevronDown, Check, LogOut, KeyRound, Mail } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

export const Header: React.FC = () => {
  const { 
    campsites, 
    currentView, 
    setView, 
    userMode, 
    toggleUserMode, 
    switchUserRole,
    promoDaysRemaining, 
    bookings, 
    currentUser, 
    usersList, 
    setCurrentUser, 
    openAuthModal,
    openChangePasswordModal,
    logoutUser,
    t 
  } = useCampsites();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const pendingCampsitesCount = campsites.filter(c => c.status === 'pending').length;

  const handleAddCampsiteClick = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (currentUser.userType === 'client' && !currentUser.isAdmin) {
      switchUserRole('host');
    }
    setView('add-listing');
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            onClick={() => setView('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Tent className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-emerald-900">
                  Campy<span className="text-emerald-500">.lt</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-emerald-950">
                  {t('launchTag')}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 hidden sm:block">
                {t('brandSub')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 font-semibold text-sm">
            <button
              id="nav-explore"
              onClick={() => setView('landing')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                currentView === 'landing' 
                  ? 'bg-emerald-50 text-emerald-800 font-bold' 
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              {t('explore')}
            </button>

            <button
              id="nav-search"
              onClick={() => setView('search')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                currentView === 'search' 
                  ? 'bg-emerald-50 text-emerald-800 font-bold' 
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600" />
              {t('search')}
            </button>

            {/* Pridėti Stovyklavietę - Main Menu Navigation Button */}
            <button
              id="nav-add-campsite"
              onClick={handleAddCampsiteClick}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                currentView === 'add-listing' 
                  ? 'bg-amber-400 text-amber-950 font-black shadow-xs' 
                  : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200/80'
              }`}
              title="Pridėti naują stovyklavietę ir įtraukti šeimininką į sistemą"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Pridėti Stovyklavietę</span>
            </button>

            {/* Client Dashboard Buttons - ONLY for Logged-In Travelers */}
            {currentUser && currentUser.userType === 'client' && !currentUser.isAdmin && (
              <>
                <button
                  id="nav-trips"
                  onClick={() => setView('my-trips')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all relative ${
                    currentView === 'my-trips' 
                      ? 'bg-emerald-50 text-emerald-800 font-bold' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  {t('myTrips')}
                  {bookings.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-600 text-white rounded-full font-bold">
                      {bookings.length}
                    </span>
                  )}
                </button>

                <button
                  id="nav-client-dashboard"
                  onClick={() => setView('client-dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all relative ${
                    currentView === 'client-dashboard' 
                      ? 'bg-emerald-600 text-white font-black shadow-sm' 
                      : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Keliautojo Skydelis</span>
                </button>
              </>
            )}

            {/* Host Dashboard & Requests Buttons - ONLY for Logged-In Hosts */}
            {currentUser && currentUser.userType === 'host' && !currentUser.isAdmin && (
              <>
                <button
                  id="nav-dashboard"
                  onClick={() => setView('host-dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all relative ${
                    currentView === 'host-dashboard' 
                      ? 'bg-emerald-800 text-white font-bold' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Šeimininko Skydas</span>
                </button>

                <button
                  id="nav-requests"
                  onClick={() => setView('pending-requests')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all relative ${
                    currentView === 'pending-requests' 
                      ? 'bg-amber-100 text-amber-950 font-bold' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Užklausos</span>
                  {pendingBookingsCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold shadow-xs">
                      {pendingBookingsCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Admin Panel button - ONLY for Logged-In Admins */}
            {currentUser && currentUser.isAdmin && (
              <button
                id="nav-admin"
                onClick={() => setView('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all relative ${
                  currentView === 'admin' 
                    ? 'bg-emerald-950 text-white font-extrabold shadow-sm' 
                    : 'text-gray-800 hover:text-emerald-900 hover:bg-gray-100 bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin Panelė</span>
                {pendingCampsitesCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-emerald-950 rounded-full font-black animate-pulse">
                    {pendingCampsitesCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Direct 'Become a Host' CTA for Logged-In Travelers */}
            {currentUser && currentUser.userType === 'client' && !currentUser.isAdmin && (
              <button
                id="cta-become-host-btn"
                onClick={() => {
                  switchUserRole('host');
                  setView('add-listing');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-black shadow-sm transition-all cursor-pointer"
                title="Perjungti į Šeimininko paskyrą ir registruoti sklypą"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>🏡 Tapti Šeimininku</span>
              </button>
            )}

            {/* Add Listing Button for Logged-In Hosts & Admins */}
            {currentUser && (currentUser.userType === 'host' || currentUser.isAdmin) && (
              <button
                id="cta-add-listing"
                onClick={() => setView('add-listing')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Pridėti Skelbimą</span>
                <span className="sm:hidden">+ Skelbimas</span>
              </button>
            )}

            {/* Quick Login / Sign Up Button or Direct Unlogin Button */}
            {!currentUser ? (
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Prisijungti</span>
              </button>
            ) : (
              <button
                onClick={() => logoutUser()}
                className="px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                title="Atsijungti iš esamos paskyros"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-700" />
                <span className="hidden xl:inline">Atsijungti</span>
              </button>
            )}

            {/* User Profile Selector Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser?.name || 'User'}
                  className={`w-7 h-7 rounded-full object-cover border ${currentUser ? 'border-emerald-500' : 'border-gray-300 opacity-60'}`}
                />
                <div className="text-left hidden lg:block leading-tight">
                  <span className="text-xs font-bold text-gray-900 block truncate max-w-[110px]">
                    {currentUser?.name || 'Atsijungęs (Svečias)'}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-700 block">
                    {currentUser ? (currentUser.isAdmin ? '👑 Platform Admin' : currentUser.userType === 'host' ? '🏡 Šeimininkas' : '⛺ Keliautojas') : 'Svečio režimas'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-150 p-2 z-50 space-y-1 font-sans animate-in fade-in duration-150">
                  {/* Current Active User Banner & Unlogin */}
                  {currentUser ? (
                    <div className="p-3 bg-stone-900 text-white rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-400" />
                          <div className="truncate">
                            <p className="text-xs font-bold truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-stone-300 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logoutUser();
                          setShowUserDropdown(false);
                        }}
                        className="w-full mt-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Atsijungti iš Paskyros (Unlogin)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl space-y-2 text-center">
                      <p className="text-xs font-bold">Esate atsijungę (Svečio režimas)</p>
                      <button
                        onClick={() => {
                          openAuthModal('login');
                          setShowUserDropdown(false);
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        🔑 Prisijungti prie paskyros
                      </button>
                    </div>
                  )}

                  {/* Action to Become a Host or Switch Roles */}
                  {currentUser && (
                    <div className="p-2.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-xl space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                        Paskyros Valdymas & Rolė
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            switchUserRole('host');
                            setView('host-dashboard');
                            setShowUserDropdown(false);
                          }}
                          className={`p-2 rounded-lg text-[11px] font-bold text-left transition flex items-center gap-1.5 cursor-pointer ${
                            currentUser?.userType === 'host' 
                              ? 'bg-amber-500 text-gray-950 font-black shadow-xs' 
                              : 'bg-white hover:bg-amber-100 text-gray-800 border border-amber-200'
                          }`}
                        >
                          <span className="text-sm">🏡</span>
                          <span>Tapti Šeimininku</span>
                        </button>

                        <button
                          onClick={() => {
                            switchUserRole('client');
                            setView('client-dashboard');
                            setShowUserDropdown(false);
                          }}
                          className={`p-2 rounded-lg text-[11px] font-bold text-left transition flex items-center gap-1.5 cursor-pointer ${
                            currentUser?.userType === 'client' 
                              ? 'bg-emerald-600 text-white font-black shadow-xs' 
                              : 'bg-white hover:bg-emerald-100 text-gray-800 border border-emerald-200'
                          }`}
                        >
                          <span className="text-sm">⛺</span>
                          <span>Keliautojas</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perjungti Vartotoją (Testavimas)</p>
                  </div>
                  {usersList.map((usr) => (
                    <button
                      key={usr.id}
                      onClick={() => {
                        setCurrentUser(usr);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentUser?.id === usr.id ? 'bg-emerald-50 text-emerald-950 font-extrabold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={usr.avatar} alt={usr.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <span className="block truncate font-bold">{usr.name}</span>
                          <span className="text-[9px] text-gray-400 block truncate">
                            {usr.isAdmin ? '👑 Admin' : usr.userType === 'host' ? '🏡 Šeimininkas' : '⛺ Keliautojas'}
                          </span>
                        </div>
                      </div>
                      {currentUser?.id === usr.id && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}

                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    {currentUser && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          openChangePasswordModal(false);
                        }}
                        className="w-full text-left px-3 py-2 text-amber-900 bg-amber-50 hover:bg-amber-100 font-extrabold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer border border-amber-200"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>🔑 Keisti Slaptažodį (Pop-Up)</span>
                      </button>
                    )}

                    {currentUser && !currentUser.isEmailVerified && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          openAuthModal('verify-email');
                        }}
                        className="w-full text-left px-3 py-2 text-rose-900 bg-rose-50 hover:bg-rose-100 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer border border-rose-200"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>✉️ Patvirtinti El. Paštą (Kodu)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        openAuthModal('login');
                      }}
                      className="w-full text-left px-3 py-2 text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>🔑 Prisijungti su el. paštu ir slaptažodžiu</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        openAuthModal('register');
                      }}
                      className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>✨ Naujo Vartotojo Registracija</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        openAuthModal('forgot-password');
                      }}
                      className="w-full text-left px-3 py-2 text-amber-800 hover:bg-amber-50 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>🔓 Pamiršau Slaptažodį / El. Paštą</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mode Switcher */}
            <button
              id="toggle-user-mode"
              onClick={toggleUserMode}
              className="p-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={userMode === 'guest' ? 'Perjungti į Šeimininko režimą' : 'Perjungti į Svečio režimą'}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline capitalize">{userMode === 'guest' ? t('guest') : t('host')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-gray-100 bg-white px-3 py-2 flex items-center justify-around text-xs font-bold">
        <button
          onClick={() => setView('landing')}
          className={`flex flex-col items-center gap-1 ${currentView === 'landing' ? 'text-emerald-700 font-extrabold' : 'text-gray-500'}`}
        >
          <Compass className="w-4 h-4" />
          <span>{t('explore')}</span>
        </button>
        <button
          onClick={() => setView('search')}
          className={`flex flex-col items-center gap-1 ${currentView === 'search' ? 'text-emerald-700 font-extrabold' : 'text-gray-500'}`}
        >
          <Search className="w-4 h-4" />
          <span>{t('search')}</span>
        </button>

        <button
          onClick={handleAddCampsiteClick}
          className={`flex flex-col items-center gap-1 ${currentView === 'add-listing' ? 'text-emerald-700 font-extrabold' : 'text-emerald-800'}`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>+ Skelbti</span>
        </button>

        {/* Traveler Dashboard on Mobile (ONLY for Clients) */}
        {currentUser && currentUser.userType === 'client' && !currentUser.isAdmin && (
          <button
            onClick={() => setView('client-dashboard')}
            className={`flex flex-col items-center gap-1 ${currentView === 'client-dashboard' || currentView === 'my-trips' ? 'text-emerald-700 font-extrabold' : 'text-gray-500'}`}
          >
            <Compass className="w-4 h-4" />
            <span>Skydelis</span>
          </button>
        )}

        {/* Host Dashboard on Mobile (ONLY for Hosts) */}
        {currentUser && currentUser.userType === 'host' && !currentUser.isAdmin && (
          <>
            <button
              onClick={() => setView('pending-requests')}
              className={`flex flex-col items-center gap-1 relative ${currentView === 'pending-requests' ? 'text-amber-700 font-extrabold' : 'text-gray-500'}`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('pendingRequests')}</span>
              {pendingBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setView('host-dashboard')}
              className={`flex flex-col items-center gap-1 ${currentView === 'host-dashboard' ? 'text-emerald-700 font-extrabold' : 'text-gray-500'}`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Šeimininkas</span>
            </button>
          </>
        )}

        {/* Admin Dashboard on Mobile (ONLY for Admins) */}
        {currentUser && currentUser.isAdmin && (
          <button
            onClick={() => setView('admin')}
            className={`flex flex-col items-center gap-1 relative ${currentView === 'admin' ? 'text-emerald-950 font-black' : 'text-gray-700'}`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Admin</span>
            {pendingCampsitesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

