import React from 'react';
import { 
  Flame, Droplets, Dog, Waves, Sparkles, Utensils, ShowerHead, 
  Zap, Wifi, Anchor, Bath, Bike, Car, Trees, ShieldCheck, Sun, Moon, MapPin
} from 'lucide-react';

interface AmenityBadgeProps {
  amenity: string;
  size?: 'sm' | 'md' | 'lg';
  showCheck?: boolean;
  selected?: boolean;
  className?: string;
}

export const getAmenityConfig = (amenityName: string) => {
  const lower = amenityName.toLowerCase();

  if (lower.includes('lauž') || lower.includes('fire') || lower.includes('ugn')) {
    return {
      icon: Flame,
      bg: 'bg-transparent text-amber-950 border-amber-200/80 hover:bg-amber-50/40',
      iconBg: 'bg-amber-500 text-white',
      accent: 'amber'
    };
  }
  if (lower.includes('geriamas vanduo') || lower.includes('vanduo') || lower.includes('water')) {
    return {
      icon: Droplets,
      bg: 'bg-transparent text-sky-950 border-sky-200/80 hover:bg-sky-50/40',
      iconBg: 'bg-sky-500 text-white',
      accent: 'sky'
    };
  }
  if (lower.includes('augint') || lower.includes('pet') || lower.includes('šuo') || lower.includes('gyvūn')) {
    return {
      icon: Dog,
      bg: 'bg-transparent text-emerald-950 border-emerald-200/80 hover:bg-emerald-50/40',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'emerald'
    };
  }
  if (lower.includes('šalia vandens') || lower.includes('ežeras') || lower.includes('upė') || lower.includes('pakrantė') || lower.includes('lake') || lower.includes('waterfront')) {
    return {
      icon: Waves,
      bg: 'bg-transparent text-cyan-950 border-cyan-200/80 hover:bg-cyan-50/40',
      iconBg: 'bg-cyan-600 text-white',
      accent: 'cyan'
    };
  }
  if (lower.includes('žvaigžd') || lower.includes('star') || lower.includes('dangus') || lower.includes('naktis')) {
    return {
      icon: Moon,
      bg: 'bg-transparent text-indigo-950 border-indigo-200/80 hover:bg-indigo-50/40',
      iconBg: 'bg-indigo-600 text-white',
      accent: 'indigo'
    };
  }
  if (lower.includes('piknik') || lower.includes('stalas') || lower.includes('maistas') || lower.includes('grilis') || lower.includes('barbekiu')) {
    return {
      icon: Utensils,
      bg: 'bg-transparent text-orange-950 border-orange-200/80 hover:bg-orange-50/40',
      iconBg: 'bg-orange-600 text-white',
      accent: 'orange'
    };
  }
  if (lower.includes('tualet') || lower.includes('wc') || lower.includes('sanitar') || lower.includes('toilet')) {
    return {
      icon: Bath,
      bg: 'bg-transparent text-slate-900 border-slate-200/80 hover:bg-slate-50/40',
      iconBg: 'bg-slate-700 text-white',
      accent: 'slate'
    };
  }
  if (lower.includes('elektr') || lower.includes('power') || lower.includes('įkrovim')) {
    return {
      icon: Zap,
      bg: 'bg-transparent text-yellow-950 border-yellow-300/80 hover:bg-yellow-50/40',
      iconBg: 'bg-amber-500 text-white',
      accent: 'yellow'
    };
  }
  if (lower.includes('duš') || lower.includes('shower')) {
    return {
      icon: ShowerHead,
      bg: 'bg-transparent text-blue-950 border-blue-200/80 hover:bg-blue-50/40',
      iconBg: 'bg-blue-600 text-white',
      accent: 'blue'
    };
  }
  if (lower.includes('wifi') || lower.includes('internetas')) {
    return {
      icon: Wifi,
      bg: 'bg-transparent text-violet-950 border-violet-200/80 hover:bg-violet-50/40',
      iconBg: 'bg-violet-600 text-white',
      accent: 'violet'
    };
  }
  if (lower.includes('baidar') || lower.includes('valt') || lower.includes('sup') || lower.includes('nuoma') || lower.includes('boat')) {
    return {
      icon: Anchor,
      bg: 'bg-transparent text-teal-950 border-teal-200/80 hover:bg-teal-50/40',
      iconBg: 'bg-teal-600 text-white',
      accent: 'teal'
    };
  }
  if (lower.includes('pirt') || lower.includes('kubil') || lower.includes('sauna') || lower.includes('spa')) {
    return {
      icon: Flame,
      bg: 'bg-transparent text-rose-950 border-rose-200/80 hover:bg-rose-50/40',
      iconBg: 'bg-rose-600 text-white',
      accent: 'rose'
    };
  }
  if (lower.includes('dvirat') || lower.includes('bike')) {
    return {
      icon: Bike,
      bg: 'bg-transparent text-lime-950 border-lime-300/80 hover:bg-lime-50/40',
      iconBg: 'bg-lime-600 text-white',
      accent: 'lime'
    };
  }
  if (lower.includes('park') || lower.includes('auto') || lower.includes('kemper')) {
    return {
      icon: Car,
      bg: 'bg-transparent text-stone-900 border-stone-200/80 hover:bg-stone-50/40',
      iconBg: 'bg-stone-700 text-white',
      accent: 'stone'
    };
  }
  if (lower.includes('mišk') || lower.includes('gamta') || lower.includes('medž')) {
    return {
      icon: Trees,
      bg: 'bg-transparent text-emerald-950 border-emerald-200/80 hover:bg-emerald-50/40',
      iconBg: 'bg-emerald-700 text-white',
      accent: 'emerald'
    };
  }

  // Default fallback for custom or unmapped amenities
  return {
    icon: Sparkles,
    bg: 'bg-transparent text-amber-950 border-amber-200/80 hover:bg-amber-50/40',
    iconBg: 'bg-amber-500 text-white',
    accent: 'amber'
  };
};

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({
  amenity,
  size = 'md',
  className = ''
}) => {
  const config = getAmenityConfig(amenity);
  const IconComponent = config.icon;

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold shadow-2xs ${config.bg} ${className}`}>
        <div className={`p-1 rounded-md ${config.iconBg} shrink-0`}>
          <IconComponent className="w-3 h-3" />
        </div>
        <span>{amenity}</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-extrabold shadow-2xs transition-all ${config.bg} ${className}`}>
        <div className={`p-2.5 rounded-xl ${config.iconBg} shadow-sm shrink-0`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="leading-snug">{amenity}</span>
      </div>
    );
  }

  // Default 'md' size
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold shadow-2xs transition-all ${config.bg} ${className}`}>
      <div className={`p-1.5 rounded-lg ${config.iconBg} shadow-xs shrink-0`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <span className="leading-tight">{amenity}</span>
    </div>
  );
};
