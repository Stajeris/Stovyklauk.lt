import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campsite, Booking, SearchFilters, ViewState, PropertyType, Review, UserProfile, ChatThread, ChatMessage } from '../types';
import { INITIAL_CAMPSITES, INITIAL_BOOKINGS } from '../data/mockCampsites';
import { INITIAL_CHAT_THREADS } from '../data/mockChats';
import { translations, Language } from '../data/translations';
import { calculateFullPricing } from '../utils/pricing';

export const INITIAL_USERS: UserProfile[] = [
  // 1 Platform Admin
  {
    id: 'admin-1',
    name: 'Giedrius Štajeris (Platformos Admin)',
    email: 'admin@stovyklauk.lt',
    password: 'admin123',
    phone: '+370 600 00000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Platformos vyriausiasis administratorius ir Stovyklauk.lt įkūrėjas.',
    joinedDate: 'Rugpjūtis 2026',
    userType: 'admin',
    isAdmin: true,
    isSuperhost: true,
    isEmailVerified: true
  },
  // 8 Hosts in Lithuania
  {
    id: 'host-1',
    name: 'Jonas Kazlauskas (Aukštaitijos Šeimininkas)',
    email: 'jonas.kazlauskas@stovyklauk.lt',
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
    name: 'Eglė Petrauskienė (Zarasų Glamping)',
    email: 'egle.petrauskiene@stovyklauk.lt',
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
    name: 'Gintaras Marcinkevičius (Dzūkijos Pušynai)',
    email: 'gintaras.m@stovyklauk.lt',
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
    name: 'Lina Jonaitienė (Žemaitijos Slėnis)',
    email: 'lina.jonaitiene@stovyklauk.lt',
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
    name: 'Darius Stankevičius (Anykščių Šilelis)',
    email: 'darius.stankevicius@stovyklauk.lt',
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
    name: 'Dovilė Vasiliauskienė (Pajūrio Oazė)',
    email: 'dovile.vasiliauskiene@stovyklauk.lt',
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
    name: 'Andrius Žukauskas (Nemuno Kilpos)',
    email: 'andrius.zukauskas@stovyklauk.lt',
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
    name: 'Rūta Balčiūnaitė (Neries Vingiai)',
    email: 'ruta.balciunaite@stovyklauk.lt',
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
  currentUser: UserProfile;
  usersList: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  registerHostAndAddCampsite: (
    hostData: { name: string; email: string; phone?: string; avatar?: string; bio?: string },
    campsiteData: Omit<Campsite, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'blockedDates' | 'host'>
  ) => Campsite;

  // Auth System
  isAuthModalOpen: boolean;
  authModalInitialMode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email';
  openAuthModal: (mode?: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email') => void;
  closeAuthModal: () => void;
  loginUser: (email: string, password?: string) => { success: boolean; reason?: 'user_not_found' | 'invalid_password'; user?: UserProfile };
  registerUser: (userData: { name: string; email: string; password?: string; phone?: string; avatar?: string; userType?: 'client' | 'host' }) => { user: UserProfile; verificationCode: string };
  switchUserRole: (newRole: 'client' | 'host' | 'admin') => void;
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
  hostTier: 'free' | 'pro';
  setHostTier: (tier: 'free' | 'pro') => void;
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
    const DATASET_VER = 'v3_8hosts_15users';
    const savedVer = localStorage.getItem('campscape_users_ver');
    const local = localStorage.getItem('campscape_users');
    if (savedVer !== DATASET_VER || !local) {
      localStorage.setItem('campscape_users_ver', DATASET_VER);
      localStorage.setItem('campscape_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(local);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const local = localStorage.getItem('campscape_current_user');
    return local ? JSON.parse(local) : INITIAL_USERS[0];
  });

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const local = localStorage.getItem('stovyklauk_chat_threads');
    return local ? JSON.parse(local) : INITIAL_CHAT_THREADS;
  });

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedCampsite, setSelectedCampsite] = useState<Campsite | null>(INITIAL_CAMPSITES[0]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [userMode, setUserMode] = useState<'guest' | 'host'>('guest');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hostTier, setHostTierState] = useState<'free' | 'pro'>('pro');

  const setHostTier = (tier: 'free' | 'pro') => {
    setHostTierState(tier);
    setCampsites(prev => prev.map(c => {
      if (c.host.id === 'host-1' || c.host.name.includes('Mantas')) {
        return {
          ...c,
          isPro: tier === 'pro',
          host: { ...c.host, tier }
        };
      }
      return c;
    }));
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

  const openAuthModal = (mode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'forgot-email' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginUser = (email: string, password?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = usersList.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, reason: 'user_not_found' as const };
    }
    if (found.password && password && found.password !== password.trim()) {
      return { success: false, reason: 'invalid_password' as const };
    }
    setCurrentUser(found);
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

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Naujas Vartotojas',
      email: userData.email,
      password: userData.password || 'slaptazodis123',
      phone: userData.phone || '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: assignedType === 'host' ? 'Stovyklavietės ir sodybos šeimininkas' : 'Stovyklautojas ir žygeivis',
      joinedDate: 'Rugpjūtis 2026',
      userType: assignedType,
      isAdmin: false,
      isSuperhost: false,
      isEmailVerified: false
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    
    // Automatically set corresponding mode
    if (assignedType === 'host') {
      setUserMode('host');
    } else {
      setUserMode('guest');
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    return { user: newUser, verificationCode };
  };

  const switchUserRole = (newRole: 'client' | 'host' | 'admin') => {
    setCurrentUser(prev => ({
      ...prev,
      userType: newRole,
      isAdmin: newRole === 'admin' ? true : prev.isAdmin
    }));
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, userType: newRole, isAdmin: newRole === 'admin' ? true : u.isAdmin } : u));
    
    if (newRole === 'host') {
      setUserMode('host');
    } else {
      setUserMode('guest');
    }
  };

  const verifyUserEmail = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isEmailVerified: true } : u));
    setCurrentUser(prev => prev.id === userId ? { ...prev, isEmailVerified: true } : prev);
  };

  const requestPasswordResetCode = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = usersList.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, message: 'Vartotojas su šiuo el. paštu nerastas.' };
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
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
    setCurrentUser(prev => {
      if (prev.email.trim().toLowerCase() === normalizedEmail) {
        return { ...prev, password: newPassword, isEmailVerified: true };
      }
      return prev;
    });
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
    // Reset to default or first user
    setCurrentUser(INITIAL_USERS[0]);
  };

  const updateUserProfile = (updatedData: Partial<UserProfile>) => {
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
        email: hostData.email.trim() || 'seimininkas@stovyklauk.lt',
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

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
    const targetCampsite = campsites.find(c => c.id === bookingData.campsiteId);
    const pricing = calculateFullPricing(
      bookingData.nightlyRate,
      bookingData.totalNights,
      bookingData.cleaningFee || 0,
      bookingData.checkIn,
      bookingData.checkOut,
      targetCampsite?.customPrices
    );

    const newBooking: Booking = {
      ...bookingData,
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
      status: 'pending',
    };

    setBookings(prev => [newBooking, ...prev]);

    // Also block dates on campsite
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

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, newStatus: 'approved' | 'rejected' | 'completed') => {
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
          status: newStatus,
          escrowStatus: updatedEscrow,
          stripePaymentStatus: updatedStripe
        };
      }
      return b;
    }));
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
          clientEmail: sender.email || 'klientas@stovyklauk.lt',
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
        loginUser,
        registerUser,
        switchUserRole,
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
