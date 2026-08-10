import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, RefreshCw, User, Image, Link, X } from 'lucide-react';

interface HostPhotoUploaderProps {
  value: string;
  onChange: (newAvatarUrl: string) => void;
  label?: string;
  hostName?: string;
}

const PRESET_HOST_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', label: 'Lina (Gamtos mylėtoja)' },
  { id: '2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', label: 'Mantas (Sodybos šeimininkas)' },
  { id: '3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', label: 'Eglė (Poilsio organizatorė)' },
  { id: '4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', label: 'Vytautas (Stovyklautojas)' },
  { id: '5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', label: 'Agnė (Eko sodyba)' },
];

export const HostPhotoUploader: React.FC<HostPhotoUploaderProps> = ({
  value,
  onChange,
  label = 'Šeimininko Nuotrauka / Avataras',
  hostName = 'Šeimininkas'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState(value && !value.startsWith('data:') ? value : '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection from computer/device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Prašome pasirinkti nuotraukos failą (JPG, PNG, WEBP)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert('Klaida įkeliant nuotrauką. Bandykite kitą failą.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
    }
  };

  const currentAvatar = value || PRESET_HOST_AVATARS[0].url;

  return (
    <div className="space-y-3 font-sans">
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
        {label}
      </label>

      {/* Main Avatar Preview + Controls Layout */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs">
        
        {/* Left Circular Avatar Display with Trigger */}
        <div className="relative shrink-0 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-400/80 shadow-md bg-gray-100 flex items-center justify-center relative">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={hostName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer group-hover:scale-110 active:scale-95"
            title="Įkelti ar pakeisti nuotrauką"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Right Uploader Tabs & Actions */}
        <div className="flex-1 w-full space-y-3 text-xs">
          
          {/* Sub-tabs selection */}
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => setActiveInputTab('upload')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                activeInputTab === 'upload' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Įkelti Iš Įrenginio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('presets')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                activeInputTab === 'presets' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Pavyzdinės Nuotraukos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('url')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                activeInputTab === 'url' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>URL Nuoroda</span>
            </button>
          </div>

          {/* TAB 1: FILE UPLOAD ZONE */}
          {activeInputTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
                  : 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-full">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-xs">
                    Paspauskite arba įtempkite nuotraukos failą čia
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Palaikomi formatai: JPG, PNG, WEBP (rekomenduojama kvadratinė nuotrauka)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET GALLERY */}
          {activeInputTab === 'presets' && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-500 font-bold block">Pasirinkite vieną iš paruoštų profilio nuotraukų:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_HOST_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChange(preset.url)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                      value === preset.url ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-gray-200'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {value === preset.url && (
                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeInputTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Įklijuokite nuotraukos nuorodą (https://...)"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
              >
                Taikyti
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
