import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, Copy, Check, Maximize2, X } from 'lucide-react';

interface ExactLocationMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  addressLine?: string;
  campsiteTitle?: string;
  height?: string;
  className?: string;
}

export const ExactLocationMap: React.FC<ExactLocationMapProps> = ({
  latitude,
  longitude,
  locationName,
  addressLine,
  campsiteTitle,
  height = '240px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Inline map renderer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
    }).setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const exactIcon = L.divIcon({
      className: 'exact-location-pin',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-10 h-10 rounded-full bg-emerald-600/30 animate-pulse"></div>
               <div class="w-9 h-9 rounded-full bg-emerald-700 text-white border-2 border-white shadow-xl flex items-center justify-center font-bold text-sm">
                 📍
               </div>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([latitude, longitude], { icon: exactIcon }).addTo(map);
    
    const popupContent = `
      <div style="font-family: sans-serif; font-size: 12px; font-weight: 700; color: #064e3b; text-align: center; padding: 4px;">
        <div>${campsiteTitle || 'Tiksli Stovyklavietė'}</div>
        <div style="font-size: 10px; color: #4b5563; font-weight: 500; margin-top: 2px;">
          ${addressLine || locationName}
        </div>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();

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
  }, [latitude, longitude, campsiteTitle, addressLine, locationName]);

  // Modal full-screen map renderer
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
    }).setView([latitude, longitude], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(modalMap);

    const exactIcon = L.divIcon({
      className: 'exact-location-pin-modal',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-12 h-12 rounded-full bg-emerald-600/30 animate-pulse"></div>
               <div class="w-10 h-10 rounded-full bg-emerald-700 text-white border-2 border-white shadow-2xl flex items-center justify-center font-bold text-base">
                 📍
               </div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([latitude, longitude], { icon: exactIcon }).addTo(modalMap);
    
    const popupContent = `
      <div style="font-family: sans-serif; font-size: 13px; font-weight: 800; color: #064e3b; text-align: center; padding: 6px;">
        <div>${campsiteTitle || 'Tiksli Stovyklavietė'}</div>
        <div style="font-size: 11px; color: #4b5563; font-weight: 600; margin-top: 3px;">
          ${addressLine || locationName}
        </div>
        <div style="font-size: 10px; color: #059669; font-family: monospace; margin-top: 2px;">
          GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
        </div>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();

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
  }, [isExpanded, latitude, longitude, campsiteTitle, addressLine, locationName]);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}`;

  return (
    <>
      <div className={`relative rounded-2xl overflow-hidden border border-emerald-300 shadow-md font-sans ${className}`}>
        
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          style={{ height }} 
          className="w-full z-0 bg-gray-100"
        />

        {/* Top Address & Actions Bar */}
        <div className="absolute top-2 left-2 right-2 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{addressLine || locationName}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyCoords}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
              <span>{copied ? 'Kopijuota!' : 'GPS'}</span>
            </button>

            {/* Expand Map Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              title="Išskleisti žemėlapį per visą ekraną"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Išskleisti Žemėlapį</span>
            </button>
          </div>
        </div>

        {/* Bottom Nav App Bar */}
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-emerald-950/95 text-white backdrop-blur-md p-2 rounded-xl shadow-lg border border-emerald-800/80 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 pl-1 shrink-0">
            🚗 Naviguoti su:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Waze</span>
              <Navigation className="w-3 h-3" />
            </a>

            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Apple Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Expanded Full-Screen Map Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex flex-col justify-center items-center font-sans animate-fade-in">
          <div className="w-full max-w-5xl h-[88vh] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 flex flex-col relative">
            
            {/* Modal Header Bar */}
            <div className="p-4 bg-emerald-950 text-white border-b border-emerald-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-emerald-700 rounded-xl text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base truncate text-white">
                    {campsiteTitle || 'Tiksli Stovyklavietės Vieta'}
                  </h3>
                  <p className="text-xs text-emerald-200 truncate font-medium">
                    {addressLine || locationName} • GPS: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-850 text-emerald-200 border border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                  <span className="hidden sm:inline">{copied ? 'Kopijuota!' : 'Kopijuoti GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Uždaryti Žemėlapį</span>
                </button>
              </div>
            </div>

            {/* Modal Leaflet Map View */}
            <div ref={modalMapContainerRef} className="w-full flex-1 z-0 bg-gray-100" />

            {/* Modal Footer Navigation Links */}
            <div className="p-3 sm:p-4 bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-emerald-200 font-extrabold uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Atidaryti Navigacijos Programėlėje:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Waze</span>
                  <Navigation className="w-3.5 h-3.5" />
                </a>

                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Apple Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
