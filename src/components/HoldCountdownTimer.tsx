import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface HoldCountdownTimerProps {
  expiresAt?: string;
  onExpire?: () => void;
  className?: string;
}

export const HoldCountdownTimer: React.FC<HoldCountdownTimerProps> = ({
  expiresAt,
  onExpire,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  if (timeLeft.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold ${className}`}>
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
        <span>12 val. laikymo laikas pasibaigė</span>
      </div>
    );
  }

  const isCritical = timeLeft.hours < 2;

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
      isCritical 
        ? 'bg-amber-100 text-amber-950 border border-amber-300 animate-pulse' 
        : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
    } ${className}`}>
      <Clock className={`w-4 h-4 shrink-0 ${isCritical ? 'text-amber-700' : 'text-emerald-600'}`} />
      <span className="font-mono text-sm tracking-tight">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase font-bold text-gray-500">Liko apmokėjimui</span>
    </div>
  );
};
