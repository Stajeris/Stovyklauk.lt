import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, Check, Loader2, Sparkles, Crosshair } from 'lucide-react';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onChangeLocation: (
    lat: number,
    lng: number,
    addressDetails?: {
      addressLine?: string;
      location?: string;
      region?: string;
      postalCode?: string;
    }
  ) => void;
  height?: string;
  showSearch?: boolean;
  className?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude = 55.1694,
  longitude = 23.8813,
  onChangeLocation,
  height = '340px',
  showSearch = true,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState<number>(latitude && latitude !== 0 ? latitude : 55.1694);
  const [currentLng, setCurrentLng] = useState<number>(longitude && longitude !== 0 ? longitude : 23.8813);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  // Synchronize internal state if props change from outside
  useEffect(() => {
    if (latitude && longitude && (latitude !== currentLat || longitude !== currentLng)) {
      setCurrentLat(latitude);
      setCurrentLng(longitude);
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.panTo([latitude, longitude]);
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // Reverse geocode lat/lng to get address details via Nominatim
  const performReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'lt' } }
      );
      if (!res.ok) throw new Error('Geocoding service unavailable');
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.suburb || addr.hamlet || '';
        const houseNum = addr.house_number || '';
        const addressLine = road ? `${road} ${houseNum}`.trim() : (data.name || '');

        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const postalCode = addr.postcode || '';

        // Determine Lithuanian Region
        let region = 'Aukštaitija';
        const fullAddrStr = (data.display_name || '').toLowerCase();
        if (fullAddrStr.includes('klaipėd') || fullAddrStr.includes('palang') || fullAddrStr.includes('nering') || fullAddrStr.includes('šilut')) {
          region = 'Pajūris';
        } else if (fullAddrStr.includes('varėn') || fullAddrStr.includes('druskinink') || fullAddrStr.includes('alyt') || fullAddrStr.includes('lazdij')) {
          region = 'Dzūkija';
        } else if (fullAddrStr.includes('telši') || fullAddrStr.includes('plung') || fullAddrStr.includes('mažeik') || fullAddrStr.includes('taurag')) {
          region = 'Žemaitija';
        } else if (fullAddrStr.includes('marijampol') || fullAddrStr.includes('vilkavišk') || fullAddrStr.includes('šaki')) {
          region = 'Suvalkija';
        }

        const formatted = [addressLine, city, postalCode].filter(Boolean).join(', ');
        setDetectedAddress(formatted || data.display_name);

        onChangeLocation(lat, lng, {
          addressLine: addressLine || undefined,
          location: city || undefined,
          region: region,
          postalCode: postalCode || undefined,
        });
      } else {
        onChangeLocation(lat, lng);
      }
    } catch (e) {
      console.warn('Geocoding failed, keeping raw coordinates:', e);
      onChangeLocation(lat, lng);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not existing
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([currentLat, currentLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const customPinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div class="relative group cursor-grab active:cursor-grabbing">
            <div class="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="w-3 h-3 bg-emerald-950/40 rounded-full blur-xs absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      // Drag event
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        const lat = parseFloat(newLatLng.lat.toFixed(5));
        const lng = parseFloat(newLatLng.lng.toFixed(5));
        setCurrentLat(lat);
        setCurrentLng(lng);
        performReverseGeocode(lat, lng);
      });

      // Click event on map to place pin
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(5));
        const lng = parseFloat(e.latlng.lng.toFixed(5));
        setCurrentLat(lat);
        setCurrentLng(lng);
        marker.setLatLng([lat, lng]);
        performReverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    const map = mapInstanceRef.current;
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, []);

  // Update marker position on map when internal state updates
  const handlePointSelect = (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
      markerRef.current.setLatLng([lat, lng]);
    }
    performReverseGeocode(lat, lng);
  };

  // Address search query submit
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = searchQuery.includes('Lietuva') ? searchQuery : `${searchQuery}, Lietuva`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=lt&limit=1`,
        { headers: { 'Accept-Language': 'lt' } }
      );
      if (!res.ok) throw new Error('Search failed');
      const results = await res.json();
      if (results && results.length > 0) {
        const lat = parseFloat(parseFloat(results[0].lat).toFixed(5));
        const lng = parseFloat(parseFloat(results[0].lon).toFixed(5));
        handlePointSelect(lat, lng);
      } else {
        alert('Atsiprašome, pagal šį paieškos žodį vieta Lietuvoje nerasta. Pabandykite paspausti tiesiogiai žemėlapyje.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Center on default Lithuania center
  const handleResetLithuania = () => {
    handlePointSelect(55.1694, 25.4520);
  };

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      
      {/* Top Search & Actions Bar */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ieškoti adreso, ežero ar vietovės (pvz., Palūšė, Ignalina)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Ieškoti</span>}
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetLithuania}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
            title="Centruoti Lietuvos viduryje"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
            <span>Centruoti</span>
          </button>
        </div>
      )}

      {/* Map Container Frame */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600/30 shadow-md">
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="w-full bg-gray-100 z-0"
        />

        {/* Floating Instruction Banner */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 pointer-events-none">
          <div className="bg-emerald-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-2 rounded-xl border border-emerald-700/50 shadow-lg flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
            <span>Spustelėkite žemėlapyje arba tempkite smeigtuką, kad pažymėtumėte vietą!</span>
          </div>
        </div>

        {/* Loading overlay for geocoding */}
        {isGeocoding && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-emerald-200 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>Nustatomas tikslus adresas...</span>
          </div>
        )}
      </div>

      {/* Location Details Output Pill */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pažymėtos vietos koordinatės:</span>
          </div>
          <span className="font-mono text-[11px] font-extrabold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>

        {detectedAddress && (
          <p className="text-emerald-900 text-xs font-semibold pl-5 pt-0.5">
            📍 Atpažintas adresas: <strong className="text-emerald-950">{detectedAddress}</strong>
          </p>
        )}
      </div>

    </div>
  );
};
