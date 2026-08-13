import React, { useState } from 'react';
import { X, Search, Key, CheckCircle2, Calendar, MapPin, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Booking } from '../types';

interface GuestPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking?: (booking: Booking) => void;
}

export const GuestPortalModal: React.FC<GuestPortalModalProps> = ({
  isOpen,
  onClose,
  onSelectBooking
}) => {
  const { lookupBookingByCode, setView } = useCampsites();
  const [searchInput, setSearchInput] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = lookupBookingByCode(searchInput);
    if (result) {
      setFoundBooking(result);
    } else {
      setFoundBooking(null);
      setErrorMsg('Užsakymas nerastas. Patikrinkite įvestą kodą (pvz., BK-100) arba el. paštą.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Svečių Užsakymo Portalas</h2>
              <p className="text-xs text-emerald-200 mt-0.5">Ieškokite užsakymo pagal kodo nr. be registracijos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-emerald-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              Įveskite užsakymo kodo numerį (pvz., BK-100, BK-102) arba el. paštą:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="BK-100 arba giedrius@example.com"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Ieškoti</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {foundBooking && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                    KODAS: {foundBooking.accessCode || foundBooking.id}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{foundBooking.campsiteTitle}</span>
                </div>
                <span className="text-xs font-black text-emerald-800">€{foundBooking.totalPrice}</span>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{foundBooking.checkIn} — {foundBooking.checkOut} ({foundBooking.totalNights} nakt.)</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{foundBooking.guestName} ({foundBooking.guestEmail})</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{foundBooking.location}</span>
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (onSelectBooking) onSelectBooking(foundBooking);
                    setView('my-trips');
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Atverti Užsakymą</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
