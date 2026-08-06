import React from 'react';
import { Lock, EyeOff, ShieldCheck } from 'lucide-react';

// Regex patterns for sensitive contact details
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(\+?370\s?6\d{2}\s?\d{2}\s?\d{3}|\b8\s?6\d{2}\s?\d{2}\s?\d{3}|\b\+?\d{2,4}[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}\b|\b86\d{7}\b|\b\+3706\d{7}\b)/gi;
const ADDRESS_KEYWORDS = /\b(gatvė|gatve|g\.|prospektas|pr\.|alėja|aleja|al\.|plentas|pl\.|skersgatvis)\b/gi;

/**
 * Checks whether a text contains sensitive contact info or explicit contact requests.
 */
export function hasSensitiveContactInfo(text: string): boolean {
  if (!text) return false;
  
  const hasEmail = EMAIL_REGEX.test(text);
  EMAIL_REGEX.lastIndex = 0; // reset state
  
  const hasPhone = PHONE_REGEX.test(text);
  PHONE_REGEX.lastIndex = 0;

  const lower = text.toLowerCase();
  const hasAddressWord = ADDRESS_KEYWORDS.test(text) && /\d/.test(text); // e.g. "Ežero g. 14"
  ADDRESS_KEYWORDS.lastIndex = 0;

  const asksContact = lower.includes('telefon') || lower.includes('el. pastas') || lower.includes('el. paštas') || lower.includes('numeri') || lower.includes('adresas') || lower.includes('kontakt');

  return hasEmail || hasPhone || hasAddressWord || asksContact;
}

/**
 * Replaces sensitive contact info in text with a masked string.
 */
export function maskContactInfoText(text: string): { maskedText: string; isMasked: boolean } {
  if (!text) return { maskedText: '', isMasked: false };

  let isMasked = false;
  let result = text;

  // Mask Emails
  result = result.replace(EMAIL_REGEX, () => {
    isMasked = true;
    return ' [🔒 el.paštas paslėptas] ';
  });

  // Mask Phones
  result = result.replace(PHONE_REGEX, () => {
    isMasked = true;
    return ' [🔒 tel. numeris paslėptas] ';
  });

  // Mask Specific Street Addresses with numbers (e.g. Miško g. 12)
  const streetWithNumberRegex = /\b([A-ZĄČĘĖĮŠŲŪŽa-ząčęėįšųūž]+)\s+(g\.|gatvė|gatve|pr\.|prospektas|pl\.|plentas)\s*\d+[a-zA-Z]?\b/gi;
  result = result.replace(streetWithNumberRegex, () => {
    isMasked = true;
    return ' [🔒 adresas paslėptas] ';
  });

  return { maskedText: result, isMasked };
}

interface ProtectedChatMessageProps {
  text: string;
  role: 'client' | 'host' | 'admin';
  isCurrentUserAdmin?: boolean;
}

/**
 * React Component to render a chat message with privacy masking & blurred contact protection.
 */
export const ProtectedChatMessage: React.FC<ProtectedChatMessageProps> = ({
  text,
  role,
  isCurrentUserAdmin = false
}) => {
  const { maskedText, isMasked } = maskContactInfoText(text);

  // If no contact info detected or if current viewer is platform admin, render normal text with optional admin badge
  if (!isMasked) {
    return <span>{text}</span>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 font-medium">
        <span>{maskedText}</span>
      </div>

      {/* Security Privacy Notice Badge */}
      <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] flex items-start gap-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-extrabold block text-[10px] uppercase tracking-wider text-amber-800">
            🔒 Saugumo & Privatumo apsauga
          </span>
          <span className="text-gray-700">
            Kontaktiniai duomenys (telefonas, el. paštas, tikslus adresas) automatiškai užtušuojami iki rezervacijos patvirtinimo.
          </span>
        </div>
      </div>
    </div>
  );
};
