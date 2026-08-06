import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldCheck, Navigation } from 'lucide-react';

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
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map centered on location
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
    }).setView([latitude, longitude], 13);

    // Add clean tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Add approximate location privacy circle (800 meters radius)
    const approxCircle = L.circle([latitude, longitude], {
      radius: 800, // Explicit 800m radius
      color: '#059669', // Emerald 600
      weight: 2.5,
      fillColor: '#10b981', // Emerald 500
      fillOpacity: 0.22,
      dashArray: '6, 6'
    }).addTo(map);

    // Auto-fit map viewport to bounds of 800m circle with padding
    try {
      map.fitBounds(approxCircle.getBounds().pad(0.3));
    } catch (err) {
      // Fallback
    }

    // Add central approximate zone marker (soft pulse indicator)
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

    // Ensure proper rendering sizing
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

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-emerald-200/80 bg-emerald-50/30 shadow-2xs font-sans ${className}`}>
      
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full z-0 bg-gray-100"
      />

      {/* Top Floating Badge - Approx Location Info */}
      <div className="absolute top-2 left-2 right-2 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-gray-900 truncate">
            Apytikslė vieta: {locationName}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
          ~800m spindulys
        </span>
      </div>

      {/* Bottom Floating Notice */}
      <div className="absolute bottom-2 left-2 right-2 z-10 bg-gray-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Tikslus įvažiavimo adresas pateikiamas patvirtinus rezervaciją</span>
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
  );
};
