import React, { useState } from 'react';
import { 
  Tent, Sparkles, Trees, DollarSign, MapPin, CheckCircle, ArrowRight, 
  ArrowLeft, Plus, Image as ImageIcon, ShieldAlert, Check, Clock, User, Phone, Mail, FileText, Crown, Zap 
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { PropertyType, CancellationPolicy, TERRAIN_OPTIONS } from '../types';
import { getAmenityConfig } from './AmenityBadge';
import { LocationPickerMap } from './LocationPickerMap';
import { HostVerificationSection } from './HostVerificationSection';
import { HostPhotoUploader } from './HostPhotoUploader';

export const AddListingWizard: React.FC = () => {
  const { registerHostAndAddCampsite, currentUser, setView, campsites, hostTier, setHostTier } = useCampsites();

  const userCampsites = campsites.filter(
    c => c.host?.id === currentUser.id || 
         c.host?.name?.toLowerCase() === currentUser.name?.toLowerCase() ||
         (c.host as any)?.email === currentUser.email
  );

  const isFreeTierLimitReached = hostTier === 'free' && userCampsites.length >= 1;

  const [step, setStep] = useState(1);

  // Host User Registration Inputs
  const [hostName, setHostName] = useState(currentUser.isAdmin ? '' : currentUser.name);
  const [hostEmail, setHostEmail] = useState(currentUser.isAdmin ? '' : currentUser.email);
  const [hostPhone, setHostPhone] = useState(currentUser.phone || '');
  const [hostBio, setHostBio] = useState(currentUser.bio || '');
  const [hostAvatar, setHostAvatar] = useState(currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [arrivalInstructions, setArrivalInstructions] = useState('');
  const [latitude, setLatitude] = useState<number>(55.1694);
  const [longitude, setLongitude] = useState<number>(25.4520);
  const [terrainType, setTerrainType] = useState<string>(TERRAIN_OPTIONS[0]);
  const [propertyType, setPropertyType] = useState<PropertyType>('tent');
  const [hasCleaningFee, setHasCleaningFee] = useState<boolean>(false);
  const [cleaningFee, setCleaningFee] = useState<number>(15);
  const [pricePerNight, setPricePerNight] = useState(25);
  const [maxGuests, setMaxGuests] = useState(4);
  const [rvMaxLengthFt, setRvMaxLengthFt] = useState(30);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('flexible');
  const [imagesList, setImagesList] = useState<string[]>([
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80'
  ]);
  const [customUrlInput, setCustomUrlInput] = useState('');

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
          setImagesList(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImagesList(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  // Amenities Selection
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Laužavietė', 'Geriamas vanduo', 'Pritaikyta augintiniams', 'Pikniko stalas'
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const trimmed = customAmenityInput.trim();
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities(prev => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
  };

  const allAvailableAmenities = [
    'Laužavietė', 'Geriamas vanduo', 'Pritaikyta augintiniams', 'Šalia vandens', 'Žvaigždžių stebėjimui', 
    'Pikniko stalas', 'Lauko tualetas', 'Elektra', 'Karštas dušas', 'Belaidis internetas (Wifi)', 'Baidarių nuoma'
  ];

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [createdCampsiteId, setCreatedCampsiteId] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleRegisterAndProceedToStep4 = () => {
    const newCamp = registerHostAndAddCampsite(
      {
        name: hostName.trim() || 'Naujas Šeimininkas',
        email: hostEmail.trim() || 'seimininkas@stovyklauk.lt',
        phone: hostPhone.trim() || '+370 600 00000',
        avatar: hostAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: hostBio.trim() || 'Gamtos ir sodybos sklypo šeimininkas.',
      },
      {
        title: title || 'Privatus gamtos prieglobstis',
        description: description || 'Gražus ir privatus sklypas gamtos apsuptyje prie upės.',
        location: location || 'Aukštaitijos nac. parkas, Ignalinos r.',
        region: region || 'Aukštaitija',
        addressLine: addressLine || undefined,
        postalCode: postalCode || undefined,
        arrivalInstructions: arrivalInstructions.trim() || undefined,
        latitude,
        longitude,
        pricePerNight,
        hasCleaningFee,
        cleaningFee: hasCleaningFee ? cleaningFee : 0,
        propertyType,
        maxGuests,
        rvMaxLengthFt: propertyType === 'rv' ? rvMaxLengthFt : undefined,
        images: imagesList.length > 0 ? imagesList : [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: selectedAmenities,
        cancellationPolicy,
        terrainType,
        featured: true,
        rules: [
          'Nepalikite pėdsakų taisyklių laikymasis',
          'Tylos valandos nuo 22:00 val.',
          'Kūrenti ugnį tik numatytoje laužavietėje'
        ],
        status: 'approved'
      }
    );

    if (newCamp) {
      setCreatedCampsiteId(newCamp.id);
    }
    setIsSubmitted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleRegisterAndProceedToStep4();
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div id="add-listing-submitted" className="max-w-2xl mx-auto my-12 px-6 py-12 bg-white rounded-3xl shadow-xl border border-gray-100 text-center font-sans space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wide border border-emerald-200">
            🎉 Nauja Šeimininko Paskyra Sukurta
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sveikiname, {hostName || 'Naujas Šeimininke'}!
          </h2>
          <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
            Jūsų nauja šeimininko paskyra ir skelbimas <strong>"{title || 'Privatus gamtos prieglobstis'}"</strong> sėkmingai užregistruoti! Jums suteikta dedikuota šeimininko aplinka. Jūs matote tik savo asmeninį skydą ir viešus puslapius.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left max-w-lg mx-auto text-xs text-emerald-900 space-y-3">
          <div className="font-bold flex items-center gap-2 text-emerald-950 text-sm">
            <User className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Paskyros ir Prieigos informacija:</span>
          </div>
          <ul className="space-y-1.5 text-emerald-900">
            <li>• <strong>Vartotojas:</strong> {hostName || 'Naujas Šeimininkas'} ({hostEmail || 'seimininkas@stovyklauk.lt'})</li>
            <li>• <strong>Būsena:</strong> Aktyvus Registruotas Šeimininkas (Prijungta)</li>
            <li>• <strong>Prieiga:</strong> Dedikuotas Šeimininko Valdymo Skydas & Viešosios svetainės dalys</li>
            <li>• <strong>Platformos Admin:</strong> Nepasiekiamas (Saugus atskyrimas)</li>
          </ul>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setView('host-dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Atidaryti Savo Šeimininko Valdymo Skydą</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="add-listing-page" className="max-w-3xl mx-auto px-4 py-8 space-y-8 bg-gray-50">
      
      {/* Header */}
      <div className="space-y-2 text-center font-sans">
        <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
          Naujo Vartotojo / Šeimininko Registracija
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Registruokite naują vartotoją ir stovyklavietę
        </h1>
        <p className="text-gray-500 text-xs max-w-xl mx-auto">
          Įveskite šeimininko paskyros duomenis ir objekto informaciją. Sukūrus skelbimą, būsite prijungti prie asmeninio šeimininko valdymo skydo.
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 font-sans">
        {[
          { num: 1, label: 'Šeimininkas ir Objektas' },
          { num: 2, label: 'Kaina ir Patogumai' },
          { num: 3, label: 'Taisyklės ir Nuotraukos' },
          { num: 4, label: 'Verifikacija ir Publikavimas' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === s.num
                ? 'bg-emerald-600 text-white shadow-xs'
                : step > s.num
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${step === s.num ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Free Tier Limit Warning Banner */}
      {isFreeTierLimitReached && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-100/40 border-2 border-amber-400 font-sans space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-xs">
              <Crown className="w-6 h-6 fill-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] uppercase tracking-wider">
                  Nemokamos Versijos Limitas
                </span>
                <span className="text-amber-800 text-xs font-bold">Max 1 sklypas per šeimininką</span>
              </div>
              <h3 className="font-black text-lg text-gray-900">
                Nemokamoje (Bazinėje) versijoje galite valdyti tik 1 objektą
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Jūs jau turite užregistravę 1 sklypą <strong>„{userCampsites[0]?.title || 'Mano stovyklavietė'}“</strong>. Norėdami registruoti ir valdyti <strong>kelis sklypus (2 ar daugiau objektų)</strong>, aktyvuokite <strong>PRO paketą</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-gray-900 block">PRO Mėnesinio Mokesčio Taisyklė:</span>
              <span className="text-amber-900 font-extrabold">
                1 nakvynės kaina per mėnesį užeinamam sklypui
              </span>
              <p className="text-[11px] text-gray-500">
                Šiam naujam sklypui bei kitiems objektams PRO mokestis bus: <strong>€{pricePerNight} / mėn.</strong> (pagal nustatytą €{pricePerNight}/naktį kainą).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHostTier('pro')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Aktivuoti PRO paketą ir Tęsti</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Wizard Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-md space-y-6">
        
        {/* STEP 1: HOST USER PROFILE & PROPERTY INFO */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            
            {/* Host Registration Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Naujo Šeimininko (Vartotojo) Registracijos Duomenys</h3>
                  <p className="text-[11px] text-gray-500">Šie duomenys sukurs dedikuotą šeimininko paskyrą.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Šeimininko Vardas ir Pavardė *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pvz., Vytautas Petrauskas"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    El. Pašto Adresas *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pvz., vytautas@sodyba.lt"
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Telefono Numeris
                  </label>
                  <input
                    type="tel"
                    placeholder="pvz., +370 688 12345"
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

              </div>

              {/* Host Photo / Avatar Upload Section */}
              <HostPhotoUploader
                value={hostAvatar}
                onChange={setHostAvatar}
                hostName={hostName || 'Naujas Šeimininkas'}
                label="Šeimininko Nuotrauka / Profilio Avataras (Galima Įkelti Iš Įrenginio)"
              />

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Apie Šeimininką (Trumpa Biografija)
                </label>
                <textarea
                  rows={2}
                  placeholder="Aprašykite save: pvz., Užupio sodybos šeimininkas, mylintis gamtą ir žvejybą..."
                  value={hostBio}
                  onChange={(e) => setHostBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">Stovyklavietės / Objekto Informacija</h2>
                <p className="text-xs text-gray-500">Suteikite savo sklypui ar nameliui patrauklų pavadinimą ir aprašykite jį.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Stovyklavietės Pavadinimas *</label>
                <input
                  type="text"
                  required
                  placeholder="pvz., Pušyno Pieva ir Žvaigždžių Stebėjimo Vieta"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Miestas / Gyvenvietė *</label>
                  <input
                    type="text"
                    required
                    placeholder="pvz., Ignalinos r., Palūšė"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Regionas / Apskritis *</label>
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
                    placeholder="pvz., Lūšių g. 12, Palūšės k."
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
                    placeholder="pvz., LT-30202"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                    🗺️ Pažymėkite tikslią stovyklavietės vietą žemėlapyje *
                  </label>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    Spustelėkite žemėlapį arba naudokite paiešką
                  </span>
                </div>

                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  height="320px"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Išsamus Aprašymas *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Aprašykite, kuo jūsų vieta išskirtinė, kokia aplinka, privažiavimas, vandens telkiniai..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Kraštovaizdžio Tipas *</label>
                <select
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  {TERRAIN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Tęsti į 2 žingsnį</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROPERTY TYPE & PRICE */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200 font-sans">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">2 Žingsnis: Tipas ir Kaina</h2>
              <p className="text-xs text-gray-500">Pasirinkite apgyvendinimo tipą bei nakvynės kainą.</p>
            </div>

            {/* Property Type Radio Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'tent', label: 'Palapinė', icon: Tent },
                { id: 'glamping', label: 'Glamping Namelis', icon: Sparkles },
                { id: 'rv', label: 'Kemperis', icon: Trees },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const newType = item.id as PropertyType;
                      setPropertyType(newType);
                    }}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      propertyType === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Price per night */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Nakvynės kaina (€)</label>
                <span className="text-2xl font-black text-emerald-900">€{pricePerNight} / parai</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-emerald-800">
                Su 0% Šeimininko mokesčiu, jūs gaunate visus €{pricePerNight} už kiekvieną nakvynę!
              </p>
            </div>

            {/* Valymo ir Paruošimo Mokestis (Cleaning Fee Toggle) */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 font-sans shadow-2xs">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasCleaningFee}
                  onChange={(e) => setHasCleaningFee(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-extrabold text-gray-900 block">
                    Taikyti valymo ir paruošimo mokestį
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium leading-relaxed block mt-0.5">
                    Pagal nutylėjimą šis mokestis taikomas tik Kemperių nuomai, bet galite pažymėti ir įvesti kainą bet kuriam objektui.
                  </span>
                </div>
              </label>

              {hasCleaningFee && (
                <div className="pt-2 border-t border-gray-150 flex items-center justify-between gap-4">
                  <label className="text-xs font-bold text-gray-700">Valymo / paruošimo mokesčio suma (€):</label>
                  <div className="relative w-32">
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={cleaningFee}
                      onChange={(e) => setCleaningFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-extrabold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Maks. svečių skaičius</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {propertyType === 'rv' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Maks. kemperio ilgis (m)</label>
                  <input
                    type="number"
                    min={4}
                    max={15}
                    value={rvMaxLengthFt}
                    onChange={(e) => setRvMaxLengthFt(parseInt(e.target.value) || 8)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Amenities Selector */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pasirinkite teikiamus patogumus</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allAvailableAmenities.map(am => {
                  const isSelected = selectedAmenities.includes(am);
                  const config = getAmenityConfig(am);
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1 rounded-md ${config.iconBg} shrink-0`}>
                          <IconComponent className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="truncate">{am}</span>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ml-1 ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Additional Amenity Input */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  ➕ Pridėti savo papildomą patogumą
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="pvz., SUP lentos, Pirtelė, Tinklinis, Grilis..."
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                  >
                    Pridėti
                  </button>
                </div>

                {/* Selected Custom Amenities Pills */}
                {selectedAmenities.filter(a => !allAvailableAmenities.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedAmenities
                      .filter(a => !allAvailableAmenities.includes(a))
                      .map((customAm) => (
                        <span
                          key={customAm}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold border border-amber-200"
                        >
                          <span>✨ {customAm}</span>
                          <button
                            type="button"
                            onClick={() => toggleAmenity(customAm)}
                            className="text-amber-800 hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atgal</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Tęsti į 3 žingsnį</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CANCELLATION POLICY & PUBLISH */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200 font-sans">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">3 Žingsnis: Atšaukimo Taisyklės ir Nuotraukos</h2>
              <p className="text-xs text-gray-500">Pasirinkite atšaukimo sąlygas ir peržiūrėkite skelbimą prieš publikuojant.</p>
            </div>

            {/* Cancellation Policy Cards */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pasirinkite atšaukimo taisyklę *</label>
              {[
                { id: 'flexible', name: 'Lanksčios taisyklės', desc: '100% grąžinimas likus 24h iki atvykimo.' },
                { id: 'moderate', name: 'Vidutinės taisyklės', desc: '100% grąžinimas likus 5 d. iki atvykimo.' },
                { id: 'strict', name: 'Griežtos taisyklės', desc: '50% grąžinimas likus 7 d. iki atvykimo.' },
              ].map(pol => (
                <div
                  key={pol.id}
                  onClick={() => setCancellationPolicy(pol.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    cancellationPolicy === pol.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{pol.name}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white bg-emerald-700 px-2.5 py-0.5 rounded-full">
                      {pol.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pol.desc}</p>
                </div>
              ))}
            </div>

            {/* Photo Upload & Gallery */}
            <div className="space-y-4 pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Stovyklavietės Nuotraukos ({imagesList.length}) *</label>

              {/* Upload Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-center space-y-2 relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-xs">Įkelkite nuotraukas iš įrenginio (Telefonas / Kompiuteris)</h4>
                  <p className="text-[10px] text-gray-500">Spustelėkite arba užvilkite nuotraukų failus</p>
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Arba įveskite nuotraukos URL..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                >
                  Pridėti URL
                </button>
              </div>

              {/* Photos Grid Preview */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {imagesList.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 h-24 group">
                    <img src={img} alt={`Nuotrauka ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-emerald-950 text-[8px] font-extrabold uppercase">
                        Viršelis
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImagesList(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-80 hover:opacity-100 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atgal</span>
              </button>
              <button
                type="button"
                onClick={handleRegisterAndProceedToStep4}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Paskelbti ir Aktyvuoti Skelbimą</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: HOST VERIFICATION & AUTO-APPROVAL */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase border border-emerald-300">
                Paskutinis Etapas (4 Žingsnis) — Pateiktas Naujas Šeimininkas
              </span>
              <h2 className="text-2xl font-bold text-gray-900">4 Žingsnis: Verifikacija SMS / El. Paštu ir Automatinis Patvirtinimas</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Jūsų skelbimas <strong>„{title || 'Privatus gamtos prieglobstis'}“</strong> sėkmingai pateiktas! Įveskite SMS arba el. pašto verifikacijos kodą žemiau. Įvedus kodą, skelbimas bus <strong>AUTOMATIŠKAI PATVIRTINTAS (Auto-Approved)</strong> ir iškart taps matomas žemėlapyje.
              </p>
            </div>

            {/* Verification Module with OTP code entry */}
            <HostVerificationSection onVerificationSuccess={() => {}} />

            {/* Listing Summary Preview Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200/80 space-y-3">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span>📋 Pateikto Skelbimo Suvestinė</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-800 bg-white p-4 rounded-xl border border-emerald-100">
                <div>
                  <span className="font-bold text-gray-500 block">Pavadinimas:</span>
                  <span className="font-bold text-gray-900">{title || 'Privatus gamtos prieglobstis'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Vietovė:</span>
                  <span className="font-bold text-gray-900">{location || 'Lietuva'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Kaina už naktį:</span>
                  <span className="font-black text-emerald-800">€{pricePerNight} / naktį</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Šeimininkas:</span>
                  <span className="font-bold text-gray-900">{hostName || currentUser.name} ({hostEmail || currentUser.email})</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-150">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atgal į 3 žingsnį</span>
              </button>
              
              <button
                type="submit"
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Baigti ir Atidaryti Šeimininko Skydą</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};

