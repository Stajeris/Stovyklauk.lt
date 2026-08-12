import React, { useState } from 'react';
import { Sparkles, Calendar, DollarSign, Plus, Trash2, Crown, Info, CheckCircle2, TrendingUp, Zap, X } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Campsite, SeasonalPriceRule } from '../types';

interface HostSeasonalPricingManagerProps {
  campsite: Campsite;
}

export const HostSeasonalPricingManager: React.FC<HostSeasonalPricingManagerProps> = ({ campsite }) => {
  const { addSeasonalRule, deleteSeasonalRule } = useCampsites();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('2026-06-20');
  const [endDate, setEndDate] = useState('2026-06-24');
  const [ruleType, setRuleType] = useState<'fixed_override' | 'multiplier'>('multiplier');
  const [value, setValue] = useState<number>(1.3); // 30% surge price
  const [minimumNights, setMinimumNights] = useState<number>(2);

  const seasonalRules = campsite.seasonalRules || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    addSeasonalRule(campsite.id, {
      name,
      startDate,
      endDate,
      pricePerNight: ruleType === 'fixed_override' ? Number(value) : undefined,
      multiplier: ruleType === 'multiplier' ? Number(value) : undefined,
      minimumNights: Number(minimumNights)
    });

    setName('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-xl text-stone-900 flex items-center gap-2">
                <span>Dinaminė Kainodara ir Sezoninės Taisyklės</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-700" />
                  <span>PRO Planas</span>
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Nustatykite didesnes kainas Joninėms ar vasaros savaitgaliams ir taikykite ilgalaikės viešnagės (7+ naktų) nuolaidas.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Atšaukti' : 'Sukurti sezoninę taisyklę'}</span>
        </button>
      </div>

      {/* Global Long Stay Discount Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-black text-emerald-950 text-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Automatinė Ilgalaikės Viešnagės Nuolaida (7+ Naktys)</span>
          </div>
          <p className="text-emerald-900 font-medium leading-relaxed text-[11px]">
            Svečiams, užsisakantiems 7 ar daugiau naktų, sistema automatiškai pritaiko <strong>10% nuolaidą</strong> bendrai nakvynių sumai.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-700 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shrink-0 self-start sm:self-center">
          ✅ Aktyvuota Sistema
        </span>
      </div>

      {/* Create Rule Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-4 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Nauja Sezoninės Kainodaros Taisyklė</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Taisyklės Pavadinimas *
              </label>
              <input
                type="text"
                required
                placeholder="Pvz.: Joninių Sūkurys / Vasaros Pikis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Nuo Datos
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Iki Datos
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Kainos Koragavimo Tipas
              </label>
              <select
                value={ruleType}
                onChange={(e) => {
                  const t = e.target.value as 'fixed_override' | 'multiplier';
                  setRuleType(t);
                  setValue(t === 'multiplier' ? 1.3 : 45);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="multiplier">📈 Koeficientas (pvz. 1.30 = +30%)</option>
                <option value="fixed_override">💶 Fiksuota paros kaina (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Reikšmė {ruleType === 'multiplier' ? '(Koeficientas)' : '(Eur/parai)'}
              </label>
              <input
                type="number"
                step={ruleType === 'multiplier' ? '0.05' : '1'}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                Minimalus Naktų Skaičius
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={minimumNights}
                onChange={(e) => setMinimumNights(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
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
              className="px-5 py-2 bg-amber-700 text-white font-extrabold rounded-xl text-xs hover:bg-amber-800 transition shadow-sm cursor-pointer"
            >
              Išsaugoti Sezoninę Taisyklę
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      {seasonalRules.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-extrabold text-stone-800 text-sm">Aktyvių sezoninių taisyklių nėra</h4>
          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
            Galite sukurti kainų padidinimo taisykles Joninėms, Žolinei ar vasaros savaitgaliams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasonalRules.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      📅 {r.startDate} — {r.endDate}
                    </span>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-1">{r.name}</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-amber-800">
                      {r.multiplier ? `${((r.multiplier - 1) * 100).toFixed(0)}%` : `€${r.pricePerNight}`}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold block">
                      {r.multiplier ? 'antkainis' : '/ parai'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-600 font-medium pt-1">
                  <span>🌙 Min. naktys: <strong>{r.minimumNights || 1} paros</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aktyvus kainodaros algoritme</span>
                </span>

                <button
                  onClick={() => deleteSeasonalRule(campsite.id, r.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Ištrinti taisyklę"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
