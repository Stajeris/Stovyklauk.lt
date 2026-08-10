import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldCheck, Navigation, Maximize2, X } from 'lucide-react';

interface OrderApproxMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  campsiteTitle?: string;
  height?: string;
  className?: string;
}

export const OrderApproxMap: React.FC<OrderApproxMapProps> = ({
  latitude,
  longitude,
  locationName,
  campsiteTitle,
  height = '180px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Inline Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
    }).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const approxCircle = L.circle([latitude, longitude], {
      radius: 800,
      color: '#059669',
      weight: 2.5,
      fillColor: '#10b981',
      fillOpacity: 0.22,
      dashArray: '6, 6'
    }).addTo(map);

    try {
      map.fitBounds(approxCircle.getBounds().pad(0.3));
    } catch (err) {
      // Fallback
    }

    const customIcon = L.divIcon({
      className: 'approx-map-center-pin',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
               <div class="w-8 h-8 rounded-full bg-emerald-800 text-white border-2 border-white shadow-md flex items-center justify-center font-bold text-xs">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; font-weight: 600; color: #064e3b; text-align: center; padding: 2px;">
        ⛺ Apytikslė sklypo zona (800m spindulys)
      </div>
    `);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  // Modal Full Screen Map
  useEffect(() => {
    if (!isExpanded || !modalMapContainerRef.current) return;

    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove();
      modalMapInstanceRef.current = null;
    }

    const modalMap = L.map(modalMapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    }).setView([latitude, longitude], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(modalMap);

    const approxCircle = L.circle([latitude, longitude], {
      radius: 800,
      color: '#059669',
      weight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.25,
      dashArray: '8, 8'
    }).addTo(modalMap);

    try {
      modalMap.fitBounds(approxCircle.getBounds().pad(0.3));
    } catch (err) {}

    const customIcon = L.divIcon({
      className: 'approx-map-center-pin-modal',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-12 h-12 rounded-full bg-emerald-500/30 animate-pulse"></div>
               <div class="w-10 h-10 rounded-full bg-emerald-800 text-white border-2 border-white shadow-xl flex items-center justify-center font-bold text-sm">
                 ⛺
               </div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(modalMap);
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; font-weight: 700; color: #064e3b; text-align: center; padding: 4px;">
        <div>${campsiteTitle || 'Apytikslė Sklypo Zona'}</div>
        <div style="font-size: 11px; color: #4b5563; font-weight: 500; margin-top: 2px;">
          ${locationName} (~800m spindulys)
        </div>
      </div>
    `).openPopup();

    modalMapInstanceRef.current = modalMap;

    const timer = setTimeout(() => {
      modalMap.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
      }
    };
  }, [isExpanded, latitude, longitude, campsiteTitle, locationName]);

  return (
    <>
      <div className={`relative rounded-2xl overflow-hidden border border-emerald-200/80 bg-emerald-50/30 shadow-2xs font-sans ${className}`}>
        
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          style={{ height }} 
          className="w-full z-0 bg-gray-100"
        />

        {/* Top Floating Badge & Expand Button */}
        <div className="absolute top-2 left-2 right-2 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-gray-900 truncate">
              Apytikslė vieta: {locationName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">
              ~800m spindulys
            </span>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Išskleisti žemėlapį per visą ekraną"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Išskleisti</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Notice */}
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-gray-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Tikslus adresas atveriamas patvirtinus rezervaciją</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1 shrink-0"
          >
            <span>Žemėlapiai</span>
            <Navigation className="w-3 h-3" />
          </a>
        </div>

      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex flex-col justify-center items-center font-sans animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 flex flex-col relative">
            <div className="p-4 bg-emerald-950 text-white border-b border-emerald-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-emerald-700 rounded-xl text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                    {campsiteTitle || 'Apytikslė Sklypo Zona'}
                  </h3>
                  <p className="text-xs text-emerald-200 truncate">
                    {locationName} (~800 m apsauginis spindulys)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <X className="w-4 h-4" />
                <span>Uždaryti Žemėlapį</span>
              </button>
            </div>

            <div ref={modalMapContainerRef} className="w-full flex-1 z-0 bg-gray-100" />
          </div>
        </div>
      )}
    </>
  );
};
