import React, { useState } from 'react';
import { 
  X, Upload, Trash2, Plus, Image as ImageIcon, Check, Star, MapPin, 
  DollarSign, Users, AlertCircle, Sparkles, Camera, Shield, Eye
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, PropertyType, CancellationPolicy, TERRAIN_OPTIONS } from '../types';
import { getAmenityConfig } from './AmenityBadge';
import { LocationPickerMap } from './LocationPickerMap';

interface EditCampsiteModalProps {
  campsite: Campsite;
  onClose: () => void;
}

const PRESET_SAMPLE_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80', label: 'Ežero pakrantė' },
  { url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', label: 'Laužavietė vakare' },
  { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80', label: 'Palapinė miške' },
  { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80', label: 'Glampingo palapinė' },
  { url: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&w=800&q=80', label: 'Upės vingis' },
  { url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80', label: 'Žvaigždėtas dangus' },
];

const ALL_AMENITIES = [
  'Laužavietė', 'Geriamas vanduo', 'Pritaikyta augintiniams', 'Šalia vandens', 
  'Žvaigždžių stebėjimui', 'Pikniko stalas', 'Lauko tualetas', 'Elektra', 
  'Karštas dušas', 'Belaidis internetas (Wifi)', 'Baidarių nuoma', 'Pirtis / Kubilas'
];

export const EditCampsiteModal: React.FC<EditCampsiteModalProps> = ({ campsite, onClose }) => {
  const { updateCampsite, deleteCampsite, setView } = useCampsites();

  const [activeTab, setActiveTab] = useState<'photos' | 'details' | 'amenities' | 'rules'>('photos');
  
  // Editable Form State
  const [title, setTitle] = useState(campsite.title);
  const [description, setDescription] = useState(campsite.description);
  const [location, setLocation] = useState(campsite.location);
  const [region, setRegion] = useState(campsite.region);
  const [addressLine, setAddressLine] = useState(campsite.addressLine || '');
  const [postalCode, setPostalCode] = useState(campsite.postalCode || '');
  const [latitude, setLatitude] = useState<number>(campsite.latitude || 55.1694);
  const [longitude, setLongitude] = useState<number>(campsite.longitude || 25.4520);
  const [terrainType, setTerrainType] = useState(campsite.terrainType);
  const [propertyType, setPropertyType] = useState<PropertyType>(campsite.propertyType);
  const [pricePerNight, setPricePerNight] = useState(campsite.pricePerNight);
  const [maxGuests, setMaxGuests] = useState(campsite.maxGuests);
  const [rvMaxLengthFt, setRvMaxLengthFt] = useState(campsite.rvMaxLengthFt || 30);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>(campsite.cancellationPolicy);
  
  // Images state
  const [images, setImages] = useState<string[]>(campsite.images.length > 0 ? campsite.images : [PRESET_SAMPLE_PHOTOS[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(campsite.amenities || []);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [rules, setRules] = useState<string[]>(campsite.rules || ['Nepalikite pėdsakų taisyklių laikymasis', 'Tylos valandos nuo 22:00']);
  const [newRule, setNewRule] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // File Upload Handler (converts files to Data URLs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((fileItem) => {
      const file = fileItem as File;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setImages(prev => [...prev, dataUrl]);
          showToast(`Įkelta nuotrauka: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    showToast('Nuotraukos nuoroda pridėta!');
  };

  const handleAddPresetPhoto = (url: string) => {
    if (images.includes(url)) {
      showToast('Ši nuotrauka jau yra galerijoje');
      return;
    }
    setImages(prev => [...prev, url]);
    showToast('Nuotrauka pridėta iš pavyzdžių!');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Stovyklavietė privalo turėti bent vieną nuotrauką');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    showToast('Nuotrauka pašalinta');
  };

  const handleSetPrimaryImage = (index: number) => {
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([selected, ...rest]);
    showToast('Nuotrauka nustatyta kaip pagrindinė!');
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const trimmed = customAmenityInput.trim();
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities(prev => [...prev, trimmed]);
      showToast(`Pridėtas papildomas patogumas: "${trimmed}"`);
    } else {
      showToast('Šis patogumas jau yra sąraše');
    }
    setCustomAmenityInput('');
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules(prev => [...prev, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCampsite(campsite.id, {
      title,
      description,
      location,
      region,
      addressLine,
      postalCode,
      latitude,
      longitude,
      terrainType,
      propertyType,
      pricePerNight,
      maxGuests,
      rvMaxLengthFt: propertyType === 'rv' ? rvMaxLengthFt : undefined,
      cancellationPolicy,
      images,
      amenities: selectedAmenities,
      rules,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteCampsite(campsite.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 text-xs font-bold font-sans flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl font-sans overflow-hidden border border-gray-100 my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-900">
                Redaguoti stovyklavietę
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {campsite.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setView('detail', campsite.id);
              }}
              className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peržiūrėti puslapį</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-6 gap-2 pt-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Nuotraukos ({images.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pagrindinė informacija & Kaina</span>
          </button>

          <button
            onClick={() => setActiveTab('amenities')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'amenities'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Patogumai ({selectedAmenities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Taisyklės</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: PHOTOS & UPLOAD */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              
              {/* Main File Upload Box */}
              <div className="p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-center space-y-3 relative group cursor-pointer">
                <input
                  id="campsite-photo-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">
                    Įkelkite nuotraukas iš savo įrenginio (Telefonas / Kompiuteris)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Spustelėkite čia arba užvilkite nuotraukų failus (JPG, PNG, WEBP). Galite pasirinkti kelias nuotraukas iš karto.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 pointer-events-none"
                >
                  <Camera className="w-4 h-4" />
                  <span>Pasirinkti nuotraukų failus</span>
                </button>
              </div>

              {/* Paste Image URL Box */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Arba pridėkite nuotrauką pagal internetinę nuorodą (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                  >
                    Pridėti URL
                  </button>
                </div>
              </div>

              {/* Presets Gallery Quick Pick */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Greitas pavyzdinių kokybiškų nuotraukų pasirinkimas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetPhoto(preset.url)}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 h-20 text-left cursor-pointer hover:border-emerald-500 transition-all"
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 p-2 flex items-end justify-between">
                        <span className="text-[10px] font-bold text-white leading-tight">{preset.label}</span>
                        <Plus className="w-4 h-4 text-amber-300 opacity-80 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Gallery Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-gray-900 text-sm">
                    Esamos stovyklavietės nuotraukos ({images.length})
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Pirma nuotrauka yra pagrindinė viršelio nuotrauka
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((imgUrl, index) => (
                    <div 
                      key={index} 
                      className={`relative rounded-2xl overflow-hidden border bg-gray-100 group transition-all ${
                        index === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Nuotrauka ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />

                      {/* Primary Badge */}
                      {index === 0 ? (
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                          ★ Viršelis
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(index)}
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 hover:bg-amber-400 hover:text-emerald-950 text-white text-[9px] font-bold transition-colors cursor-pointer"
                        >
                          Padaryti pagrindine
                        </button>
                      )}

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-transform cursor-pointer"
                        title="Pašalinti nuotrauką"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILS & PRICE */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Stovyklavietės Pavadinimas *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Miestas / Gyvenvietė *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pvz., Molėtų r., Asveja"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Regionas / Apskritis *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pvz., Aukštaitija"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Gatvė ir Namo/Sklypo nr. (Adresas)
                  </label>
                  <input
                    type="text"
                    placeholder="pvz., Ežero g. 14, Asvejos k."
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Pašto kodas
                  </label>
                  <input
                    type="text"
                    placeholder="pvz., LT-33100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                    🗺️ Pažymėkite arba tikslinkite stovyklavietės vietą žemėlapyje
                  </label>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    Spustelėkite žemėlapį arba tempkite smeigtuką
                  </span>
                </div>

                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  height="300px"
                  onChangeLocation={(newLat, newLng, addressDetails) => {
                    setLatitude(newLat);
                    setLongitude(newLng);
                    if (addressDetails) {
                      if (addressDetails.addressLine) setAddressLine(addressDetails.addressLine);
                      if (addressDetails.location && !location) setLocation(addressDetails.location);
                      if (addressDetails.region && !region) setRegion(addressDetails.region);
                      if (addressDetails.postalCode && !postalCode) setPostalCode(addressDetails.postalCode);
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Aprašymas *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Kaina už parą (€) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={500}
                      required
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-extrabold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Maks. svečių skaičius *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                    <Users className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Kategorija / Tipas *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="tent">⛺ Palapinės</option>
                    <option value="glamping">✨ Glampingas</option>
                    <option value="rv">🚐 Kemperiai</option>
                  </select>
                </div>
              </div>

              {propertyType === 'rv' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Maksimalus Kemperio Ilgis (pėdos/metrai)
                  </label>
                  <input
                    type="number"
                    value={rvMaxLengthFt}
                    onChange={(e) => setRvMaxLengthFt(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Kraštovaizdžio Tipas
                  </label>
                  <select
                    value={terrainType}
                    onChange={(e) => setTerrainType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 cursor-pointer"
                  >
                    {TERRAIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    {!TERRAIN_OPTIONS.includes(terrainType as any) && (
                      <option value={terrainType}>
                        {terrainType}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Atšaukimo Taisyklė
                  </label>
                  <select
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value as CancellationPolicy)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900"
                  >
                    <option value="flexible">Lanksti (Full refund 24h prior)</option>
                    <option value="moderate">Vidutinė (Full refund 3d prior)</option>
                    <option value="strict">Griežta (50% refund 7d prior)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AMENITIES */}
          {activeTab === 'amenities' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  Pasirinkite stovyklavietės patogumus
                </h4>
                <p className="text-xs text-gray-500">
                  Pažymėkite standartinius patogumus arba įveskite savo papildomus patogumus.
                </p>
              </div>

              {/* Standard Amenities */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {ALL_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  const config = getAmenityConfig(amenity);
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg ${config.iconBg} shrink-0`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{amenity}</span>
                      </div>
                      {isChecked ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-1">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0 ml-1"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Additional Amenities Field */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    ➕ Pridėti papildomą (individualų) patogumą
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Įveskite bet kokį kitą unikalų patogumą (pvz., „SUP lentos“, „Grilis“, „Tinklinio aikštelė“, „Lauko žaidimai“).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="pvz., SUP lentos ir Pirtis"
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Pridėti</span>
                    </button>
                  </div>
                </div>

                {/* Selected Custom Amenities List */}
                {selectedAmenities.filter(a => !ALL_AMENITIES.includes(a)).length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Jūsų pridėti papildomi patogumai:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities
                        .filter(a => !ALL_AMENITIES.includes(a))
                        .map((customAm) => (
                          <span
                            key={customAm}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold border border-amber-200"
                          >
                            <span>✨ {customAm}</span>
                            <button
                              type="button"
                              onClick={() => toggleAmenity(customAm)}
                              className="text-amber-800 hover:text-rose-600 p-0.5 rounded-full hover:bg-amber-200 transition-colors"
                              title="Pašalinti patogumą"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  Stovyklavietės taisyklės svečiams
                </h4>
                <p className="text-xs text-gray-500">
                  Nustatykite elgesio taisykles savo teritorijoje.
                </p>
              </div>

              <div className="space-y-2">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-medium">
                    <span>• {rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-gray-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Nauja taisyklė (pvz., Tylos valandos nuo 23 val.)"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  Pridėti
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 border-t border-gray-150 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-rose-700">Tikrai ištrinti?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                Taip, Ištrinti
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Ne
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Ištrinti šią stovyklavietę</span>
            </button>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              Atšaukti
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Išsaugoti pakeitimus</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
