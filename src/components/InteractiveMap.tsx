import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, X, Compass } from 'lucide-react';
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
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const modalMarkersRef = useRef<{ [key: string]: L.Marker }>({});

  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to attach markers to a map instance
  const setupMapMarkers = (map: L.Map, targetMarkersRef: React.MutableRefObject<{ [key: string]: L.Marker }>) => {
    Object.values(targetMarkersRef.current).forEach((marker: any) => marker?.remove());
    targetMarkersRef.current = {};

    if (campsites.length === 0) return;

    const bounds = L.latLngBounds([]);

    campsites.forEach(site => {
      const isSelected = site.id === selectedCampsiteId;
      const isHovered = site.id === hoveredCampsiteId;

      bounds.extend([site.latitude, site.longitude]);

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

      const isProSite = site.isPro || site.host?.tier === 'pro';
      const isSuperhost = site.host?.isSuperhost;
      const propTypeLabel = site.propertyType === 'tent' ? 'Palapinė' : site.propertyType === 'glamping' ? 'Glamping' : 'Kemperiai';

      // Build Interactive Popup/Tooltip HTML Container
      const createPopupElement = () => {
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1.5 w-[230px] sm:w-[240px] font-sans text-gray-900 select-none cursor-pointer';
        popupContent.innerHTML = `
          <div class="relative rounded-xl overflow-hidden mb-2 shadow-xs bg-gray-100 group">
            <img src="${site.images[0]}" alt="${site.title}" class="w-full h-28 object-cover" />
            
            <div class="absolute top-2 left-2 flex items-center gap-1">
              <span class="px-2 py-0.5 rounded-full bg-emerald-900/90 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                ${propTypeLabel}
              </span>
              ${isProSite ? `
                <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs border border-amber-300">
                  👑 PRO
                </span>
              ` : ''}
            </div>

            <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-amber-600 text-[10px] font-black border border-gray-200 shadow-2xs flex items-center gap-0.5">
              ★ ${site.rating} <span class="text-gray-400 font-normal text-[8px]">(${site.reviewCount})</span>
            </div>
          </div>

          <div class="mb-1.5">
            <h4 class="font-extrabold text-xs text-gray-900 line-clamp-1 leading-tight hover:text-emerald-700">${site.title}</h4>
            <p class="text-[10px] text-gray-500 font-medium line-clamp-1 mt-0.5">📍 ${site.location}</p>
          </div>

          <div class="p-1.5 rounded-xl bg-slate-50 border border-slate-200/90 mb-2.5 flex items-center gap-2">
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
              </div>
              <p class="text-[9px] text-gray-500 font-medium truncate mt-0.5">
                ⚡ Atsako: <strong class="text-emerald-700 font-bold">${site.host?.responseRate || '100%'}</strong>
              </p>
            </div>
          </div>

          <button 
            type="button" 
            class="reserve-cta-button w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-between transition cursor-pointer"
          >
            <span>Peržiūrėti & Rezervuoti</span>
            <span class="text-amber-300 font-mono text-xs">€${site.pricePerNight} →</span>
          </button>
        `;

        let hasRedirected = false;
        const triggerNavigation = (e: Event) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (hasRedirected) return;
          hasRedirected = true;
          onSelectCampsite(site.id);
          if (isExpanded) setIsExpanded(false);
        };

        popupContent.addEventListener('click', triggerNavigation);
        popupContent.addEventListener('touchend', triggerNavigation);

        const btn = popupContent.querySelector('.reserve-cta-button');
        if (btn) {
          btn.addEventListener('click', triggerNavigation);
          btn.addEventListener('touchend', triggerNavigation);
        }

        return popupContent;
      };

      const mainPopupElem = createPopupElement();
      const tooltipElem = createPopupElement();

      // Bind Popup for tap & click
      marker.bindPopup(mainPopupElem, {
        className: 'custom-leaflet-popup',
        autoPan: true,
        closeButton: true,
        maxWidth: 260
      });

      // Bind Tooltip for desktop hover
      marker.bindTooltip(tooltipElem, {
        direction: 'auto',
        offset: [0, -10],
        opacity: 1,
        interactive: true,
        className: 'custom-map-hover-tooltip'
      });

      if (isSelected || isHovered) {
        setTimeout(() => {
          marker.openPopup();
        }, 100);
      }

      marker.on('click', () => {
        marker.openPopup();
      });

      targetMarkersRef.current[site.id] = marker;
    });

    if (campsites.length > 0) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 9 });
    } else {
      map.setView([55.1694, 23.8813], 7.2);
    }
  };

  // Inline Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([55.1694, 23.8813], 7.2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    setupMapMarkers(map, markersRef);
  }, [campsites, selectedCampsiteId, hoveredCampsiteId, onSelectCampsite]);

  // Modal Map
  useEffect(() => {
    if (!isExpanded || !modalMapContainerRef.current) return;

    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove();
      modalMapInstanceRef.current = null;
    }

    const modalMap = L.map(modalMapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([55.1694, 23.8813], 7.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(modalMap);

    modalMapInstanceRef.current = modalMap;

    setTimeout(() => {
      modalMap.invalidateSize();
    }, 300);

    setupMapMarkers(modalMap, modalMarkersRef);

    return () => {
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
      }
    };
  }, [isExpanded, campsites, selectedCampsiteId, hoveredCampsiteId, onSelectCampsite]);

  const handleCenterLithuania = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([55.1694, 23.8813], 7.2, { duration: 1 });
    }
  };

  return (
    <>
      <div className="w-full h-full relative min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden border border-[#121212]/15 shadow-sm bg-[#E8E4D9]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />
        
        {/* Map Legend Badge & Buttons */}
        <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none gap-2">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 shadow-md flex items-center gap-2 font-sans">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Lietuva</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-[10px] text-gray-500 font-semibold">Rasta: {campsites.length}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleCenterLithuania}
              className="bg-white/95 hover:bg-emerald-50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-extrabold text-emerald-900 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Centruoti žemėlapį ties Lietuva"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Centruoti</span>
            </button>

            {/* Expand Map Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-900 text-[11px] font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-emerald-950/20"
              title="Išskleisti žemėlapį per visą ekraną"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Išskleisti Žemėlapį</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Expanded Map Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col justify-center items-center font-sans animate-fade-in">
          <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 flex flex-col relative">
            
            {/* Modal Top Controls Header */}
            <div className="p-4 bg-emerald-950 text-white border-b border-emerald-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-emerald-700 rounded-xl text-white">
                  <Compass className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Žemėlapis Per Visą Ekraną
                  </h3>
                  <p className="text-xs text-emerald-200 truncate">
                    Rodomos visos {campsites.length} stovyklavietės Lietuvoje • Spustelėkite kainą detalei
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                <X className="w-4 h-4" />
                <span>Uždaryti Žemėlapį</span>
              </button>
            </div>

            {/* Expanded Modal Leaflet Map Container */}
            <div ref={modalMapContainerRef} className="w-full flex-1 z-0 bg-gray-100" />
          </div>
        </div>
      )}
    </>
  );
};
