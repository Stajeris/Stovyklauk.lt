import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campsite, Booking, SearchFilters, ViewState, PropertyType, Review, UserProfile, ChatThread, ChatMessage, HostTier, Pitch, SeasonalPriceRule, CheckInInstructions, AutomatedEmailLog } from '../types';
import { INITIAL_CAMPSITES, INITIAL_BOOKINGS } from '../data/mockCampsites';
import { INITIAL_CHAT_THREADS } from '../data/mockChats';
import { translations, Language } from '../data/translations';
import { calculateFullPricing } from '../utils/pricing';
import { generateSystemEmail, sendSystemEmailViaApi, SystemEmailType, EmailPayload } from '../utils/emailSystem';

export const INITIAL_USERS: UserProfile[] = [
  // 1 Platform Admin
  {
    id: 'admin-1',
    name: 'Giedrius Štajeris',
    email: 'admin@campy.lt',
    password: 'admin123',
    phone: '+370 600 00000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Platformos vyriausiasis administratorius ir Campy.lt įkūrėjas.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'admin',
    isAdmin: true,
    isSuperhost: true,
    isEmailVerified: true
  },
  // 8 Hosts in Lithuania
  {
    id: 'host-1',
    name: 'Jonas Kazlauskas',
    email: 'jonas.kazlauskas@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 611 12345',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Aukštaitijos ežerų ir miškų puoselėtojas. Siūlau privačias stovyklavietes Asvejos ir Lūšių pakrantėse.',
    joinedDate: 'Sausis 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: true,
    isEmailVerified: true
  },
  {
    id: 'host-2',
    name: 'Eglė Petrauskienė',
    email: 'egle.petrauskiene@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 622 23456',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Architektė ir glamping sodybos įkūrėja Zarasų krašte prie ežero.',
    joinedDate: 'Vasaris 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: true,
    isEmailVerified: true
  },
  {
    id: 'host-3',
    name: 'Gintaras Marcinkevičius',
    email: 'gintaras.m@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 633 34567',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    bio: 'Varėnos r. Marcinkonių kemperių ir palapinių aikštelės šeimininkas.',
    joinedDate: 'Kovas 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'host-4',
    name: 'Lina Jonaitienė',
    email: 'lina.jonaitiene@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 644 45678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Platelių ežero ir Žemaitijos nacionalinio parko privačių sklypų puoselėtoja.',
    joinedDate: 'Balandis 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: true,
    isEmailVerified: true
  },
  {
    id: 'host-5',
    name: 'Darius Stankevičius',
    email: 'darius.stankevicius@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 655 56789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Aukštaitijos gamtos entuziastas, siūlantis laukines stovyklavietes prie Šventosios upės.',
    joinedDate: 'Gegužė 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'host-6',
    name: 'Dovilė Vasiliauskienė',
    email: 'dovile.vasiliauskiene@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 666 67890',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    bio: 'Neringos ir Juodkrantės pajūrio oazės bei kemperių stovėjimo vietų šeimininkė.',
    joinedDate: 'Birželis 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: true,
    isEmailVerified: true
  },
  {
    id: 'host-7',
    name: 'Andrius Žukauskas',
    email: 'andrius.zukauskas@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 677 78901',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    bio: 'Birštono ir Nemuno kilpų regioninio parko sodybos bei pirties šeimininkas.',
    joinedDate: 'Liepa 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'host-8',
    name: 'Rūta Balčiūnaitė',
    email: 'ruta.balciunaite@campy.lt',
    password: 'slaptazodis123',
    phone: '+370 688 89012',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Neries regioninio parko stovyklaviečių ir miško kupolų puoselėtoja.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'host',
    isAdmin: false,
    isSuperhost: true,
    isEmailVerified: true
  },
  // 15 Demo Users (Clients / Travelers)
  {
    id: 'user-1',
    name: 'Lukas Navickas',
    email: 'lukas.navickas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11001',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Aktyvaus poilsio ir žygių pėsčiomis mėgėjas iš Vilniaus.',
    joinedDate: 'Liepa 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-2',
    name: 'Gabija Ramanauskaitė',
    email: 'gabija.ramanauskaite@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11002',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Fotografė, keliaujanti su šunimi po gražiausius Lietuvos kampelius.',
    joinedDate: 'Birželis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-3',
    name: 'Tomas Paulauskas',
    email: 'tomas.paulauskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Baidarininkas ir žvejys, mėgstantis savaitgalius leisti prie ežerų.',
    joinedDate: 'Gegužė 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-4',
    name: 'Ieva Urbonaitė',
    email: 'ieva.urbonaite@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11004',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Jogos instruktorė, ieškanti ramių glamping vietų gamtoje.',
    joinedDate: 'Liepa 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-5',
    name: 'Rokas Kavaliauskas',
    email: 'rokas.kavaliauskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11005',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    bio: 'Kemperio entuziastas, vasarą apkeliaujantis visą Lietuvos pajūrį.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-6',
    name: 'Kotryna Šimkutė',
    email: 'kotryna.simkute@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11006',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    bio: 'Kelionių tinklaraštininkė, rašanti apie poilsį Lietuvos miškuose.',
    joinedDate: 'Balandis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-7',
    name: 'Mantas Klimas',
    email: 'mantas.klimas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11007',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    bio: 'Dviračių žygių organizatorius iš Kauno.',
    joinedDate: 'Birželis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-8',
    name: 'Austėja Vaitkutė',
    email: 'austeja.vaitkute@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11008',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Dizainerė, mėgstanti glamping namelius su kubilu.',
    joinedDate: 'Liepa 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-9',
    name: 'Dominykas Žilinskas',
    email: 'dominykas.zilinskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11009',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Aitvaravimo ir vandens sporto mėgėjas iš Klaipėdos.',
    joinedDate: 'Gegužė 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-10',
    name: 'Viktė Mikalauskaitė',
    email: 'vikte.mikalauskaite@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11010',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Irklenčių entuziastė, ieškanti skaidrių ežerų Aukštaitijoje.',
    joinedDate: 'Liepa 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-11',
    name: 'Paulius Rutkauskas',
    email: 'paulius.rutkauskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11011',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Mėgsta stovyklavimą su palapinėmis ir laužo patiekalų gamybą.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-12',
    name: 'Kamilė Norkutė',
    email: 'kamile.norkute@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11012',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Gamtos mylėtoja ir botanikė iš Šiaulių.',
    joinedDate: 'Birželis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-13',
    name: 'Karolis Lapinskas',
    email: 'karolis.lapinskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11013',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    bio: 'Orientavimosi sporto ir bekelės žygių entuziastas.',
    joinedDate: 'Gegužė 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-14',
    name: 'Agnė Gutauskaitė',
    email: 'agne.gutauskaite@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11014',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    bio: 'Keliautoja su šeima ir dviem vaikais po Lietuvos parkus.',
    joinedDate: 'Liepa 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  },
  {
    id: 'user-15',
    name: 'Ignas Baranauskas',
    email: 'ignas.baranauskas@gmail.com',
    password: 'slaptazodis123',
    phone: '+370 601 11015',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    bio: 'Astronomijos mėgėjas, stebintis žvaigždes toli nuo miestų šviesų.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'client',
    isAdmin: false,
    isSuperhost: false,
    isEmailVerified: true
  }
];

interface CampsiteContextType {
  campsites: Campsite[];
  bookings: Booking[];
  currentView: ViewState;
  selectedCampsite: Campsite | null;
  searchFilters: SearchFilters;
  userMode: 'guest' | 'host';
  favorites: string[];
  promoDaysRemaining: number;
  language: Language;

  // User & Host Management
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  setCurrentUser: (user: UserProfile | null) => void;
  registerHostAndAddCampsite: (
    hostData: { name: string; email: string; phone?: string; avatar?: string; bio?: string },
    campsiteData: Omit<Campsite, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'blockedDates' | 'host'>
  ) => Campsite;

  // Auth & Password Change System
  isAuthModalOpen: boolean;
  authModalInitialMode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email';
  openAuthModal: (mode?: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email') => void;
  closeAuthModal: () => void;
  isChangePasswordModalOpen: boolean;
  isFirstLoginChangePrompt: boolean;
  openChangePasswordModal: (isFirstLoginPrompt?: boolean) => void;
  closeChangePasswordModal: () => void;
  changeUserPassword: (userId: string, newPassword: string) => { success: boolean; message?: string };
  loginUser: (email: string, password?: string) => { success: boolean; reason?: 'user_not_found' | 'invalid_password'; user?: UserProfile };
  registerUser: (userData: { name: string; email: string; password?: string; phone?: string; avatar?: string; userType?: 'client' | 'host' }) => { user: UserProfile; verificationCode: string };
  switchUserRole: (newRole: 'client' | 'host' | 'admin') => void;
  updateUserRoleInList: (userId: string, newRole: 'client' | 'host' | 'admin') => void;
  updateUserProfileByAdmin: (userId: string, updatedData: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  verifyUserEmail: (userId: string) => void;
  requestPasswordResetCode: (email: string) => { success: boolean; code?: string; message?: string; userId?: string };
  resetUserPassword: (email: string, newPassword: string) => { success: boolean };
  recoverEmailByNameOrPhone: (query: string) => UserProfile[];
  logoutUser: () => void;

  // Chat Management
  chatThreads: ChatThread[];
  sendMessageInThread: (
    campsiteId: string, 
    sender: { id: string; name: string; avatar?: string; role: 'client' | 'host' | 'admin'; email?: string }, 
    text: string, 
    campsiteTitle?: string, 
    hostInfo?: { id: string; name: string; avatar?: string },
    campsiteImage?: string
  ) => ChatMessage;
  replyToThread: (
    threadId: string, 
    sender: { id: string; name: string; avatar?: string; role: 'client' | 'host' | 'admin' }, 
    text: string
  ) => void;
  getChatThreadsForCampsite: (campsiteId: string) => ChatThread[];
  getChatThreadsForHost: (hostId: string) => ChatThread[];
  
  confirmVisitStart: (bookingId: string) => void;
  verifyHostPhoneOrEmail: (type: 'phone' | 'email', value: string) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  
  // Actions
  setView: (view: ViewState, campsiteId?: string) => void;
  selectCampsiteById: (id: string) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  addCampsite: (newCamp: Omit<Campsite, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'blockedDates'>) => void;
  updateCampsite: (id: string, updatedData: Partial<Campsite>) => void;
  deleteCampsite: (id: string) => void;
  approveCampsite: (id: string) => void;
  rejectCampsite: (id: string) => void;
  updateCampsiteStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => void;
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking;
  updateBookingStatus: (bookingId: string, newStatus: 'approved' | 'rejected' | 'completed') => void;
  releaseEscrowPayout: (bookingId: string) => void;
  addReview: (campsiteId: string, bookingId: string, rating: number, comment: string, authorName?: string) => void;
  disputeReview: (campsiteId: string, reviewId: string, category: 'profanity' | 'hate_speech' | 'no_show' | 'other_violation', reason: string) => void;
  resolveReviewDispute: (campsiteId: string, reviewId: string, decision: 'dismiss' | 'remove') => void;
  toggleUserMode: () => void;
  toggleFavorite: (campsiteId: string) => void;
  isDateBlocked: (campsiteId: string, dateStr: string) => boolean;
  hostTier: HostTier;
  setHostTier: (tier: HostTier) => void;
  updateHostTier: (hostId: string, newTier: HostTier) => void;
  // Pro Features: Pitches, iCal, Seasonal Rules, Email Automation
  emailLogs: AutomatedEmailLog[];
  addPitch: (campsiteId: string, pitch: Omit<Pitch, 'id' | 'campsiteId'>) => void;
  updatePitch: (campsiteId: string, pitchId: string, updates: Partial<Pitch>) => void;
  deletePitch: (campsiteId: string, pitchId: string) => void;
  addSeasonalRule: (campsiteId: string, rule: Omit<SeasonalPriceRule, 'id' | 'campsiteId'>) => void;
  deleteSeasonalRule: (campsiteId: string, ruleId: string) => void;
  syncICalFeeds: (campsiteId: string, pitchId?: string) => { syncedEventsCount: number; lastSyncedAt: string };
  updateCheckInInstructions: (campsiteId: string, instructions: CheckInInstructions) => void;
  sendAutomatedEmail: (booking: Booking, type: 'confirmation_checkin' | 'new_reservation_request') => AutomatedEmailLog;
  dispatchSystemEmail: (type: SystemEmailType, payload: EmailPayload) => AutomatedEmailLog;

  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['lt'], params?: Record<string, string | number>) => string;
}

const DEFAULT_FILTERS: SearchFilters = {
  location: '',
  propertyType: 'all',
  checkIn: '',
  checkOut: '',
  guests: 1,
  maxPrice: 200,
  petFriendly: false,
  electricity: false,
  nearWater: false,
  firePit: false,
};

const CampsiteContext = createContext<CampsiteContextType | undefined>(undefined);

export const CampsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campsites, setCampsites] = useState<Campsite[]>(() => {
    const local = localStorage.getItem('campscape_campsites');
    return local ? JSON.parse(local) : INITIAL_CAMPSITES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const local = localStorage.getItem('campscape_bookings');
    return local ? JSON.parse(local) : INITIAL_BOOKINGS;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const DATASET_VER = 'v4_seimininkas_keliautojas_badges';
    const savedVer = localStorage.getItem('campscape_users_ver');
    const local = localStorage.getItem('campscape_users');
    if (savedVer !== DATASET_VER || !local) {
      localStorage.setItem('campscape_users_ver', DATASET_VER);
      localStorage.setItem('campscape_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(local);
  });

  const [currentUser, setCurrentUserRaw] = useState<UserProfile | null>(() => {
    const local = localStorage.getItem('campscape_current_user');
    if (!local) return INITIAL_USERS[0]; // Default to initial admin on first load
    if (local === 'null') return null;
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  });

  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserRaw(user);
    if (user) {
      localStorage.setItem('campscape_current_user', JSON.stringify(user));
    } else {
      localStorage.setItem('campscape_current_user', 'null');
    }
  };

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const local = localStorage.getItem('stovyklauk_chat_threads');
    return local ? JSON.parse(local) : INITIAL_CHAT_THREADS;
  });

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedCampsite, setSelectedCampsite] = useState<Campsite | null>(INITIAL_CAMPSITES[0]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [userMode, setUserMode] = useState<'guest' | 'host'>('guest');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hostTier, setHostTierState] = useState<HostTier>('pro');

  const [emailLogs, setEmailLogs] = useState<AutomatedEmailLog[]>(() => {
    const local = localStorage.getItem('campy_email_logs');
    if (local) return JSON.parse(local);
    return [
      {
        id: 'email-init-1',
        campsiteId: 'camp-1',
        campsiteTitle: 'Asvejos Pakrantės Stovyklavietė',
        bookingId: 'bk-101',
        type: 'confirmation_checkin',
        recipientEmail: 'gabija.ramanauskaite@gmail.com',
        recipientName: 'Gabija Ramanauskaitė',
        subject: '✅ Rezervacija Patvirtinta! Atsvykimo informacija ir GPS kodo duomenys — Asvejos Pakrantės Stovyklavietė',
        sentAt: '2026-08-10 14:32',
        status: 'sent',
        contentPreview: 'Sveikiname! Jūsų viešnagė Asvejos Pakrantėje patvirtinta. Vartų spynos kodas: 4829. GPS koordinatės: 55.05812, 25.45231.',
        pitchName: 'Vieta A - Ant ežero kranto (su elektra)',
        checkInInstructions: {
          gpsCoordinates: '55.05812, 25.45231',
          gateCode: '4829',
          houseRules: 'Tylos valandos nuo 22:00. Laužus kūrenti tik tam skirtoje laužavietėje.',
          wifiName: 'Asveja_Camp_Guest',
          wifiPassword: 'stovyklaujamegamtose'
        }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('campy_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  const dispatchSystemEmail = (type: SystemEmailType, payload: EmailPayload): AutomatedEmailLog => {
    const generated = generateSystemEmail(type, payload);
    const nowStr = new Date().toLocaleDateString('lt-LT') + ' ' + new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });

    const newLog: AutomatedEmailLog = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      campsiteId: payload.campsite?.id || payload.booking?.campsiteId,
      campsiteTitle: payload.campsite?.title || payload.booking?.campsiteTitle,
      bookingId: payload.booking?.id,
      type: type as any,
      recipientEmail: generated.recipientEmail,
      recipientName: generated.recipientName,
      subject: generated.subject,
      sentAt: nowStr,
      status: 'sent',
      contentPreview: generated.contentPreview,
      htmlBody: generated.htmlBody,
      pitchName: payload.booking?.pitchName,
      checkInInstructions: payload.campsite?.checkInInstructions
    };

    setEmailLogs(prev => [newLog, ...prev]);

    // Asynchronously dispatch real email via Express API (Resend or Supabase SMTP)
    sendSystemEmailViaApi(type, payload).then(result => {
      if (result.success) {
        console.log(`✅ El. laiškas išsiųstas gavėjui ${generated.recipientEmail} (${type})`);
      } else {
        console.warn(`⚠️ El. pašto siuntimo pranešimas:`, result);
      }
    });

    return newLog;
  };

  const sendAutomatedEmail = (booking: Booking, type: 'confirmation_checkin' | 'new_reservation_request'): AutomatedEmailLog => {
    const camp = campsites.find(c => c.id === booking.campsiteId);
    const mappedType: SystemEmailType = type === 'confirmation_checkin' ? 'reservation_confirmed' : 'new_reservation_request_host';
    return dispatchSystemEmail(mappedType, { booking, campsite: camp });
  };

  const addPitch = (campsiteId: string, pitchData: Omit<Pitch, 'id' | 'campsiteId'>) => {
    const newPitch: Pitch = {
      ...pitchData,
      id: `pitch-${Date.now()}`,
      campsiteId,
      blockedDates: pitchData.blockedDates || [],
      status: 'active'
    };

    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        return {
          ...c,
          pitches: [...(c.pitches || []), newPitch]
        };
      }
      return c;
    }));
  };

  const updatePitch = (campsiteId: string, pitchId: string, updates: Partial<Pitch>) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId && c.pitches) {
        return {
          ...c,
          pitches: c.pitches.map(p => p.id === pitchId ? { ...p, ...updates } : p)
        };
      }
      return c;
    }));
  };

  const deletePitch = (campsiteId: string, pitchId: string) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId && c.pitches) {
        return {
          ...c,
          pitches: c.pitches.filter(p => p.id !== pitchId)
        };
      }
      return c;
    }));
  };

  const addSeasonalRule = (campsiteId: string, ruleData: Omit<SeasonalPriceRule, 'id' | 'campsiteId'>) => {
    const newRule: SeasonalPriceRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      campsiteId
    };

    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        return {
          ...c,
          seasonalRules: [...(c.seasonalRules || []), newRule]
        };
      }
      return c;
    }));
  };

  const deleteSeasonalRule = (campsiteId: string, ruleId: string) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId && c.seasonalRules) {
        return {
          ...c,
          seasonalRules: c.seasonalRules.filter(r => r.id !== ruleId)
        };
      }
      return c;
    }));
  };

  const syncICalFeeds = (campsiteId: string, pitchId?: string) => {
    const nowStr = new Date().toLocaleDateString('lt-LT') + ' ' + new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
    const simulatedExternalBlockedDates = ['2026-08-28', '2026-08-29', '2026-08-30'];

    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        const updatedBlocked = Array.from(new Set([...c.blockedDates, ...simulatedExternalBlockedDates]));
        
        let updatedPitches = c.pitches;
        if (pitchId && c.pitches) {
          updatedPitches = c.pitches.map(p => {
            if (p.id === pitchId) {
              return {
                ...p,
                blockedDates: Array.from(new Set([...(p.blockedDates || []), ...simulatedExternalBlockedDates]))
              };
            }
            return p;
          });
        }

        return {
          ...c,
          blockedDates: updatedBlocked,
          pitches: updatedPitches,
          icalSyncUrls: (c.icalSyncUrls || [
            { id: 'feed-1', name: 'Airbnb Sync', url: 'https://www.airbnb.com/calendar/ical/12345.ics', lastSynced: nowStr, itemCount: 4 }
          ]).map(feed => ({
            ...feed,
            lastSynced: nowStr,
            itemCount: (feed.itemCount || 3) + 1
          }))
        };
      }
      return c;
    }));

    return { syncedEventsCount: simulatedExternalBlockedDates.length, lastSyncedAt: nowStr };
  };

  const updateCheckInInstructions = (campsiteId: string, instructions: CheckInInstructions) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        return {
          ...c,
          checkInInstructions: {
            ...c.checkInInstructions,
            ...instructions
          }
        };
      }
      return c;
    }));
  };

  const updateHostTier = (hostId: string, newTier: HostTier) => {
    // Update usersList
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (
          u.id === hostId || 
          u.email.toLowerCase() === hostId.toLowerCase() || 
          u.name.toLowerCase() === hostId.toLowerCase()
        ) {
          return { ...u, hostTier: newTier };
        }
        return u;
      });
      localStorage.setItem('campscape_users', JSON.stringify(updated));
      return updated;
    });

    // Update currentUser if matched
    if (currentUser && (currentUser.id === hostId || currentUser.email.toLowerCase() === hostId.toLowerCase() || currentUser.name.toLowerCase() === hostId.toLowerCase())) {
      setCurrentUser({ ...currentUser, hostTier: newTier });
    }

    // Update campsites
    setCampsites(prev => {
      const updated = prev.map(c => {
        if (
          c.host.id === hostId || 
          c.host.name?.toLowerCase() === hostId.toLowerCase() || 
          c.host.email?.toLowerCase() === hostId.toLowerCase() ||
          (c.host as any).id === hostId
        ) {
          return {
            ...c,
            isPro: newTier === 'pro',
            tier: newTier,
            host: {
              ...c.host,
              tier: newTier
            }
          };
        }
        return c;
      });
      localStorage.setItem('campscape_campsites', JSON.stringify(updated));
      return updated;
    });
  };

  const setHostTier = (tier: HostTier) => {
    setHostTierState(tier);
    if (currentUser) {
      updateHostTier(currentUser.id, tier);
    } else {
      updateHostTier('host-1', tier);
    }
  };

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('stovyklauk_lang') as Language;
    return saved === 'en' ? 'en' : 'lt';
  });
  const promoDaysRemaining = 142; // "0% host commission for first 6 months" promotion remaining days

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('campscape_campsites', JSON.stringify(campsites));
  }, [campsites]);

  useEffect(() => {
    localStorage.setItem('campscape_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('campscape_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('campscape_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('stovyklauk_chat_threads', JSON.stringify(chatThreads));
  }, [chatThreads]);

  useEffect(() => {
    localStorage.setItem('stovyklauk_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'lt' ? 'en' : 'lt'));
  };

  const t = (key: keyof typeof translations['lt'], params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.lt;
    let text = langDict[key] || translations.lt[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return text;
  };

  const setView = (view: ViewState, campsiteId?: string) => {
    if (campsiteId) {
      const found = campsites.find(c => c.id === campsiteId);
      if (found) setSelectedCampsite(found);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectCampsiteById = (id: string) => {
    const found = campsites.find(c => c.id === id);
    if (found) {
      setSelectedCampsite(found);
      setCurrentView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const resetFilters = () => {
    setSearchFilters(DEFAULT_FILTERS);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const toggleUserMode = () => {
    setUserMode(prev => (prev === 'guest' ? 'host' : 'guest'));
  };

  const isDateBlocked = (campsiteId: string, dateStr: string): boolean => {
    const camp = campsites.find(c => c.id === campsiteId);
    if (!camp) return false;
    
    // Check static blocked dates
    if (camp.blockedDates?.includes(dateStr)) return true;

    // Check imported iCal events
    if (camp.importedEvents?.some(e => dateStr >= e.startDate && dateStr <= e.endDate)) {
      return true;
    }

    // Check approved or pending bookings
    return bookings.some(b => {
      if (b.campsiteId !== campsiteId) return false;
      if (b.status === 'rejected') return false;
      return dateStr >= b.checkIn && dateStr <= b.checkOut;
    });
  };

  const addCampsite = (newCampData: Omit<Campsite, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'blockedDates'>) => {
    const id = `camp-${Date.now()}`;
    const fullCamp: Campsite = {
      ...newCampData,
      id,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      blockedDates: [],
      status: newCampData.status || 'pending', // Default to pending approval
    };

    setCampsites(prev => [fullCamp, ...prev]);
    setSelectedCampsite(fullCamp);
  };

  const confirmVisitStart = (bookingId: string) => {
    const nowIso = new Date().toISOString();
    const releaseIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          visitConfirmedByGuest: true,
          visitConfirmedAt: nowIso,
          escrowPayoutReleaseAt: releaseIso,
          stripePaymentStatus: 'succeeded_escrow_held',
          escrowStatus: 'held_in_escrow'
        };
      }
      return b;
    }));
  };

  const verifyHostPhoneOrEmail = (type: 'phone' | 'email', value: string) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      ...(type === 'phone' 
        ? { isPhoneVerified: true, verifiedPhone: value, phone: value } 
        : { isEmailVerified: true, verifiedEmail: value, email: value })
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // Automatically approve all campsites for this verified host
    setCampsites(prev => prev.map(c => {
      if (
        c.host.id === updatedUser.id || 
        c.host.name?.toLowerCase() === updatedUser.name?.toLowerCase() || 
        (c.host as any).email?.toLowerCase() === updatedUser.email?.toLowerCase()
      ) {
        return {
          ...c,
          status: 'approved',
          host: {
            ...c.host,
            isPhoneVerified: type === 'phone' ? true : c.host.isPhoneVerified,
            isEmailVerified: type === 'email' ? true : c.host.isEmailVerified
          }
        };
      }
      return c;
    }));
  };

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email'>('login');

  // Change Password Pop-Up Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isFirstLoginChangePrompt, setIsFirstLoginChangePrompt] = useState(false);

  const openAuthModal = (mode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openChangePasswordModal = (isFirstLoginPrompt = false) => {
    setIsFirstLoginChangePrompt(isFirstLoginPrompt);
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setIsFirstLoginChangePrompt(false);
  };

  const changeUserPassword = (userId: string, newPassword: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          password: newPassword,
          primaryPassword: undefined,
          mustChangePassword: false,
          isFirstLogin: false
        };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      const updatedUser: UserProfile = {
        ...currentUser,
        password: newPassword,
        primaryPassword: undefined,
        mustChangePassword: false,
        isFirstLogin: false
      };
      setCurrentUser(updatedUser);
    }

    return { success: true };
  };

  const loginUser = (email: string, password?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = usersList.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, reason: 'user_not_found' as const };
    }

    const entered = password ? password.trim() : '';
    const isPassValid = (found.password && found.password === entered) || (found.primaryPassword && found.primaryPassword === entered);
    
    if (found.password && entered && !isPassValid) {
      return { success: false, reason: 'invalid_password' as const };
    }

    setCurrentUser(found);

    // If logging in with primary password or mustChangePassword flag is true, trigger password change pop-up
    if (found.mustChangePassword || (found.primaryPassword && found.password === found.primaryPassword)) {
      setTimeout(() => {
        openChangePasswordModal(true);
      }, 350);
    }

    return { success: true, user: found };
  };

  const registerUser = (userData: { name: string; email: string; password?: string; phone?: string; avatar?: string; userType?: 'client' | 'host' }) => {
    const existing = usersList.find(u => u.email.trim().toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      const verificationCode = '4829';
      setCurrentUser(existing);
      return { user: existing, verificationCode };
    }

    const assignedType = userData.userType || 'client';
    const primaryPass = userData.password || `CAMPY-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Naujas Vartotojas',
      email: userData.email,
      password: primaryPass,
      primaryPassword: primaryPass,
      phone: userData.phone || '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: assignedType === 'host' ? 'Stovyklavietės ir sodybos šeimininkas' : 'Stovyklautojas ir žygeivis',
      joinedDate: 'Rugpjūtis 2026',
      userType: assignedType,
      isAdmin: false,
      isSuperhost: false,
      isEmailVerified: false,
      mustChangePassword: true,
      isFirstLogin: true
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    
    // Automatically set corresponding mode and dispatch welcome email
    if (assignedType === 'host') {
      setUserMode('host');
      dispatchSystemEmail('welcome_host', { user: newUser });
    } else {
      setUserMode('guest');
      dispatchSystemEmail('welcome_user', { user: newUser });
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    return { user: newUser, verificationCode };
  };

  const switchUserRole = (newRole: 'client' | 'host' | 'admin') => {
    if (!currentUser) return;
    const isPromotingToAdmin = newRole === 'admin';
    const updatedUser: UserProfile = {
      ...currentUser,
      userType: newRole,
      isAdmin: isPromotingToAdmin
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      if (isPromotingToAdmin) {
        return {
          ...u,
          isAdmin: false,
          userType: u.userType === 'admin' ? 'client' : u.userType
        };
      }
      return u;
    }));
    
    if (newRole === 'host') {
      setUserMode('host');
    } else {
      setUserMode('guest');
    }
  };

  const updateUserRoleInList = (userId: string, newRole: 'client' | 'host' | 'admin') => {
    const isPromotingToAdmin = newRole === 'admin';

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          userType: newRole,
          isAdmin: isPromotingToAdmin
        };
      }
      if (isPromotingToAdmin) {
        return {
          ...u,
          isAdmin: false,
          userType: u.userType === 'admin' ? 'client' : u.userType
        };
      }
      return u;
    }));

    if (currentUser) {
      if (currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          userType: newRole,
          isAdmin: isPromotingToAdmin
        });
        if (newRole === 'host') {
          setUserMode('host');
        } else {
          setUserMode('guest');
        }
      } else if (isPromotingToAdmin && currentUser.isAdmin) {
        setCurrentUser({
          ...currentUser,
          isAdmin: false,
          userType: currentUser.userType === 'admin' ? 'client' : currentUser.userType
        });
      }
    }
  };

  const updateUserProfileByAdmin = (userId: string, updatedData: Partial<UserProfile>) => {
    const isPromotingToAdmin = updatedData.isAdmin === true || updatedData.userType === 'admin';

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const finalIsAdmin = isPromotingToAdmin ? true : (updatedData.isAdmin !== undefined ? updatedData.isAdmin : u.isAdmin);
        const finalUserType = updatedData.userType || (finalIsAdmin ? 'admin' : (finalIsAdmin === false && u.userType === 'admin' ? 'client' : u.userType));
        return {
          ...u,
          ...updatedData,
          isAdmin: finalIsAdmin,
          userType: finalUserType
        };
      }
      if (isPromotingToAdmin) {
        return {
          ...u,
          isAdmin: false,
          userType: u.userType === 'admin' ? 'client' : u.userType
        };
      }
      return u;
    }));

    if (currentUser) {
      if (currentUser.id === userId) {
        const finalIsAdmin = isPromotingToAdmin ? true : (updatedData.isAdmin !== undefined ? updatedData.isAdmin : currentUser.isAdmin);
        const finalUserType = updatedData.userType || (finalIsAdmin ? 'admin' : (finalIsAdmin === false && currentUser.userType === 'admin' ? 'client' : currentUser.userType));
        setCurrentUser({
          ...currentUser,
          ...updatedData,
          isAdmin: finalIsAdmin,
          userType: finalUserType
        });
      } else if (isPromotingToAdmin && currentUser.isAdmin) {
        setCurrentUser({
          ...currentUser,
          isAdmin: false,
          userType: currentUser.userType === 'admin' ? 'client' : currentUser.userType
        });
      }
    }
  };

  const deleteUser = (userId: string) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      setCurrentView('landing');
    }
  };

  const verifyUserEmail = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isEmailVerified: true } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, isEmailVerified: true });
    }
  };

  const requestPasswordResetCode = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = usersList.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, message: 'Vartotojas su šiuo el. paštu nerastas.' };
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    dispatchSystemEmail('password_reset_code', { user, verificationCode: code });
    return { success: true, code, userId: user.id };
  };

  const resetUserPassword = (email: string, newPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setUsersList(prev => prev.map(u => {
      if (u.email.trim().toLowerCase() === normalizedEmail) {
        return { ...u, password: newPassword, isEmailVerified: true };
      }
      return u;
    }));
    if (currentUser && currentUser.email.trim().toLowerCase() === normalizedEmail) {
      setCurrentUser({ ...currentUser, password: newPassword, isEmailVerified: true });
    }
    return { success: true };
  };

  const recoverEmailByNameOrPhone = (query: string) => {
    const q = query.trim().toLowerCase();
    return usersList.filter(u => 
      u.name.toLowerCase().includes(q) || 
      (u.phone && u.phone.includes(q))
    );
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const updateUserProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updatedData
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    if (updatedData.avatar || updatedData.name) {
      setCampsites(prev => prev.map(c => {
        if (
          c.host.id === updatedUser.id ||
          c.host.name?.toLowerCase() === updatedUser.name?.toLowerCase()
        ) {
          return {
            ...c,
            host: {
              ...c.host,
              ...(updatedData.name ? { name: updatedData.name } : {}),
              ...(updatedData.avatar ? { avatar: updatedData.avatar } : {})
            }
          };
        }
        return c;
      }));
    }
  };

  const registerHostAndAddCampsite = (
    hostData: { name: string; email: string; phone?: string; avatar?: string; bio?: string },
    campsiteData: Omit<Campsite, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'blockedDates' | 'host'>
  ): Campsite => {
    // Check if host user already exists by email or name
    const existingHost = usersList.find(
      u => u.email.toLowerCase() === hostData.email.trim().toLowerCase() ||
           u.name.toLowerCase() === hostData.name.trim().toLowerCase()
    );

    let hostUser: UserProfile;
    if (existingHost) {
      hostUser = {
        ...existingHost,
        isEmailVerified: true,
        isPhoneVerified: true
      };
    } else {
      hostUser = {
        id: `host-${Date.now()}`,
        name: hostData.name.trim() || 'Naujas Šeimininkas',
        email: hostData.email.trim() || 'seimininkas@campy.lt',
        phone: hostData.phone?.trim() || '+370 600 00000',
        avatar: hostData.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: hostData.bio?.trim() || 'Gamtos ir sodybos sklypo šeimininkas, džiaugiantis galėdamas priimti poilsiautojus.',
        joinedDate: 'Rugpjūtis 2026',
        isAdmin: false,
        isSuperhost: false,
        isEmailVerified: true,
        isPhoneVerified: true
      };
      setUsersList(prev => [...prev, hostUser]);
    }

    // Set as active logged in user and switch mode to host
    setCurrentUser(hostUser);
    setUserMode('host');

    const id = `camp-${Date.now()}`;
    const fullCamp: Campsite = {
      ...campsiteData,
      id,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      blockedDates: [],
      status: 'approved',
      host: {
        id: hostUser.id,
        name: hostUser.name,
        avatar: hostUser.avatar,
        isSuperhost: hostUser.isSuperhost || false,
        joinedDate: hostUser.joinedDate,
        responseRate: '100% per 1 valandą',
        bio: hostUser.bio || '',
        isEmailVerified: true,
        isPhoneVerified: true
      }
    };

    setCampsites(prev => [fullCamp, ...prev]);
    setSelectedCampsite(fullCamp);
    dispatchSystemEmail('welcome_host', { user: hostUser, campsite: fullCamp });
    return fullCamp;
  };

  const approveCampsite = (id: string) => {
    updateCampsiteStatus(id, 'approved');
  };

  const rejectCampsite = (id: string) => {
    updateCampsiteStatus(id, 'rejected');
  };

  const updateCampsiteStatus = (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    setCampsites(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCampsite?.id === id) {
      setSelectedCampsite(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const updateCampsite = (id: string, updatedData: Partial<Campsite>) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updatedData };
        if (selectedCampsite?.id === id) {
          setSelectedCampsite(updated);
        }
        return updated;
      }
      return c;
    }));
  };

  const deleteCampsite = (id: string) => {
    setCampsites(prev => prev.filter(c => c.id !== id));
    if (selectedCampsite?.id === id) {
      setSelectedCampsite(null);
    }
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: 'free_inquiry' | 'pending' | 'approved' | 'confirmed' | 'rejected' }): Booking => {
    const targetCampsite = campsites.find(c => c.id === bookingData.campsiteId);
    
    // Determine host plan: 'free' | 'pro' | 'premium'
    const isPro = targetCampsite?.isPro || targetCampsite?.host?.tier === 'pro' || targetCampsite?.host?.tier === 'premium' || hostTier === 'pro' || hostTier === 'premium';
    const plan: HostTier = isPro ? (targetCampsite?.host?.tier || 'pro') : 'free';

    const pricing = calculateFullPricing(
      bookingData.nightlyRate,
      bookingData.totalNights,
      bookingData.cleaningFee || 0,
      bookingData.checkIn,
      bookingData.checkOut,
      targetCampsite?.customPrices
    );

    // Initial status:
    // If explicit status passed, use it; otherwise 'free_inquiry' for Free plan, 'pending' for Pro plan
    const initialStatus = bookingData.status || (plan === 'free' ? 'free_inquiry' : 'pending');

    const newBooking: Booking = {
      ...bookingData,
      hostPlan: plan,
      bookingSubtotal: bookingData.bookingSubtotal ?? pricing.bookingSubtotal,
      platformFeeCents: bookingData.platformFeeCents ?? pricing.platformFeeCents,
      platformFeeEur: bookingData.platformFeeEur ?? pricing.platformFeeEur,
      feePercentage: bookingData.feePercentage ?? pricing.feePercentage,
      hostPayoutAmount: bookingData.hostPayoutAmount ?? pricing.hostPayoutAmount,
      totalPrice: bookingData.totalPrice ?? pricing.totalGuestPrice,
      stripePaymentStatus: bookingData.stripePaymentStatus || 'succeeded_escrow_held',
      escrowStatus: bookingData.escrowStatus || 'held_in_escrow',
      paymentMethodType: bookingData.paymentMethodType || 'card',
      stripePaymentIntentId: bookingData.stripePaymentIntentId || `pi_stripe_escrow_${Date.now()}`,
      id: `bk-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: initialStatus,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Calendar blocking logic:
    // ONLY block dates automatically if status is 'pending' or 'approved'/'confirmed' (i.e. PRO plan or approved booking)
    // Free plan inquiries do NOT block calendar dates on platform!
    if (initialStatus === 'pending' || initialStatus === 'approved' || initialStatus === 'confirmed') {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const datesToBlock: string[] = [];
      
      for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
        datesToBlock.push(d.toISOString().split('T')[0]);
      }

      setCampsites(prev => prev.map(c => {
        if (c.id === bookingData.campsiteId) {
          return {
            ...c,
            blockedDates: Array.from(new Set([...c.blockedDates, ...datesToBlock]))
          };
        }
        return c;
      }));
    }

    // Automatically send chat message to host notification
    if (targetCampsite) {
      const msgText = initialStatus === 'free_inquiry'
        ? `[Tiesioginė Free Užklausa] Svečias ${bookingData.guestName} (${bookingData.guestEmail}, ${bookingData.guestPhone || 'tel. nenurodytas'}) atsiuntė užklausą datoms: ${bookingData.checkIn} — ${bookingData.checkOut}. Žinutė: "${bookingData.guestNote || 'Nėra papildomos žinutės'}"`
        : `[Pro Rezervacijos Užklausa] Svečias ${bookingData.guestName} (${bookingData.guestEmail}, ${bookingData.guestPhone || 'tel. nenurodytas'}) laukia jūsų patvirtinimo datoms: ${bookingData.checkIn} — ${bookingData.checkOut}. Datos laikinai užrakintos. Žinutė: "${bookingData.guestNote || 'Nėra papildomos žinutės'}"`;

      sendMessageInThread(
        bookingData.campsiteId,
        {
          id: `guest-${Date.now()}`,
          name: bookingData.guestName,
          email: bookingData.guestEmail,
          role: 'client'
        },
        msgText,
        targetCampsite.title,
        {
          id: targetCampsite.host.id,
          name: targetCampsite.host.name,
          avatar: targetCampsite.host.avatar
        },
        targetCampsite.images[0]
      );
    }

    // Automatically send system confirmation emails for request submission
    dispatchSystemEmail('reservation_request_received', { booking: newBooking, campsite: targetCampsite });
    dispatchSystemEmail('new_reservation_request_host', { booking: newBooking, campsite: targetCampsite });

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, newStatus: 'approved' | 'confirmed' | 'rejected' | 'completed') => {
    const targetBooking = bookings.find(b => b.id === bookingId);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        let updatedEscrow = b.escrowStatus;
        let updatedStripe = b.stripePaymentStatus;
        if (newStatus === 'completed') {
          updatedEscrow = 'payout_released_to_host';
          updatedStripe = 'payout_released';
        } else if (newStatus === 'rejected') {
          updatedEscrow = 'refunded_to_guest';
          updatedStripe = 'refunded';
        }
        return {
          ...b,
          status: newStatus === 'confirmed' ? 'approved' : newStatus,
          escrowStatus: updatedEscrow,
          stripePaymentStatus: updatedStripe,
          paymentInstructions: (newStatus === 'approved' || newStatus === 'confirmed')
            ? 'Apmokėjimo rekvizitai: Banko sąskaita LT79 7044 0600 0123 4567, Gavėjas: Šeimininkas / Campy.lt. Pervedime nurodykite užsakymo ID.'
            : b.paymentInstructions
        };
      }
      return b;
    }));

    // If approved or confirmed, automatically trigger confirmation & arrival instructions email dispatch!
    if ((newStatus === 'approved' || newStatus === 'confirmed') && targetBooking) {
      const targetCamp = campsites.find(c => c.id === targetBooking.campsiteId);
      dispatchSystemEmail('reservation_confirmed', { booking: targetBooking, campsite: targetCamp });
      dispatchSystemEmail('arrival_instructions', { booking: targetBooking, campsite: targetCamp });

      // Execute Server Action call to /api/send-confirmation-email via Resend
      fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: targetBooking.guestEmail,
          guestName: targetBooking.guestName,
          campsiteTitle: targetCamp?.title || targetBooking.campsiteTitle,
          checkIn: targetBooking.checkIn,
          checkOut: targetBooking.checkOut,
          totalPrice: targetBooking.totalPrice,
          bookingId: targetBooking.id,
          hostName: targetCamp?.host?.name,
          hostPhone: targetCamp?.host?.phone
        })
      }).then(res => res.json()).then(data => {
        console.log('✅ [Resend Server Action Success]:', data);
      }).catch(err => {
        console.error('❌ [Resend Server Action Error]:', err);
      });
    }

    // If rejected, dispatch decline email to guest and release the temporarily blocked dates!
    if (newStatus === 'rejected' && targetBooking) {
      const targetCamp = campsites.find(c => c.id === targetBooking.campsiteId);
      dispatchSystemEmail('reservation_declined', { booking: targetBooking, campsite: targetCamp });

      const checkIn = new Date(targetBooking.checkIn);
      const checkOut = new Date(targetBooking.checkOut);
      const datesToRemove: string[] = [];
      for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
        datesToRemove.push(d.toISOString().split('T')[0]);
      }

      setCampsites(prev => prev.map(c => {
        if (c.id === targetBooking.campsiteId) {
          return {
            ...c,
            blockedDates: c.blockedDates.filter(date => !datesToRemove.includes(date))
          };
        }
        return c;
      }));
    }
  };

  const releaseEscrowPayout = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          stripePaymentStatus: 'payout_released',
          escrowStatus: 'payout_released_to_host'
        };
      }
      return b;
    }));
  };

  const addReview = (
    campsiteId: string,
    bookingId: string,
    rating: number,
    comment: string,
    authorName?: string
  ) => {
    const bk = bookings.find(b => b.id === bookingId && b.campsiteId === campsiteId);
    if (!bk) {
      alert('Klaida: galima vertinti tik patvirtintus ir apmokėtus užsakymus.');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      campsiteId,
      bookingId,
      authorName: authorName || bk.guestName || 'Patvirtintas svečias',
      authorAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      rating,
      date: new Date().toLocaleDateString('lt-LT'),
      comment,
      verifiedStay: true,
      disputed: false,
      disputeStatus: 'none',
    };

    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        // Filter out prior review for same booking if exists
        const existingReviews = c.reviews ? c.reviews.filter(r => r.bookingId !== bookingId) : [];
        const updatedReviews = [newReview, ...existingReviews];
        const avgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

        const updatedCamp = {
          ...c,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: parseFloat(avgRating.toFixed(1)),
        };

        if (selectedCampsite?.id === campsiteId) {
          setSelectedCampsite(updatedCamp);
        }

        return updatedCamp;
      }
      return c;
    }));
  };

  const disputeReview = (
    campsiteId: string,
    reviewId: string,
    category: 'profanity' | 'hate_speech' | 'no_show' | 'other_violation',
    reason: string
  ) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        const updatedReviews = (c.reviews || []).map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              disputed: true,
              disputeCategory: category,
              disputeReason: reason,
              disputeStatus: 'pending_admin' as const,
              disputeDate: new Date().toLocaleDateString('lt-LT'),
            };
          }
          return r;
        });

        const updatedCamp = { ...c, reviews: updatedReviews };
        if (selectedCampsite?.id === campsiteId) {
          setSelectedCampsite(updatedCamp);
        }
        return updatedCamp;
      }
      return c;
    }));
  };

  const resolveReviewDispute = (
    campsiteId: string,
    reviewId: string,
    decision: 'dismiss' | 'remove'
  ) => {
    setCampsites(prev => prev.map(c => {
      if (c.id === campsiteId) {
        let updatedReviews: Review[];
        if (decision === 'remove') {
          // Remove review due to proven rule violation
          updatedReviews = (c.reviews || []).filter(r => r.id !== reviewId);
        } else {
          // Dismiss dispute - review remains intact because criticism is allowed
          updatedReviews = (c.reviews || []).map(r => {
            if (r.id === reviewId) {
              return {
                ...r,
                disputed: false,
                disputeStatus: 'dismissed' as const,
              };
            }
            return r;
          });
        }

        const newReviewCount = updatedReviews.length;
        const avgRating = newReviewCount > 0 
          ? parseFloat((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newReviewCount).toFixed(1))
          : 5.0;

        const updatedCamp = {
          ...c,
          reviews: updatedReviews,
          reviewCount: newReviewCount,
          rating: avgRating,
        };

        if (selectedCampsite?.id === campsiteId) {
          setSelectedCampsite(updatedCamp);
        }

        return updatedCamp;
      }
      return c;
    }));
  };

  // Chat methods implementation
  const getChatThreadsForCampsite = (campsiteId: string): ChatThread[] => {
    return chatThreads.filter(t => t.campsiteId === campsiteId);
  };

  const getChatThreadsForHost = (hostId: string): ChatThread[] => {
    return chatThreads.filter(t => t.hostId === hostId);
  };

  const sendMessageInThread = (
    campsiteId: string,
    sender: { id: string; name: string; avatar?: string; role: 'client' | 'host' | 'admin'; email?: string },
    text: string,
    campsiteTitle?: string,
    hostInfo?: { id: string; name: string; avatar?: string },
    campsiteImage?: string
  ): ChatMessage => {
    const timeStr = new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      role: sender.role,
      text,
      timestamp: `Šiandien ${timeStr}`
    };

    setChatThreads(prev => {
      // Find existing thread for this campsite & client
      const threadId = `chat-${campsiteId}-${sender.role === 'client' ? sender.id : 'guest'}`;
      const existingIndex = prev.findIndex(t => t.campsiteId === campsiteId && (t.clientId === sender.id || t.id === threadId));

      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentThread = updated[existingIndex];
        updated[existingIndex] = {
          ...currentThread,
          lastMessage: text,
          lastMessageTimestamp: `Šiandien ${timeStr}`,
          messages: [...currentThread.messages, newMsg],
          unreadByHost: sender.role === 'client',
          unreadByClient: sender.role === 'host' || sender.role === 'admin',
          unreadByAdmin: sender.role !== 'admin'
        };
        return updated;
      } else {
        // Create new thread
        const camp = campsites.find(c => c.id === campsiteId);
        const newThread: ChatThread = {
          id: threadId,
          campsiteId,
          campsiteTitle: campsiteTitle || camp?.title || 'Stovyklavietė',
          campsiteImage: campsiteImage || camp?.images?.[0],
          hostId: hostInfo?.id || camp?.host.id || 'host-unknown',
          hostName: hostInfo?.name || camp?.host.name || 'Šeimininkas',
          hostAvatar: hostInfo?.avatar || camp?.host.avatar,
          clientId: sender.id,
          clientName: sender.name,
          clientEmail: sender.email || 'klientas@campy.lt',
          clientAvatar: sender.avatar,
          lastMessage: text,
          lastMessageTimestamp: `Šiandien ${timeStr}`,
          messages: [newMsg],
          unreadByHost: sender.role === 'client',
          unreadByClient: false,
          unreadByAdmin: true
        };
        return [newThread, ...prev];
      }
    });

    return newMsg;
  };

  const replyToThread = (
    threadId: string,
    sender: { id: string; name: string; avatar?: string; role: 'client' | 'host' | 'admin' },
    text: string
  ) => {
    const timeStr = new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      role: sender.role,
      text,
      timestamp: `Šiandien ${timeStr}`
    };

    setChatThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          lastMessage: text,
          lastMessageTimestamp: `Šiandien ${timeStr}`,
          messages: [...t.messages, newMsg],
          unreadByHost: sender.role === 'client',
          unreadByClient: sender.role === 'host' || sender.role === 'admin',
          unreadByAdmin: sender.role !== 'admin'
        };
      }
      return t;
    }));
  };

  return (
    <CampsiteContext.Provider
      value={{
        campsites,
        bookings,
        currentView,
        selectedCampsite,
        searchFilters,
        userMode,
        favorites,
        promoDaysRemaining,
        language,
        currentUser,
        usersList,
        setCurrentUser,
        registerHostAndAddCampsite,
        confirmVisitStart,
        verifyHostPhoneOrEmail,
        updateUserProfile,
        isAuthModalOpen,
        authModalInitialMode,
        openAuthModal,
        closeAuthModal,
        isChangePasswordModalOpen,
        isFirstLoginChangePrompt,
        openChangePasswordModal,
        closeChangePasswordModal,
        changeUserPassword,
        loginUser,
        registerUser,
        switchUserRole,
        updateUserRoleInList,
        updateUserProfileByAdmin,
        deleteUser,
        verifyUserEmail,
        requestPasswordResetCode,
        resetUserPassword,
        recoverEmailByNameOrPhone,
        logoutUser,
        chatThreads,
        sendMessageInThread,
        replyToThread,
        getChatThreadsForCampsite,
        getChatThreadsForHost,
        setView,
        selectCampsiteById,
        updateSearchFilters,
        resetFilters,
        addCampsite,
        updateCampsite,
        deleteCampsite,
        approveCampsite,
        rejectCampsite,
        updateCampsiteStatus,
        addBooking,
        updateBookingStatus,
        releaseEscrowPayout,
        addReview,
        disputeReview,
        resolveReviewDispute,
        toggleUserMode,
        toggleFavorite,
        isDateBlocked,
        hostTier,
        setHostTier,
        updateHostTier,
        emailLogs,
        addPitch,
        updatePitch,
        deletePitch,
        addSeasonalRule,
        deleteSeasonalRule,
        syncICalFeeds,
        updateCheckInInstructions,
        sendAutomatedEmail,
        dispatchSystemEmail,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </CampsiteContext.Provider>
  );
};

export const useCampsites = () => {
  const context = useContext(CampsiteContext);
  if (!context) {
    throw new Error('useCampsites must be used within a CampsiteProvider');
  }
  return context;
};
