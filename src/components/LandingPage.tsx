import React, { useState } from 'react';
import { 
  Search, Calendar, Users, MapPin, Tent, Sparkles, Star, Heart, 
  ArrowRight, ShieldCheck, DollarSign, Trees, Flame, Waves, Compass 
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { PropertyType } from '../types';
import { InteractiveMap } from './InteractiveMap';

export const LandingPage: React.FC = () => {
  const { 
    campsites, 
    setView, 
    selectCampsiteById, 
    searchFilters, 
    updateSearchFilters, 
    favorites, 
    toggleFavorite,
    promoDaysRemaining,
    t
  } = useCampsites();

  const [activeTab, setActiveTab] = useState<PropertyType | 'all'>('all');

  // Local state for hero search
  const [heroLocation, setHeroLocation] = useState(searchFilters.location);
  const [heroPropertyType, setHeroPropertyType] = useState<PropertyType | 'all'>('all');
  const [heroCheckIn, setHeroCheckIn] = useState('');
  const [heroCheckOut, setHeroCheckOut] = useState('');
  const [heroGuests, setHeroGuests] = useState(2);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchFilters({
      location: heroLocation,
      propertyType: heroPropertyType,
      checkIn: heroCheckIn,
      checkOut: heroCheckOut,
      guests: heroGuests,
    });
    setView('search');
  };

  const publicCampsites = campsites.filter(c => !c.status || c.status === 'approved');

  const filteredCampsites = publicCampsites.filter(c => {
    if (activeTab === 'all') return true;
    return c.propertyType === activeTab;
  });

  return (
    <div id="landing-page-container" className="space-y-16 pb-20 bg-gray-50">
      
      {/* 1. HERO SECTION - STOVYKLAUK EMERALD NIGHT */}
      <section id="hero-section" className="relative bg-emerald-950 text-white py-20 md:py-32 overflow-hidden">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 opacity-45 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/30 to-transparent opacity-60" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          
          <span className="bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-flex items-center gap-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tavo kita nakvynė po žvaigždėmis</span>
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Atrask privačias ir laukines <br className="hidden md:inline" />
            <span className="text-emerald-400">stovyklavietes</span> Lietuvoje
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Išsinuomok unikalius miško sklypus, ežerų pakrantes ar sodybų kiemus tiesiai iš vietinių šeimininkų.
          </p>

          {/* Search Bar Panel */}
          <form 
            id="hero-search-form"
            onSubmit={handleHeroSearch}
            className="bg-white text-gray-800 p-4 md:p-3 rounded-2xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 border border-gray-100"
          >
            {/* Location */}
            <div className="w-full md:w-1/3 px-4 py-2 text-left border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50/80 rounded-xl transition-colors">
              <label className="block text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider">Kur važiuojam?</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Molėtai, Varėna, Zarasai..."
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full bg-transparent focus:outline-hidden text-gray-900 font-bold text-sm placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Accommodation Type */}
            <div className="w-full md:w-1/4 px-4 py-2 text-left border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50/80 rounded-xl transition-colors">
              <label className="block text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider">{t('propertyTypes')}</label>
              <div className="flex items-center gap-2 mt-1">
                <Tent className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={heroPropertyType}
                  onChange={(e) => setHeroPropertyType(e.target.value as any)}
                  className="w-full bg-transparent focus:outline-hidden text-gray-900 font-bold text-sm cursor-pointer"
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="tent">{t('tent')}</option>
                  <option value="glamping">{t('glamping')}</option>
                  <option value="rv">{t('rv')}</option>
                </select>
              </div>
            </div>

            {/* Guests */}
            <div className="w-full md:w-1/4 px-4 py-2 text-left mb-3 md:mb-0 hover:bg-gray-50/80 rounded-xl transition-colors">
              <label className="block text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider">{t('guests')}</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={heroGuests}
                  onChange={(e) => setHeroGuests(parseInt(e.target.value) || 1)}
                  className="w-full bg-transparent focus:outline-hidden text-gray-900 font-bold text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="hero-search-submit"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl md:rounded-full font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 shrink-0 cursor-pointer text-sm"
            >
              <Search className="w-4 h-4" />
              <span>{t('search')}</span>
            </button>
          </form>

        </div>
      </section>

      {/* 2. PROMOTIONAL HOST CAMPAIGN (0% MOKESTIS) */}
      <section id="host-promo-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 md:w-2/3 space-y-3">
            <span className="bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block">
              AKCIJA: ĮKŪRĖJŲ KLUBAS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Turi miško sklypą, pievą ar sodybą prie ežero?
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Įkelk savo stovyklavietę šiandien ir **pirmus 6 mėnesius nemokėk jokių šeimininko mokesčių** (Liko {promoDaysRemaining} dienų). Pasiimk 100% to, ką uždirbi!
            </p>
          </div>

          <div className="relative z-10 md:w-1/3 text-right w-full shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              id="banner-list-land-btn"
              onClick={() => setView('add-listing')}
              className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 px-8 py-4 rounded-xl font-extrabold transition shadow-lg text-base cursor-pointer"
            >
              Registruoti sklypą nemokamai
            </button>
            <button
              id="banner-dashboard-btn"
              onClick={() => setView('host-dashboard')}
              className="w-full bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-600/40 px-6 py-3 rounded-xl font-bold transition text-xs cursor-pointer"
            >
              Šeimininko Valdymo Skydas
            </button>
          </div>

          {/* Decorative glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* 3. POPULAR CAMPSITES LISTING */}
      <section id="featured-campsites-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Rekomenduojamos vietos poilsiui
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Geriausiai įvertintos mūsų lankytojų stovyklavietės Lietuvoje
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Visi būdai', icon: Compass },
              { id: 'tent', label: 'Palapinėms', icon: Tent },
              { id: 'glamping', label: 'Glamping', icon: Sparkles },
              { id: 'rv', label: 'Kemperiams', icon: Trees },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampsites.map(site => {
            const isFav = favorites.includes(site.id);
            return (
              <div
                key={site.id}
                id={`campsite-card-${site.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-150 group flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-60 overflow-hidden cursor-pointer" onClick={() => selectCampsiteById(site.id)}>
                    <img
                      src={site.images[0]}
                      alt={site.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    
                    {/* Badge */}
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-xs">
                      {site.propertyType === 'tent' ? 'Prie vandens' : site.propertyType === 'glamping' ? 'Glamping' : 'Kemperiams'}
                    </span>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(site.id);
                      }}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full transition shadow-sm cursor-pointer"
                      title="Išsaugoti"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-rose-600 fill-rose-600' : 'text-gray-600'}`} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {site.location}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="text-xs font-bold text-gray-800">{site.rating} ({site.reviewCount})</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => selectCampsiteById(site.id)}
                      className="text-lg font-bold text-gray-900 mb-2 hover:text-emerald-600 transition cursor-pointer line-clamp-1"
                    >
                      {site.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                      {site.description}
                    </p>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-2 my-3">
                      {site.amenities.slice(0, 3).map((am, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded-md">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Price & CTA */}
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-2xl font-black text-emerald-800">€{site.pricePerNight}</span>
                    <span className="text-xs text-gray-500"> / parai</span>
                  </div>

                  <button
                    onClick={() => selectCampsiteById(site.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-lg font-bold transition text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Užsakyti</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center pt-4">
          <button
            id="view-all-campsites-btn"
            onClick={() => setView('search')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <span>Ieškoti sąraše ({publicCampsites.length} vietos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* 3.5. MAIN SITE INTERACTIVE MAP SECTION */}
      <section id="main-site-map-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Interaktyvus žemėlapis
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Stovyklavietės Lietuvoje žemėlapyje
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Pažymėtos visų laisvų sklypų, sodybų ir glamping vietų kainos. Spustelėkite žymeklį peržiūrai.
            </p>
          </div>

          <button
            onClick={() => setView('search')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-emerald-900 font-bold border border-gray-200 text-xs shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Atidaryti pilną paieškos žemėlapį</span>
          </button>
        </div>

        <div className="h-[480px] md:h-[540px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <InteractiveMap
            campsites={publicCampsites}
            onSelectCampsite={selectCampsiteById}
          />
        </div>
      </section>

      {/* 4. PLATFORM ADVANTAGES / WHY STOVYKLAUK */}
      <section className="bg-emerald-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kodėl Verta Rinktis Campy.lt
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Kodėl poilsiautojai ir šeimininkai renkasi mus?
            </h2>
            <p className="text-emerald-100/80 text-sm">Skaidri ir patogi platforma laukiniam poilsiui gamtoje</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-900/50 p-8 rounded-2xl border border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">100% Privati Gamta</h3>
              <p className="text-emerald-100/70 text-xs leading-relaxed">
                Venkite sausakimšų kempingų. Stovyklaukite privačiose pievose, miškuose ir prie ežerų be triukšmingų kaimynų.
              </p>
            </div>

            <div className="bg-emerald-900/50 p-8 rounded-2xl border border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">0% Šeimininko Mokestis</h3>
              <p className="text-emerald-100/70 text-xs leading-relaxed">
                Sklypų savininkai pasiima 100% savo uždarbio. Tiesioginiai Stripe Connect pavedimai tiesiai į jūsų banko sąskaitą.
              </p>
            </div>

            <div className="bg-emerald-900/50 p-8 rounded-2xl border border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">Patikrinti Šeimininkai</h3>
              <p className="text-emerald-100/70 text-xs leading-relaxed">
                Lanksčios atšaukimo taisyklės, tikros svečių nuotraukos ir tiesioginis susirašinėjimas su šeimininku.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

