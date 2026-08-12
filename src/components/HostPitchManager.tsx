import React, { useState } from 'react';
import { Tent, Zap, Users, Plus, Trash2, CheckCircle, DollarSign, Sparkles, Crown, Edit3, X, AlertCircle } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, Pitch } from '../types';

interface HostPitchManagerProps {
  campsite: Campsite;
}

export const HostPitchManager: React.FC<HostPitchManagerProps> = ({ campsite }) => {
  const { addPitch, updatePitch, deletePitch } = useCampsites();

  const [isAdding, setIsAdding] = useState(false);
  const [editingPitchId, setEditingPitchId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'tent' | 'camper' | 'glamping' | 'cabin'>('tent');
  const [basePrice, setBasePrice] = useState<number>(campsite.pricePerNight || 25);
  const [maxGuests, setMaxGuests] = useState<number>(4);
  const [hasElectricity, setHasElectricity] = useState<boolean>(true);
  const [description, setDescription] = useState('');

  const pitches = campsite.pitches || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPitch(campsite.id, {
      name,
      type,
      basePrice: Number(basePrice),
      maxGuests: Number(maxGuests),
      hasElectricity,
      description,
      status: 'active',
      blockedDates: []
    });

    // Reset
    setName('');
    setDescription('');
    setIsAdding(false);
  };

  const startEdit = (p: Pitch) => {
    setEditingPitchId(p.id);
    setName(p.name);
    setType(p.type);
    setBasePrice(p.basePrice);
    setMaxGuests(p.maxGuests);
    setHasElectricity(p.hasElectricity);
    setDescription(p.description || '');
  };

  const handleUpdate = (pitchId: string, e: React.FormEvent) => {
    e.preventDefault();
    updatePitch(campsite.id, pitchId, {
      name,
      type,
      basePrice: Number(basePrice),
      maxGuests: Number(maxGuests),
      hasElectricity,
      description
    });
    setEditingPitchId(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
              <Tent className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-xl text-stone-900 flex items-center gap-2">
                <span>Atskirų Aikštelių (Pitch-Level) Inventory</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-700" />
                  <span>PRO Funkcija</span>
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Valdykite konkrečias palapinių, kemperių ar glampingo vietas stovyklavietėje „{campsite.title}“.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingPitchId(null);
            setName('');
            setDescription('');
          }}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Atšaukti' : 'Pridėti naują aikštelę (Pitch)'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Naujos Aikštelės Registravimas</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Aikštelės Pavadinimas *
              </label>
              <input
                type="text"
                required
                placeholder="Pvz.: Vieta A - Su elektra ant ežero kranto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Tipas
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="tent">⛺ Palapinės vieta</option>
                <option value="camper">🚐 Kemperio aikštelė</option>
                <option value="glamping">🏕️ Glampingo palapinė</option>
                <option value="cabin">🏡 Namelis / Kupolas</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Bazinė Paros Kaina (€)
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Maks. Asmenų Skaičius
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-stone-800">
                <input
                  type="checkbox"
                  checked={hasElectricity}
                  onChange={(e) => setHasElectricity(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Elektros įvadas yra</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
              Papildomas Aprašymas
            </label>
            <input
              type="text"
              placeholder="Pvz.: Šalia laužavietės ir medinio stalo su suolais."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-xl text-xs hover:bg-stone-300 transition cursor-pointer"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-800 transition shadow-sm cursor-pointer"
            >
              Išsaugoti Aikštelę
            </button>
          </div>
        </form>
      )}

      {/* Pitch List */}
      {pitches.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <Tent className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-extrabold text-stone-800 text-sm">Nėra įvestų atskirų aikštelių</h4>
          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
            Pagal nutylėjimą užsakymai daromi visai stovyklavietei. Jei turite kelias vietas (pvz. Palapinė A, Kemperis B), pridėkite jas čia!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pitches.map((p) => {
            const isEditing = editingPitchId === p.id;

            if (isEditing) {
              return (
                <form
                  key={p.id}
                  onSubmit={(e) => handleUpdate(p.id, e)}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3 font-sans col-span-1 md:col-span-2 lg:col-span-3"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-amber-950 text-xs">Redaguoti aikštelę: {p.name}</h5>
                    <button type="button" onClick={() => setEditingPitchId(null)} className="text-stone-400 hover:text-stone-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold"
                    />
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPitchId(null)}
                      className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg"
                    >
                      Atšaukti
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-700 text-white text-xs font-extrabold rounded-lg hover:bg-amber-800"
                    >
                      Atnaujinti
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={p.id} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {p.type === 'tent' ? '⛺ Palapinė' : p.type === 'camper' ? '🚐 Kemperis' : p.type === 'glamping' ? '🏕️ Glampingas' : '🏡 Namelis'}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-sm mt-1">{p.name}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-emerald-800">€{p.basePrice}</span>
                      <span className="text-[10px] text-stone-400 font-bold block">/ parai</span>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-stone-600 text-xs leading-snug line-clamp-2">{p.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-stone-700">
                    <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                      <Users className="w-3.5 h-3.5 text-stone-500" />
                      <span>Max {p.maxGuests} sveč.</span>
                    </span>
                    {p.hasElectricity && (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Elektra</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Laisva rezervacijoms</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      title="Redaguoti"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Ar tikrai norite ištrinti aikštelę "${p.name}"?`)) {
                          deletePitch(campsite.id, p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Ištrinti"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
