import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldCheck, FileText, Building2, Copy, Check } from 'lucide-react';
import { Booking } from '../types';

interface PaymentProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onUploadSuccess: (proofUrl: string, proofNote: string) => void;
}

export const PaymentProofUploadModal: React.FC<PaymentProofUploadModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUploadSuccess
}) => {
  const [proofNote, setProofNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const bank = booking.hostBankDetails || {
    iban: 'LT79 7044 0600 0123 4567',
    bankName: 'Swedbank',
    receiverName: 'Stovyklavietės Šeimininkas',
    paymentReference: booking.id
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Use uploaded image preview URL or fallback sample receipt
      const finalUrl = filePreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
      onUploadSuccess(finalUrl, proofNote);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Upload className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Mokėjimo Įrodymo Įkėlimas</h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">Rezervacija #{booking.id} • {booking.campsiteTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Host Bank Transfer Info Card */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80 space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
              <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                Šeimininko Banko Rekvizitai
              </span>
              <span className="font-black text-emerald-800 text-sm">€{booking.totalPrice.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-gray-800">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Gavėjas</span>
                  <span className="font-bold text-gray-900">{bank.receiverName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bank.receiverName, 'receiver')}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors"
                >
                  {copiedField === 'receiver' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">IBAN Sąskaita ({bank.bankName})</span>
                  <span className="font-mono font-bold text-emerald-900 text-xs">{bank.iban}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bank.iban, 'iban')}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors"
                >
                  {copiedField === 'iban' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Mokėjimo Paskirtis</span>
                  <span className="font-bold text-gray-900">{bank.paymentReference}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bank.paymentReference, 'ref')}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors"
                >
                  {copiedField === 'ref' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* File Upload Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Apmokėjimo Kvitai / Išrašas (Nuotrauka arba PDF)
              </label>
              
              <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-emerald-50/30 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {filePreview ? (
                  <div className="space-y-2">
                    <img src={filePreview} alt="Mokėjimo išrašas" className="h-32 mx-auto rounded-xl object-contain border border-gray-200" />
                    <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Pasirinktas failas: {selectedFile?.name || 'Mokėjimo_kvitai.jpg'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-white text-emerald-700 rounded-2xl inline-block shadow-xs border border-gray-200">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">Spustelėkite arba įvilkite bankinio mokėjimo kvitą</p>
                    <p className="text-[10px] text-gray-400">Palaikomi JPG, PNG, PDF failai iki 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Pavedimo numeris arba papildoma pastaba šeimininkui
              </label>
              <input
                type="text"
                placeholder="Pvz.: Swedbank pavedimo nr. 89201940"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Atšaukti
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Siunčiama...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pateikti Mokėjimo Įrodymą</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
