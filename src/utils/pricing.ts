import { SeasonalPriceRule } from '../types';

/**
 * Returns the effective cleaning fee for a campsite.
 * By default: cleaning & preparation fee applies ONLY in the case of Camper/RV rental ('rv').
 * If the Host explicitly sets `hasCleaningFee` (true/false) and/or `cleaningFee`, respect the host preference.
 */
export function getCampsiteCleaningFee(campsite: { propertyType?: string; hasCleaningFee?: boolean; cleaningFee?: number }): number {
  if (campsite.hasCleaningFee === true) {
    return campsite.cleaningFee ?? 15;
  }
  return 0;
}

/**
 * Calculates the platform service fee in cents based on booking subtotal (EUR).
 */
export function calculatePlatformFee(_bookingSubtotal: number): number {
  return 0;
}

export interface DetailedPricingBreakdown {
  nightlyRate: number;
  totalNights: number;
  nightsSubtotal: number;
  seasonalSurcharge: number;
  lengthOfStayDiscount: number;
  cleaningFee: number;
  bookingSubtotal: number; // nightsSubtotal + cleaningFee - lengthOfStayDiscount
  platformFeeCents: number;
  platformFeeEur: number;
  feePercentage: number;
  feePercentageLabel: string;
  totalGuestPrice: number;
  hostPayoutAmount: number;
  appliedRuleName?: string;
}

export function calculateFullPricing(
  nightlyRate: number,
  totalNights: number,
  cleaningFee: number = 0,
  checkIn?: string,
  checkOut?: string,
  customPrices?: Record<string, number>,
  seasonalRules?: SeasonalPriceRule[]
): DetailedPricingBreakdown {
  let nightsSubtotal = 0;
  let seasonalSurcharge = 0;
  let appliedRuleName: string | undefined = undefined;

  if (checkIn && checkOut) {
    let curr = new Date(checkIn);
    const end = new Date(checkOut);
    while (curr < end) {
      const dateStr = curr.toISOString().split('T')[0];
      let dayRate = customPrices?.[dateStr] ?? nightlyRate;

      // Apply seasonal rules if applicable
      if (seasonalRules && seasonalRules.length > 0) {
        for (const rule of seasonalRules) {
          if (dateStr >= rule.startDate && dateStr <= rule.endDate) {
            appliedRuleName = rule.name;
            if (rule.pricePerNight) {
              const diff = rule.pricePerNight - dayRate;
              if (diff > 0) seasonalSurcharge += diff;
              dayRate = rule.pricePerNight;
            } else if (rule.priceMultiplier && rule.priceMultiplier > 1) {
              const extra = dayRate * (rule.priceMultiplier - 1);
              seasonalSurcharge += extra;
              dayRate = dayRate * rule.priceMultiplier;
            }
            break;
          }
        }
      }

      nightsSubtotal += dayRate;
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    nightsSubtotal = nightlyRate * totalNights;
  }

  // Length of stay discount (e.g. 7+ nights = 10% discount)
  let lengthOfStayDiscount = 0;
  if (totalNights >= 7) {
    lengthOfStayDiscount = nightsSubtotal * 0.10;
  }

  const bookingSubtotal = Math.max(0, nightsSubtotal - lengthOfStayDiscount + cleaningFee);
  
  const platformFeeCents = 0;
  const platformFeeEur = 0;
  const feePercentage = 0;

  const totalGuestPrice = parseFloat(bookingSubtotal.toFixed(2));
  const hostPayoutAmount = parseFloat(bookingSubtotal.toFixed(2));

  return {
    nightlyRate,
    totalNights,
    nightsSubtotal: parseFloat(nightsSubtotal.toFixed(2)),
    seasonalSurcharge: parseFloat(seasonalSurcharge.toFixed(2)),
    lengthOfStayDiscount: parseFloat(lengthOfStayDiscount.toFixed(2)),
    cleaningFee,
    bookingSubtotal: parseFloat(bookingSubtotal.toFixed(2)),
    platformFeeCents,
    platformFeeEur,
    feePercentage,
    feePercentageLabel: '0%',
    totalGuestPrice,
    hostPayoutAmount,
    appliedRuleName,
  };
}
