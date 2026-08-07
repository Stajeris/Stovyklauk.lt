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
export function calculatePlatformFee(bookingSubtotal: number): number {
  let feePercentage: number;

  // Determine percentage according to tiers
  if (bookingSubtotal >= 250) {
    feePercentage = 0.05; // 5% for >= 250 EUR
  } else if (bookingSubtotal >= 200) {
    feePercentage = 0.07; // 7% for 200 to 249.99 EUR
  } else if (bookingSubtotal >= 180) {
    feePercentage = 0.08; // 8% for 180 to 199.99 EUR
  } else {
    feePercentage = 0.10; // 10% standard rate
  }

  // Calculate amount in EUR
  const calculatedFee = bookingSubtotal * feePercentage;
  const minimumFee = 5.00; // 5 EUR minimum protection against Stripe fees

  // Final fee cannot be lower than 5 EUR
  const finalFee = Math.max(calculatedFee, minimumFee);

  // Return amount in cents for Stripe API
  return Math.round(finalFee * 100);
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
  
  const platformFeeCents = calculatePlatformFee(bookingSubtotal);
  const platformFeeEur = parseFloat((platformFeeCents / 100).toFixed(2));
  
  let feePercentage = 10;
  if (bookingSubtotal >= 250) feePercentage = 5;
  else if (bookingSubtotal >= 200) feePercentage = 7;
  else if (bookingSubtotal >= 180) feePercentage = 8;

  const totalGuestPrice = parseFloat((bookingSubtotal + platformFeeEur).toFixed(2));
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
    feePercentageLabel: `${feePercentage}%`,
    totalGuestPrice,
    hostPayoutAmount,
  };
}
