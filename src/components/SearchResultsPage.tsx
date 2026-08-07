import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Star, Heart, Tent, Sparkles, 
  Trees, DollarSign, Filter, X, ArrowUpDown, ChevronRight, RotateCcw, Crown
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { InteractiveMap } from './InteractiveMap';
import { PropertyType } from '../types';

export const SearchResultsPage: React.FC = () => {
  const { 
    campsites, 
    selectCampsiteById, 
    searchFilters, 
    updateSearchFilters, 
    resetFilters,
    favorites, 
    toggleFavorite 
  } = useCampsites();

  const [hoveredCampsiteId, setHoveredCampsiteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter campsites based on searchFilters (only approved or unstatused)
  const approvedCampsites = campsites.filter(site => !site.status || site.status === 'approved');

  const filteredCampsites = approvedCampsites.filter(site => {
    // Location search filter
    if (searchFilters.location) {
      const loc = searchFilters.location.toLowerCase();
      const matchLoc = site.location.toLowerCase().includes(loc) || 
                       site.title.toLowerCase().includes(loc) || 
                       site.region.toLowerCase().includes(loc);
      if (!matchLoc) return false;
    }

    // Property Type
    if (searchFilters.propertyType !== 'all') {
      if (site.propertyType !== searchFilters.propertyType) return false;
    }

    // Price
    if (site.pricePerNight > searchFilters.maxPrice) return false;

    // Pet Friendly
    if (searchFilters.petFriendly && !site.amenities.includes('Pet Friendly')) return false;

    // Electricity
    if (searchFilters.electricity && !site.amenities.includes('Electricity')) return false;

    // Near Water
    if (searchFilters.nearWater && !site.amenities.includes('Near Water')) return false;

    // Fire Pit
    if (searchFilters.firePit && !site.amenities.includes('Fire Pit')) return false;

    return true;

  }).sort((a, b) => {
    if (sortBy === 'recommended') {
      if (a.isPro && !b.isPro) return -1;
      if (!a.isPro && b.isPro) return 1;
      return b.rating - a.rating;
    }
    if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div id="search-results-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gray-50">
      
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        
        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Ieškoti stovyklaviečių
            </h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              Rasta {filteredCampsites.length} vietos
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-full">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>Rūšiuoti:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="recommended">Rekomenduojamos</option>
                <option value="price-asc">Pigiausios viršuje</option>
                <option value="price-desc">Brangiausios viršuje</option>
                <option value="rating">Geriausiai įvertintos</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrai</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar (Stovyklauk Pill Style) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs font-sans">
          {/* Property Type Pills */}
          {[
            { id: 'all', label: 'Visi tipai' },
            { id: 'tent', label: 'Su palapine' },
            { id: 'glamping', label: 'Glamping' },
            { id: 'rv', label: 'Kemperiams' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => updateSearchFilters({ propertyType: type.id as any })}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                searchFilters.propertyType === type.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}

          <span className="text-gray-300">|</span>

          {/* Price Under 25 EUR */}
          <button
            onClick={() => updateSearchFilters({ maxPrice: searchFilters.maxPrice === 25 ? 200 : 25 })}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              searchFilters.maxPrice === 25
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Iki 25€ / parai
          </button>

          {/* Electricity */}
          <button
            onClick={() => updateSearchFilters({ electricity: !searchFilters.electricity })}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              searchFilters.electricity
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            ⚡ Elektra
          </button>

          {/* Near Water */}
          <button
            onClick={() => updateSearchFilters({ nearWater: !searchFilters.nearWater })}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              searchFilters.nearWater
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            🌊 Prie ežero / upės
          </button>

          {/* Pet Friendly */}
          <button
            onClick={() => updateSearchFilters({ petFriendly: !searchFilters.petFriendly })}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              searchFilters.petFriendly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            🐾 Draugiška gyvūnams
          </button>

          {/* Reset Filters button */}
          <button
            onClick={resetFilters}
            className="ml-auto text-gray-500 hover:text-emerald-700 flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Išvalyti filtrus</span>
          </button>
        </div>

      </div>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px] items-start">
        
        {/* Left Side: Campsite Listings List */}
        <div className="lg:col-span-7 space-y-4">
          
          {filteredCampsites.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-150 space-y-4 shadow-sm">
              <Tent className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-xl text-gray-900">Nerasta stovyklaviečių pagal pasirinktus filtrus</h3>
              <p className="text-gray-500 text-xs max-w-sm mx-auto">
                Pabandytkite padidinti kainos rėžius arba išvalyti tam tikrus filtrus.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Išvalyti visus filtrus
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampsites.map(site => {
                const isFav = favorites.includes(site.id);
                const isHovered = hoveredCampsiteId === site.id;

                return (
                  <div
                    key={site.id}
                    id={`search-card-${site.id}`}
                    onMouseEnter={() => setHoveredCampsiteId(site.id)}
                    onMouseLeave={() => setHoveredCampsiteId(null)}
                    onClick={() => selectCampsiteById(site.id)}
                    className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col sm:flex-row shadow-xs hover:shadow-md ${
                      isHovered
                        ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                        : 'border-gray-150'
                    }`}
                  >
                    {/* Image */}
                    <div className="sm:w-2/5 h-48 sm:h-auto relative shrink-0 overflow-hidden bg-gray-100">
                      <img
                        src={site.images[0]}
                        alt={site.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {site.isPro && (
                          <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md border border-amber-300">
                            <Crown className="w-3 h-3 text-amber-100" />
                            <span>PRO Rekomenduojama</span>
                          </div>
                        )}
                        <div className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold capitalize">
                          {site.propertyType === 'tent' ? 'Palapinėms' : site.propertyType === 'glamping' ? 'Glamping' : 'Kemperiams'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(site.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-xs"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-600 fill-rose-600' : 'text-gray-600'}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span className="font-semibold uppercase tracking-wider text-gray-400">
                            {site.location}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            {site.rating} ({site.reviewCount})
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg hover:text-emerald-700 transition line-clamp-1">
                          {site.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {site.description}
                        </p>
                      </div>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {site.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Footer price & CTA */}
                      <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                        <div>
                          <span className="text-xl font-black text-emerald-800">€{site.pricePerNight}</span>
                          <span className="text-xs text-gray-500"> / parai</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          Žiūrėti vietą <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side: Interactive Leaflet Map (Sticky on Desktop) */}
        <div className="lg:col-span-5 h-[450px] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-20 rounded-2xl overflow-hidden border border-gray-150 shadow-sm z-20">
          <InteractiveMap
            campsites={filteredCampsites}
            onSelectCampsite={selectCampsiteById}
            hoveredCampsiteId={hoveredCampsiteId}
          />
        </div>

      </div>

    </div>
  );
};

