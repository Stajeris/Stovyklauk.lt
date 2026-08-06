import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, FileText, Info } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Review } from '../types';

interface DisputeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campsiteId: string;
  review: Review;
}

export const DisputeReviewModal: React.FC<DisputeReviewModalProps> = ({
  isOpen,
  onClose,
  campsiteId,
  review,
}) => {
  const { disputeReview } = useCampsites();
  const [category, setCategory] = useState<'profanity' | 'hate_speech' | 'no_show' | 'other_violation'>('profanity');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Prašome pateikti skundo paaiškinimą arba įrodymą.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      disputeReview(campsiteId, review.id, category, reason);
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Skundas sėkmingai perduotas administracijai!</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">
              Mūsų komanda peržiūrės atsiliepimą pagal bendrąsias platformos taisykles. Apie sprendimą būsite informuoti.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Šeimininko Ginčų ir Moderavimo Langas</span>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
                <span>Apskųsti atsiliepimą administratoriui</span>
              </h2>
            </div>

            {/* Strict Notice Box */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5">
              <div className="flex items-center gap-2 font-extrabold text-rose-900">
                <Info className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Griežta platformos taisyklių apsauga:</span>
              </div>
              <p className="text-rose-900 font-medium leading-relaxed">
                Kritiško ar neigiamo atsiliepimo <strong className="underline">negalima ištrinti vien todėl, kad jis nepatinka šeimininkui</strong>. Skundas bus tenkinamas <strong>TIK</strong> jei atsiliepimas pažeidžia taisykles (keiksmažodžiai, neapykantos kalba arba įrodytas svečio neatvykimas).
              </p>
            </div>

            {/* Target Review Snippet */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span>{review.authorName} (★ {review.rating}.0)</span>
                <span className="text-gray-400 font-normal text-[10px]">{review.date}</span>
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
            </div>

            {/* Violation Category Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-700">
                Pasirinkite taisyklių pažeidimo priežastį *
              </label>

              <div className="space-y-2 text-xs">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  category === 'profanity' ? 'bg-amber-50/80 border-amber-400 font-bold' : 'bg-white border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={category === 'profanity'}
                    onChange={() => setCategory('profanity')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-gray-900 font-bold">🤬 Keiksmažodžiai ir asmeniniai įžeidimai</span>
                    <span className="text-[11px] text-gray-500 font-normal">Tekste yra vulgarios kalbos ar grasinimų.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  category === 'hate_speech' ? 'bg-amber-50/80 border-amber-400 font-bold' : 'bg-white border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={category === 'hate_speech'}
                    onChange={() => setCategory('hate_speech')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-gray-900 font-bold">🚫 Neapykantos kalba ar diskriminacija</span>
                    <span className="text-[11px] text-gray-500 font-normal">Rasinė, tautinė ar religinė diskriminacija.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  category === 'no_show' ? 'bg-amber-50/80 border-amber-400 font-bold' : 'bg-white border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={category === 'no_show'}
                    onChange={() => setCategory('no_show')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-gray-900 font-bold">❌ Įrodyta, kad klientas net nebuvo atvykęs (No-show)</span>
                    <span className="text-[11px] text-gray-500 font-normal">Užsakymas atšauktas arba klientas neatvyko.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  category === 'other_violation' ? 'bg-amber-50/80 border-amber-400 font-bold' : 'bg-white border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={category === 'other_violation'}
                    onChange={() => setCategory('other_violation')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-gray-900 font-bold">⚠️ Kitas šiurkštus taisyklių pažeidimas</span>
                    <span className="text-[11px] text-gray-500 font-normal">Konfidencialios informacijos platinimas ir pan.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Explanation / Proof Details */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Pateikite paaiškinimą arba atvykimo įrodymus administratoriams *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detalizuokite, kodėl šis atsiliepimas pažeidžia taisykles..."
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-amber-200" />
              <span>{isSubmitting ? 'Siunčiama...' : 'Siųsti Skundą Moderatoriui'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
