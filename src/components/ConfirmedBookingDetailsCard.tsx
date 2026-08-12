import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, MessageSquare, Navigation, CheckCircle2, 
  Copy, Check, Compass, ShieldCheck, Clock, FileText, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { Booking, Campsite } from '../types';
import { ExactLocationMap } from './ExactLocationMap';
import { useCampsites } from '../context/CampsiteContext';

interface ConfirmedBookingDetailsCardProps {
  booking: Booking;
  campsite: Campsite;
  defaultExpanded?: boolean;
}

export const ConfirmedBookingDetailsCard: React.FC<ConfirmedBookingDetailsCardProps> = ({
  booking,
  campsite,
  defaultExpanded = true
}) => {
  const { setView, setSelectedCampsiteId } = useCampsites();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const hostPhone = campsite.host.phone || '+370 611 11111';
  const hostEmail = campsite.host.email || 'mantas@pusalis.lt';

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hostPhone);
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hostEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCampsiteId(campsite.id);
    setView('detail', campsite.id);
  };

  // Check if booking is confirmed and paid
  const isApprovedAndPaid = booking.status === 'approved' || booking.status === 'completed';

  if (!isApprovedAndPaid) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-sans text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Tiksli vieta ir šeimininko kontaktai bus parodyti, kai šeimininkas patvirtins užklausą.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-500/80 bg-white shadow-md font-sans overflow-hidden transition-all">
      
      {/* Header Banner - Confirmed & Paid Status */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-850 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Kelionė Patvirtinta
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Tiksli Vieta & Kontaktai Atverti
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 mt-0.5">
              Spustelėkite čia navigacijai, tiksliam adresui ir šeimininko instrukcijoms.
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700 transition shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-6 bg-slate-50/50">
          
          {/* Section 1: Exact Location & Navigation Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide">
                  Tiksli Stovyklavietės Vieta & Navigacija
                </h4>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                GPS Naudojimui
              </span>
            </div>

            {/* Embedded Exact Location Map */}
            <ExactLocationMap
              latitude={campsite.latitude}
              longitude={campsite.longitude}
              locationName={campsite.location}
              addressLine={campsite.addressLine}
              campsiteTitle={campsite.title}
              height="260px"
            />

            {/* Full Address Details Box */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Adresas
                  </span>
                  <p className="text-xs font-black text-gray-900">
                    {campsite.addressLine || 'Gamtos sklypas'}, {campsite.location}, {campsite.region}
                  </p>
                  {campsite.postalCode && (
                    <p className="text-[11px] font-mono text-gray-500">
                      Pašto kodas: {campsite.postalCode}
                    </p>
                  )}
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Koordinatės
                  </span>
                  <p className="text-xs font-mono font-bold text-emerald-800">
                    {campsite.latitude.toFixed(6)}, {campsite.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Host Added Driving & Arrival Instructions */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-amber-700 shrink-0" />
                <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                  Šeimininko Atvykimo & Navigacijos Instrukcija
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-extrabold text-[10px]">
                {campsite.arrivalInstructions ? 'Šeimininko nurodyta' : 'Standartinė info'}
              </span>
            </div>

            {campsite.arrivalInstructions ? (
              <p className="text-xs text-amber-950 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200 shadow-2xs whitespace-pre-line">
                {campsite.arrivalInstructions}
              </p>
            ) : (
              <div className="text-xs text-amber-900 font-medium bg-white/70 p-3 rounded-xl border border-amber-200/80 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Šeimininkas specialių papildomų nuorodų neįrašė. Vadovaukitės žemėlapio navigacija iki nurodyto adreso arba susisiekite telefonu atvykstant.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: How to reach host by Phone, Email, Chat */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={campsite.host.avatar} 
                  alt={campsite.host.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-gray-900">{campsite.host.name}</h4>
                    {campsite.host.isSuperhost && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                        Superšeimininkas
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Atsako: {campsite.host.responseRate || 'per 1 valandą'} • Prisijungė {campsite.host.joinedDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenChat}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold rounded-xl text-xs transition border border-emerald-200 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Rašyti Žinutę</span>
              </button>
            </div>

            {/* Contact Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Call Host Button */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Šeimininko Telefonas
                    </span>
                    <a 
                      href={`tel:${hostPhone}`}
                      className="text-xs font-black text-emerald-950 hover:underline block truncate"
                    >
                      {hostPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`tel:${hostPhone}`}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    Skambinti
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg transition"
                    title="Kopijuoti numerį"
                  >
                    {phoneCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email Host Button */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-slate-800 text-white rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Šeimininko El. Paštas
                    </span>
                    <a 
                      href={`mailto:${hostEmail}`}
                      className="text-xs font-bold text-slate-900 hover:underline block truncate"
                    >
                      {hostEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`mailto:${hostEmail}`}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    Rašyti
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg transition"
                    title="Kopijuoti paštą"
                  >
                    {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Arrival Times & House Rules */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h5 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                Apsilankymo Taisyklės Ir Laikai
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 block uppercase">Atvykimas (Check-in)</span>
                <span className="font-bold text-gray-900">{booking.checkIn} nuo 15:00 - 16:00 val.</span>
              </div>
              <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 block uppercase">Išvykimas (Check-out)</span>
                <span className="font-bold text-gray-900">{booking.checkOut} iki 12:00 val.</span>
              </div>
            </div>

            {campsite.rules && campsite.rules.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  Stovyklavietės Taisyklės:
                </span>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                  {campsite.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
