import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Campsite } from '../types';

interface InteractiveMapProps {
  campsites: Campsite[];
  selectedCampsiteId?: string;
  onSelectCampsite: (id: string) => void;
  hoveredCampsiteId?: string | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  campsites,
  selectedCampsiteId,
  onSelectCampsite,
  hoveredCampsiteId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered on Lithuania territory
      const LITHUANIA_CENTER_LAT = 55.1694;
      const LITHUANIA_CENTER_LNG = 23.8813;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([LITHUANIA_CENTER_LAT, LITHUANIA_CENTER_LNG], 7.2);

      // Add clean tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Trigger map resize check
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => marker?.remove());
    markersRef.current = {};

    if (campsites.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Add custom price pin markers
    campsites.forEach(site => {
      const isSelected = site.id === selectedCampsiteId;
      const isHovered = site.id === hoveredCampsiteId;

      bounds.extend([site.latitude, site.longitude]);

      // Custom divIcon price pill using design system tokens
      const pinClass = isSelected || isHovered
        ? 'bg-emerald-700 text-white border-2 border-emerald-900 font-black scale-110 z-50 shadow-lg ring-2 ring-amber-400'
        : 'bg-white text-emerald-900 border border-emerald-600 font-bold shadow-md hover:bg-emerald-600 hover:text-white hover:scale-110';

      const customIcon = L.divIcon({
        className: 'custom-map-price-pin',
        html: `<div class="px-2.5 py-1 rounded-full text-xs font-sans tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center whitespace-nowrap ${pinClass}">
                 <span>€${site.pricePerNight}</span>
               </div>`,
        iconSize: [52, 28],
        iconAnchor: [26, 14],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon }).addTo(map);

      // Construct Tooltip HTML Content
      const isProSite = site.isPro || site.host?.tier === 'pro';
      const isSuperhost = site.host?.isSuperhost;
      const propTypeLabel = site.propertyType === 'tent' ? 'Palapinė' : site.propertyType === 'glamping' ? 'Glamping' : 'Kemperiai';

      const tooltipContent = document.createElement('div');
      tooltipContent.className = 'p-2 w-[220px] font-sans text-gray-900 cursor-pointer select-none';
      tooltipContent.innerHTML = `
        <!-- Campsite Photo & Badges -->
        <div class="relative rounded-lg overflow-hidden mb-1.5 shadow-xs bg-gray-100">
          <img src="${site.images[0]}" alt="${site.title}" class="w-full h-24 object-cover" />
          
          <div class="absolute top-1.5 left-1.5 flex items-center gap-1">
            <span class="px-1.5 py-0.5 rounded-full bg-emerald-800/95 backdrop-blur-xs text-white text-[8px] font-extrabold uppercase tracking-wider shadow-xs">
              ${propTypeLabel}
            </span>
            ${isProSite ? `
              <span class="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs border border-amber-300">
                👑 PRO
              </span>
            ` : ''}
          </div>

          <div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-amber-600 text-[9px] font-black border border-gray-200 shadow-2xs flex items-center gap-0.5">
            ★ ${site.rating} <span class="text-gray-400 font-normal text-[8px]">(${site.reviewCount})</span>
          </div>
        </div>

        <!-- Title & Location -->
        <div class="mb-1.5">
          <h4 class="font-bold text-xs text-gray-900 line-clamp-1 leading-tight">${site.title}</h4>
          <p class="text-[10px] text-gray-500 font-medium line-clamp-1">${site.location}</p>
        </div>

        <!-- Host Information Card -->
        <div class="p-1.5 rounded-lg bg-gray-50 border border-gray-200/90 mb-1.5 flex items-center gap-2">
          <div class="relative shrink-0">
            <img src="${site.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" alt="${site.host?.name || 'Šeimininkas'}" class="w-7 h-7 rounded-full object-cover border-2 border-emerald-500 shadow-2xs" />
            ${isSuperhost ? `
              <div class="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs border border-white" title="Superhost">
                ★
              </div>
            ` : ''}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 flex-wrap">
              <span class="font-bold text-[11px] text-gray-900 truncate">${site.host?.name || 'Šeimininkas'}</span>
              ${isSuperhost ? `
                <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-extrabold px-1 py-0.2 rounded-full inline-flex items-center gap-0.5">
                  ★ Superhost
                </span>
              ` : ''}
              ${isProSite ? `
                <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-extrabold px-1 py-0.2 rounded-full inline-flex items-center gap-0.5">
                  PRO
                </span>
              ` : ''}
            </div>

            <p class="text-[9px] text-gray-500 font-medium truncate mt-0.5">
              ⚡ Atsako: <strong class="text-emerald-700 font-bold">${site.host?.responseRate || '100%'}</strong>
            </p>
          </div>
        </div>

        <!-- Price Info -->
        <div class="flex items-center justify-between border-t border-gray-150 pt-1.5">
          <div>
            <span class="text-xs font-black text-emerald-900">€${site.pricePerNight}</span>
            <span class="text-[9px] font-normal text-gray-500"> / parai</span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'auto',
        offset: [0, -10],
        opacity: 1,
        interactive: true,
        className: 'custom-map-hover-tooltip'
      });

      if (isSelected || isHovered) {
        setTimeout(() => {
          marker.openTooltip();
        }, 100);
      }

      marker.on('click', () => {
        onSelectCampsite(site.id);
      });

      tooltipContent.addEventListener('click', () => {
        onSelectCampsite(site.id);
      });

      markersRef.current[site.id] = marker;
    });

    if (campsites.length > 0 && map) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 9 });
    } else if (map) {
      map.setView([55.1694, 23.8813], 7.2);
    }

  }, [campsites, selectedCampsiteId, hoveredCampsiteId, onSelectCampsite]);

  const handleCenterLithuania = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([55.1694, 23.8813], 7.2, {
        duration: 1
      });
    }
  };

  return (
    <div className="w-full h-full relative min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden border border-[#121212]/15 shadow-sm bg-[#E8E4D9]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Map Legend Badge & Center Lithuania Button */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 shadow-md flex items-center gap-2 font-sans">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Lietuva</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-[10px] text-gray-500 font-semibold">Rasta: {campsites.length}</span>
        </div>

        <button
          onClick={handleCenterLithuania}
          className="pointer-events-auto bg-white/95 hover:bg-emerald-50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-extrabold text-emerald-900 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Centruoti žemėlapį ties Lietuva"
        >
          <span>📍</span>
          <span>Centruoti Lietuvą</span>
        </button>
      </div>
    </div>
  );
};

