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
      // Initialize Leaflet map centered on Lithuania
      const LITHUANIA_CENTER_LAT = 55.1694;
      const LITHUANIA_CENTER_LNG = 23.8813;

      const initialLat = campsites.length > 0 ? campsites[0].latitude : LITHUANIA_CENTER_LAT;
      const initialLng = campsites.length > 0 ? campsites[0].longitude : LITHUANIA_CENTER_LNG;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([initialLat, initialLng], 7);

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

      // Popup HTML content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 max-w-[220px] font-sans text-gray-900';
      popupContent.innerHTML = `
        <div class="relative rounded-lg overflow-hidden mb-2 shadow-xs bg-gray-100">
          <img src="${site.images[0]}" alt="${site.title}" class="w-full h-28 object-cover" />
          <div class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider">
            ${site.propertyType === 'tent' ? 'Palapinė' : site.propertyType === 'glamping' ? 'Glamping' : 'Kemperiai'}
          </div>
          <div class="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white text-amber-500 text-[9px] font-bold border border-gray-200 shadow-2xs">
            ★ ${site.rating}
          </div>
        </div>
        <h4 class="font-bold text-sm text-gray-900 line-clamp-1 mb-0.5">${site.title}</h4>
        <p class="text-[11px] text-gray-500 line-clamp-1 mb-2">${site.location}</p>
        <div class="flex items-center justify-between border-t border-gray-100 pt-2">
          <span class="text-xs font-bold text-emerald-800">€${site.pricePerNight}<span class="text-[10px] font-normal text-gray-500"> / parai</span></span>
          <button id="popup-btn-${site.id}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer">
            Peržiūrėti →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-leaflet-popup'
      });

      marker.on('click', () => {
        onSelectCampsite(site.id);
      });

      popupContent.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest(`[id^="popup-btn-"]`)) {
          onSelectCampsite(site.id);
        }
      });

      markersRef.current[site.id] = marker;
    });

    if (campsites.length > 0 && map) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else if (map) {
      map.setView([55.1694, 23.8813], 7);
    }

  }, [campsites, selectedCampsiteId, hoveredCampsiteId, onSelectCampsite]);

  return (
    <div className="w-full h-full relative min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden border border-[#121212]/15 shadow-sm bg-[#E8E4D9]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Map Legend Badge */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 shadow-md flex items-center gap-2 font-sans">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Interaktyvus žemėlapis</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-[10px] text-gray-500 font-semibold">Rasta stovyklaviečių: {campsites.length}</span>
      </div>
    </div>
  );
};

