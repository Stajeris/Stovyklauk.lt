import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { Campsite } from '../types';
import { useCampsites } from '../context/CampsiteContext';
import { ProtectedChatMessage } from '../utils/privacyFilter';

interface HostChatModalProps {
  campsite: Campsite;
  isOpen: boolean;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

const QUICK_PROMPTS = [
  'Ar galima atvykti su augintiniu?',
  'Koks tikslus adresas ir telefonas?',
  'Ar yra galimybė prisijungti prie elektros tinklo?',
  'Ar yra malkų laužavietei ar reikia atsivežti savo?'
];

export const HostChatModal: React.FC<HostChatModalProps> = ({
  campsite,
  isOpen,
  onClose,
  initialCheckIn,
  initialCheckOut
}) => {
  const { currentUser, chatThreads, sendMessageInThread, replyToThread } = useCampsites();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find existing thread or construct virtual thread
  const activeThread = chatThreads.find(
    t => t.campsiteId === campsite.id && (t.clientId === currentUser.id || t.clientId === 'client-guest')
  );

  const displayMessages = activeThread ? activeThread.messages : [
    {
      id: 'welcome-msg',
      senderId: campsite.host.id,
      senderName: campsite.host.name,
      senderAvatar: campsite.host.avatar,
      role: 'host' as const,
      text: `Sveiki! Aš esu ${campsite.host.name}, šios stovyklavietės („${campsite.title}“) šeimininkas. Džiaugiuosi, kad domitės! Kuo galiu Jums padėti?`,
      timestamp: 'Šiandien'
    }
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const sender = {
      id: currentUser.id || 'client-guest',
      name: currentUser.name || 'Keliautojas',
      avatar: currentUser.avatar,
      email: currentUser.email,
      role: 'client' as const
    };

    sendMessageInThread(
      campsite.id,
      sender,
      text,
      campsite.title,
      { id: campsite.host.id, name: campsite.host.name, avatar: campsite.host.avatar },
      campsite.images[0]
    );

    if (!textToSend) setInputMessage('');

    // Simulate Host auto response if needed
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Ačiū už užklausą! Patikrinsiu informaciją apie „${campsite.title}“ ir greitai Jums atsakysiu.`;
      
      const lower = text.toLowerCase();
      if (lower.includes('telefon') || lower.includes('numeri') || lower.includes('el. pašt') || lower.includes('el.past') || lower.includes('kontakt') || lower.includes('adresas')) {
        replyText = `🔒 Saugumo pranešimas: Šeimininko telefono numeris (+370 682 99123), el. paštas (kontaktas@stovyklaviete.lt) ir tikslus adresas yra automatiškai pateikiami patvirtinus rezervaciją. Privatumo sumetimais kontaktinė informacija pokalbiuose yra paslepiama.`;
      } else if (lower.includes('augintin') || lower.includes('šun')) {
        replyText = `Taip, augintiniai pas mus labai laukiami! Tik prašome pasirūpinti jų saugumu.`;
      } else if (lower.includes('elektr') || lower.includes('įkrov')) {
        replyText = `Elektros įvadas yra šalia pagrindinės stovyklavietės aikštelės.`;
      } else if (lower.includes('malk') || lower.includes('lauž')) {
        replyText = `Malkų laužavietei suteikiame vieną glėbį nemokamai, papildomai galima įsigyti vietoje.`;
      } else if (lower.includes('privažiav') || lower.includes('kelias')) {
        replyText = `Privažiavimas yra geras, sausas žvyrkelis. Tinka tiek lengviesiems automobiliams, tiek kemperiams.`;
      }

      const hostSender = {
        id: campsite.host.id,
        name: campsite.host.name,
        avatar: campsite.host.avatar,
        role: 'host' as const
      };

      const threadId = activeThread ? activeThread.id : `chat-${campsite.id}-${sender.id}`;
      replyToThread(threadId, hostSender, replyText);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[600px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={campsite.host.avatar}
                alt={campsite.host.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/80 shadow-xs"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-900 absolute bottom-0 right-0" title="Prisijungęs" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base truncate">{campsite.host.name}</h3>
                {campsite.host.isSuperhost && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                    ★ Super
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 truncate flex items-center gap-1">
                <span>Šeimininkas • {campsite.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected dates indicator bar if present */}
        {(initialCheckIn || initialCheckOut) && (
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 text-xs font-semibold text-emerald-900 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dominančios datos: <strong>{initialCheckIn || '...'}</strong> iki <strong>{initialCheckOut || '...'}</strong></span>
            </span>
          </div>
        )}

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/70">
          {displayMessages.map((msg) => {
            const isClient = msg.role === 'client';
            const isAdmin = msg.role === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isClient ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isClient && (
                  <img
                    src={msg.senderAvatar || campsite.host.avatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-emerald-200"
                  />
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-gray-500">{msg.senderName}</span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[9px]">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isClient
                        ? 'bg-emerald-700 text-white rounded-tr-xs font-medium'
                        : isAdmin
                        ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-xs font-medium'
                        : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-xs font-medium'
                    }`}
                  >
                    <ProtectedChatMessage text={msg.text} role={msg.role} />
                  </div>
                  <span className={`block text-[10px] text-gray-400 mt-1 font-medium ${isClient ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200/80 w-fit">
              <img
                src={campsite.host.avatar}
                alt={campsite.host.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-medium text-emerald-800">{campsite.host.name} rašo...</span>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Suggestions */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-transparent text-[11px] font-semibold text-gray-700 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Rašykite žinutę šeimininkui ${campsite.host.name}...`}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-2xl cursor-pointer transition-colors shrink-0 shadow-xs flex items-center justify-center"
            title="Siųsti žinutę"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
