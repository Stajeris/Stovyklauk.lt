import { ChatThread } from '../types';

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'chat-camp-1-client-linas',
    campsiteId: 'camp-1',
    campsiteTitle: 'Pūšalynas prie Bebrusų Ežero',
    campsiteImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    hostId: 'host-mantas',
    hostName: 'Mantas Giraitis',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clientId: 'client-linas',
    clientName: 'Linas Petraitis',
    clientEmail: 'linas.p@gmail.com',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Puiku, laauksime atvykstant! Baidarės paruoštos krante.',
    lastMessageTimestamp: 'Šiandien 10:15',
    unreadByHost: false,
    unreadByAdmin: false,
    messages: [
      {
        id: 'm1',
        senderId: 'client-linas',
        senderName: 'Linas Petraitis',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'client',
        text: 'Sveiki, Mantai! Norėjau pasiteirauti, ar stovyklavietėje yra galimybė išsinuomoti baidares savaitgaliui?',
        timestamp: 'Šiandien 09:40'
      },
      {
        id: 'm2',
        senderId: 'host-mantas',
        senderName: 'Mantas Giraitis',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        role: 'host',
        text: 'Sveikas Linai! Taip, turime dvivietes baidares tiesiai prie mūsų liepto. Kaina - 20€ parai su irklais ir liemenėmis.',
        timestamp: 'Šiandien 09:55'
      },
      {
        id: 'm3',
        senderId: 'client-linas',
        senderName: 'Linas Petraitis',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'client',
        text: 'Tobula! Taip pat atvykstame su šunimi (auksaspalvis retriveris). Ar nieko prieš?',
        timestamp: 'Šiandien 10:02'
      },
      {
        id: 'm4',
        senderId: 'host-mantas',
        senderName: 'Mantas Giraitis',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        role: 'host',
        text: 'Puiku, laauksime atvykstant! Baidarės paruoštos krante, o keturkojai draugai pas mus visada labai laukiami.',
        timestamp: 'Šiandien 10:15'
      }
    ]
  },
  {
    id: 'chat-camp-1-client-agne',
    campsiteId: 'camp-1',
    campsiteTitle: 'Pūšalynas prie Bebrusų Ežero',
    campsiteImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    hostId: 'host-mantas',
    hostName: 'Mantas Giraitis',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clientId: 'client-agne',
    clientName: 'Agnė Vaitkutė',
    clientEmail: 'agne.v@yahoo.com',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Ar yra malkų saunai, ar reikia turėti savo?',
    lastMessageTimestamp: 'Vakar 18:30',
    unreadByHost: true,
    unreadByAdmin: false,
    messages: [
      {
        id: 'm201',
        senderId: 'client-agne',
        senderName: 'Agnė Vaitkutė',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        role: 'client',
        text: 'Laba diena, planuojame atvykti penktadienį apie 19 val. Ar yra malkų saunai, ar reikia turėti savo?',
        timestamp: 'Vakar 18:30'
      }
    ]
  },
  {
    id: 'chat-camp-2-client-tomas',
    campsiteId: 'camp-2',
    campsiteTitle: 'Nemuno Kilpų Glamping Kupolas',
    campsiteImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    hostId: 'host-rasa',
    hostName: 'Rasa Nemunienė',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    clientId: 'client-tomas',
    clientName: 'Tomas Jonaitis',
    clientEmail: 'tomas.j@gmail.com',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Pirtis užsakyta šeštadienio vakarui 20:00 val.',
    lastMessageTimestamp: 'Rugpjūčio 4, 14:20',
    unreadByHost: false,
    unreadByAdmin: false,
    messages: [
      {
        id: 'm101',
        senderId: 'client-tomas',
        senderName: 'Tomas Jonaitis',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        role: 'client',
        text: 'Sveiki, Rasa! Rezervavome Glamping kupolą 2 naktims. Ar galima papildomai užsakyti tradicinę pirtį prie Nemuno?',
        timestamp: 'Rugpjūčio 4, 12:10'
      },
      {
        id: 'm102',
        senderId: 'host-rasa',
        senderName: 'Rasa Nemunienė',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        role: 'host',
        text: 'Sveiki, Tomai! Taip, žinoma. Pirtelės iškūrenimas kainuoja 30€ 3 valandoms. Kurią dieną ir valandą pageidautumėte?',
        timestamp: 'Rugpjūčio 4, 13:05'
      },
      {
        id: 'm103',
        senderId: 'admin-1',
        senderName: 'Giedrius Štajeris (Platformos Admin)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'admin',
        text: '👑 Platformos Administratoriaus Pastaba: Užsakymo rezervacija patvirtinta, Escrow saugus apmokėjimas aktyvuotas.',
        timestamp: 'Rugpjūčio 4, 13:15'
      },
      {
        id: 'm104',
        senderId: 'host-rasa',
        senderName: 'Rasa Nemunienė',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        role: 'host',
        text: 'Pirtis užsakyta šeštadienio vakarui 20:00 val. Vanta ir žolelių arbata įskaičiuota!',
        timestamp: 'Rugpjūčio 4, 14:20'
      }
    ]
  },
  {
    id: 'chat-camp-3-client-karolis',
    campsiteId: 'camp-3',
    campsiteTitle: 'Šventosios Upės Laukymė',
    campsiteImage: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?auto=format&fit=crop&w=800&q=80',
    hostId: 'host-mantas',
    hostName: 'Mantas Giraitis',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clientId: 'client-karolis',
    clientName: 'Karolis Balčiūnas',
    clientEmail: 'karolis.b@outlook.com',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Ar galima privažiuoti su žemu lengvuoju automobiliu po lietaus?',
    lastMessageTimestamp: 'Rugpjūčio 5, 09:10',
    unreadByHost: false,
    unreadByAdmin: false,
    messages: [
      {
        id: 'm301',
        senderId: 'client-karolis',
        senderName: 'Karolis Balčiūnas',
        senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        role: 'client',
        text: 'Sveiki! Ar galima privažiuoti su žemu lengvuoju automobiliu po lietaus?',
        timestamp: 'Rugpjūčio 5, 09:10'
      }
    ]
  }
];
