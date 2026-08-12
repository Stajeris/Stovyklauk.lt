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
 * Tiered pricing structure:
 * - >= 250 EUR: 5% fee
 * - >= 200 EUR: 7% fee
 * - >= 180 EUR: 8% fee
 * - < 180 EUR: 10% standard fee
 * Minimum fee threshold: 5.00 EUR (protects against Stripe transaction fees)
 * Returns fee in cents (required for Stripe API)
 */
export function calculatePlatformFee(_bookingSubtotal: number): number {
  // No platform reservation fee for marketplace
  return 0;
}

export interface DetailedPricingBreakdown {
  nightlyRate: number;
  totalNights: number;
  nightsSubtotal: number;
  cleaningFee: number;
  bookingSubtotal: number; // nightsSubtotal + cleaningFee
  platformFeeCents: number;
  platformFeeEur: number;
  feePercentage: number;
  feePercentageLabel: string;
  totalGuestPrice: number;
  hostPayoutAmount: number;
}

export function calculateFullPricing(
  nightlyRate: number,
  totalNights: number,
  cleaningFee: number = 0,
  checkIn?: string,
  checkOut?: string,
  customPrices?: Record<string, number>
): DetailedPricingBreakdown {
  let nightsSubtotal = 0;

  if (checkIn && checkOut && customPrices && Object.keys(customPrices).length > 0) {
    let curr = new Date(checkIn);
    const end = new Date(checkOut);
    while (curr < end) {
      const dateStr = curr.toISOString().split('T')[0];
      const rate = customPrices[dateStr] ?? nightlyRate;
      nightsSubtotal += rate;
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    nightsSubtotal = nightlyRate * totalNights;
  }

  const bookingSubtotal = nightsSubtotal + cleaningFee;
  
  const platformFeeCents = 0;
  const platformFeeEur = 0;
  const feePercentage = 0;

  const totalGuestPrice = parseFloat(bookingSubtotal.toFixed(2));
  const hostPayoutAmount = parseFloat(bookingSubtotal.toFixed(2));

  return {
    nightlyRate,
    totalNights,
    nightsSubtotal,
    cleaningFee,
    bookingSubtotal,
    platformFeeCents,
    platformFeeEur,
    feePercentage,
    feePercentageLabel: '0%',
    totalGuestPrice,
    hostPayoutAmount,
  };
}
