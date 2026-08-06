import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, User, Mail, Phone, MessageSquare, 
  MapPin, Sparkles, ArrowLeft, Filter, AlertCircle, Check, X, ShieldCheck, DollarSign
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';
import { Booking } from '../types';
import { OrderApproxMap } from './OrderApproxMap';

export const PendingRequestsPage: React.FC = () => {
  const { campsites, bookings, updateBookingStatus, setView, t } = useCampsites();
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedContactBooking, setSelectedContactBooking] = useState<Booking | null>(null);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const pendingEarnings = pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const handleApprove = (id: string, guestName: string) => {
    updateBookingStatus(id, 'approved');
    setToastMessage(`Užsakymas sėkmingai patvirtintas! Svečiui ${guestName} išsiųstas pranešimas.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReject = (id: string, guestName: string) => {
    updateBookingStatus(id, 'rejected');
    setToastMessage(`Užsakymo užklausa atmesta.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div id="pending-requests-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 min-h-screen">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Back Action */}
      <div className="space-y-4 font-sans">
        <button
          onClick={() => setView('host-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Grįžti į Šeimininko Skydą</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Laukiančios Užsakymo Užklausos
              </h1>
              {pendingBookings.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  {pendingBookings.length} Laukia
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Svečių prašymai apsistoti jūsų stovyklavietėse. Patvirtinkite užklausą, kad rezervacija būtų galutinai įsigaliojusi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 font-medium">Auto-patvirtinimas:</span>
            <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Išjungta (Rankinis)
            </span>
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">Laukia Patvirtinimo</span>
            <span className="text-2xl font-black text-amber-950">{pendingBookings.length} užklausos</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-200/60 text-amber-900">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Patvirtinti Užsakymai</span>
            <span className="text-2xl font-black text-emerald-950">{approvedBookings.length} aktyvūs</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-200/60 text-emerald-900">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">Numatoma Laukiančių Suma</span>
            <span className="text-2xl font-black text-emerald-800">€{pendingEarnings}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-100 text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 font-sans">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Laukiančios ({pendingBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Patvirtintos ({approvedBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Atmestos ({rejectedBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>Visos ({bookings.length})</span>
        </button>
      </div>

      {/* Bookings Request Cards List */}
      <div className="space-y-6 font-sans">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Nėra užklausų pagal šį filtrą</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {filterStatus === 'pending' 
                  ? 'Visos gautos užklausos patvirtintos arba atmestos. Naujos svečių užklausos pasirodys čia realiu laiku.'
                  : 'Šioje kategorijoje šiuo metu užsakymų nėra.'}
              </p>
            </div>
          </div>
        ) : (
          filteredBookings.map(bk => (
            <div 
              key={bk.id}
              className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                bk.status === 'pending' 
                  ? 'border-amber-300 ring-2 ring-amber-100' 
                  : bk.status === 'approved' 
                    ? 'border-emerald-200' 
                    : 'border-gray-200 opacity-80'
              }`}
            >
              {/* Card Top Status Bar */}
              <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-bold ${
                bk.status === 'pending' ? 'bg-amber-50 text-amber-900 border-b border-amber-100' :
                bk.status === 'approved' ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-100' :
                'bg-gray-100 text-gray-700 border-b border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                  <span className="uppercase text-[10px] tracking-wider font-extrabold">
                    {bk.status === 'pending' ? 'Laukia jūsų patvirtinimo' :
                     bk.status === 'approved' ? 'Užsakymas patvirtintas' : 'Užklausa atmesta'}
                  </span>
                </div>
                <span className="text-[11px] font-normal text-gray-500">
                  Gauta: {bk.createdAt}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Guest Info & Message */}
                  <div className="lg:col-span-7 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                    
                    {/* Guest Avatar & Contacts */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(bk.guestName)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{bk.guestName}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                            Patikrintas Paskyros Svečias
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <a href={`mailto:${bk.guestEmail}`} className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{bk.guestEmail}</span>
                          </a>
                          {bk.guestPhone && (
                            <>
                              <span>•</span>
                              <a href={`tel:${bk.guestPhone}`} className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-semibold">{bk.guestPhone}</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Guest Note / Message Box */}
                    {bk.guestNote && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Svečio Žinutė Šeimininkui</span>
                        </div>
                        <p className="text-xs text-gray-700 italic leading-relaxed">
                          "{bk.guestNote}"
                        </p>
                      </div>
                    )}

                    {/* Campsite Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-150">
                        <img 
                          src={bk.campsiteImage} 
                          alt={bk.campsiteTitle} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-200"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                            Pasirinkta Stovyklavietė
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{bk.campsiteTitle}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {bk.location}
                          </p>
                        </div>
                      </div>

                      {/* Approximate location map */}
                      {(() => {
                        const camp = campsites.find(c => c.id === bk.campsiteId);
                        return (
                          <OrderApproxMap 
                            latitude={camp?.latitude || 55.1694} 
                            longitude={camp?.longitude || 23.8813} 
                            locationName={bk.location} 
                            campsiteTitle={bk.campsiteTitle}
                            height="150px" 
                          />
                        );
                      })()}
                    </div>

                  </div>

                  {/* Right Column: Reservation Details & Actions */}
                  <div className="lg:col-span-5 space-y-5">
                    
                    {/* Booking Details Box */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-150 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Atvykimas ir Išvykimas:</span>
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {bk.checkIn} — {bk.checkOut}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Nakvynių skaičius:</span>
                        <span className="font-bold text-gray-900">{bk.totalNights} nakt.</span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Svečių skaičius:</span>
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          {bk.guestsCount} {bk.guestsCount === 1 ? 'svečias' : 'svečiai'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Šeimininko Išmokėjimas (0% mokestis)
                          </span>
                          <span className="text-2xl font-black text-emerald-900">
                            €{bk.totalPrice}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          100% tavo dalis
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {bk.status === 'pending' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            id={`approve-request-btn-${bk.id}`}
                            onClick={() => handleApprove(bk.id, bk.guestName)}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Patvirtinti</span>
                          </button>

                          <button
                            id={`reject-request-btn-${bk.id}`}
                            onClick={() => handleReject(bk.id, bk.guestName)}
                            className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Atmesti</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedContactBooking(bk)}
                          className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Susisiekti / Rašyti laišką</span>
                        </button>
                      </div>
                    )}

                    {bk.status === 'approved' && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Užsakymas patvirtintas
                        </span>
                        <button
                          onClick={() => setSelectedContactBooking(bk)}
                          className="text-emerald-800 underline text-[11px]"
                        >
                          Rodyti kontaktus
                        </button>
                      </div>
                    )}

                    {bk.status === 'rejected' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Ši užklausa buvo atmesta.
                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Guest Contact Dialog Modal */}
      {selectedContactBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl font-sans border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Svečio Kontaktai</h3>
              <button 
                onClick={() => setSelectedContactBooking(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center shrink-0">
                  {getInitials(selectedContactBooking.guestName)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedContactBooking.guestName}</h4>
                  <p className="text-gray-500">Užsakymas: {selectedContactBooking.campsiteTitle}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`mailto:${selectedContactBooking.guestEmail}`}
                  className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl flex items-center justify-between transition-colors font-semibold text-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>{selectedContactBooking.guestEmail}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Rašyti</span>
                </a>

                {selectedContactBooking.guestPhone && (
                  <a
                    href={`tel:${selectedContactBooking.guestPhone}`}
                    className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl flex items-center justify-between transition-colors font-semibold text-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{selectedContactBooking.guestPhone}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Skambinti</span>
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedContactBooking(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Uždaryti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
