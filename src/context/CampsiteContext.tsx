import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campsite, Booking, SearchFilters, ViewState, PropertyType, Review, UserProfile, ChatThread, ChatMessage } from '../types';
import { INITIAL_CAMPSITES, INITIAL_BOOKINGS } from '../data/mockCampsites';
import { INITIAL_CHAT_THREADS } from '../data/mockChats';
import { translations, Language } from '../data/translations';
import { calculateFullPricing } from '../utils/pricing';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    name: 'Giedrius Štajeris (Platformos Admin)',
    email: 'admin@stovyklauk.lt',
    phone: '+370 600 00000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Platformos vyriausiasis administratorius ir Stovyklauk.lt įkūrėjas.',
    joinedDate: 'Rugpjūtis 2026',
    isAdmin: true,
    isSuperhost: true
  },
  {
    id: 'host-mantas',
    name: 'Mantas Giraitis',
    email: 'mantas@pusalis.lt',
    phone: '+370 611 11111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Aukštaitijos miškų šeimininkas, siūlantis privačią pakrantę.',
    joinedDate: 'Liepa 2026',
    isAdmin: false,
    isSuperhost: true
  },
  {
    id: 'host-rasa',
    name: 'Rasa Nemunienė',
    email: 'rasa@nemunokilpa.lt',
    phone: '+370 622 22222',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Dzūkijos sodybos ir pirtelės šeimininkė.',
    joinedDate: 'Birželis 2026',
    isAdmin: false,
    isSuperhost: false
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
    const local = localStorage.getItem('campscape_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
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
      hostUser = existingHost;
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
        isSuperhost: false
      };
      setUsersList(prev => [...prev, hostUser]);
    }

    // Set as active logged in user and switch mode to host
    setCurrentUser(hostUser);
    setUserMode('host');

    // Auto approve if host is verified by email or phone
    const isAutoApprovedHost = hostUser.isEmailVerified || hostUser.isPhoneVerified || currentUser.isEmailVerified || currentUser.isPhoneVerified;

    const id = `camp-${Date.now()}`;
    const fullCamp: Campsite = {
      ...campsiteData,
      id,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      blockedDates: [],
      status: campsiteData.status || (isAutoApprovedHost ? 'approved' : 'pending'),
      host: {
        id: hostUser.id,
        name: hostUser.name,
        avatar: hostUser.avatar,
        isSuperhost: hostUser.isSuperhost || false,
        joinedDate: hostUser.joinedDate,
        responseRate: '100% per 1 valandą',
        bio: hostUser.bio || '',
        isEmailVerified: hostUser.isEmailVerified,
        isPhoneVerified: hostUser.isPhoneVerified
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
