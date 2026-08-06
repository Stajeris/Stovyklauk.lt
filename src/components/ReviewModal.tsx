import React, { useState } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles, MessageSquarePlus } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Booking, Campsite } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  campsite: Campsite;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  campsite,
}) => {
  const { addReview } = useCampsites();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(booking.guestName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Prašome įrašyti atsiliepimo komentarą.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addReview(campsite.id, booking.id, rating, comment, authorName);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
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

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Atsiliepimas sėkmingai publikuotas!</h3>
            <p className="text-gray-500 text-xs">
              Dėkojame už jūsų įvertinimą! Jūsų atsiliepimas pažymėtas kaip patvirtintos Stripe viešnagės vertinimas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>✓ Patvirtintas Stripe Užsakymas #{booking.id}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquarePlus className="w-6 h-6 text-emerald-600" />
                <span>Palikite atsiliepimą</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Atsiliepimus gali palikti tik patvirtintą ir apmokėtą užsakymą atlikę svečiai.
              </p>
            </div>

            {/* Campsite summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-150">
              <img
                src={campsite.images[0]}
                alt={campsite.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">{campsite.title}</h4>
                <p className="text-xs text-gray-500">{campsite.location}</p>
                <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
                  Viešnagė: {booking.checkIn} – {booking.checkOut}
                </p>
              </div>
            </div>

            {/* Rating Stars Selector */}
            <div className="space-y-2 text-center bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Pasirinkite įvertinimą (1-5 žvaigždutės) *
              </label>
              
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transform hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          active ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="block text-xs font-extrabold text-amber-900 pt-1">
                {rating === 5 && 'Puiku! Išskirtinė vieta (5/5)'}
                {rating === 4 && 'Labai gerai (4/5)'}
                {rating === 3 && 'Vidutiniškai (3/5)'}
                {rating === 2 && 'Patenkinamai (2/2)'}
                {rating === 1 && 'Nepatiko (1/5)'}
              </span>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Jūsų vardas arba slapyvardis
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Pvz., Tomas G."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Komentaras ir patirtis *
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Pasidalinkite įspūdžiais apie vietos švarą, gamtą, šeimininko svetingumą ar patogumus..."
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{isSubmitting ? 'Skelbiama...' : 'Pateikti Atsiliepimą (Stripe Verifikuota)'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
