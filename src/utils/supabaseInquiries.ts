import { HostTier, PropertyType } from '../types';

export interface SupabaseListing {
  id: string;
  title: string;
  description: string;
  location: string;
  region: string;
  price_per_night: number;
  plan: 'free' | 'pro' | 'premium';
  host_id: string;
  host_name: string;
  host_phone?: string;
  host_email?: string;
  blocked_dates: string[];
  created_at?: string;
}

export interface SupabaseInquiry {
  id: string;
  listing_id: string;
  campsite_title?: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone?: string;
  message?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  guests_count: number;
  status: 'free_inquiry' | 'pending' | 'confirmed' | 'rejected';
  host_plan: 'free' | 'pro' | 'premium';
  created_at: string;
  payment_instructions?: string;
}

/**
 * SQL Migration Script for Supabase setup
 */
export const SUPABASE_SQL_MIGRATION = `
-- ============================================================
-- CAMPY.LT SUPABASE SCHEMA FOR INQUIRIES & PRO/FREE PLAN LOGIC
-- ============================================================

-- 1. Ensure listings table has plan column ('free', 'pro', 'premium')
ALTER TABLE IF EXISTS listings 
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium'));

ALTER TABLE IF EXISTS listings 
ADD COLUMN IF NOT EXISTS blocked_dates TEXT[] DEFAULT '{}';

-- 2. Create inquiries table for traveler requests
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  campsite_title TEXT,
  traveler_name TEXT NOT NULL,
  traveler_email TEXT NOT NULL,
  traveler_phone TEXT,
  message TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('free_inquiry', 'pending', 'confirmed', 'rejected')),
  host_plan TEXT NOT NULL DEFAULT 'free' CHECK (host_plan IN ('free', 'pro', 'premium')),
  payment_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create index for fast host dashboard queries
CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Anyone can submit an inquiry without authentication
CREATE POLICY "Public guest inquiries insertion" ON inquiries 
FOR INSERT WITH CHECK (true);

-- 6. Policies: Listing hosts can view and update their inquiries
CREATE POLICY "Hosts can view own listing inquiries" ON inquiries 
FOR SELECT USING (
  listing_id IN (SELECT id FROM listings WHERE host_id = auth.uid())
  OR auth.role() = 'service_role'
);

CREATE POLICY "Hosts can update own listing inquiries" ON inquiries 
FOR UPDATE USING (
  listing_id IN (SELECT id FROM listings WHERE host_id = auth.uid())
) WITH CHECK (
  listing_id IN (SELECT id FROM listings WHERE host_id = auth.uid())
);
`;

/**
 * Client API functions simulating Supabase Server Actions
 */
export async function submitInquiry(inquiryData: {
  listingId: string;
  campsiteTitle: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  message?: string;
  startDate: string;
  endDate: string;
  guestsCount?: number;
  hostPlan: 'free' | 'pro' | 'premium';
}): Promise<SupabaseInquiry> {
  const isFree = inquiryData.hostPlan === 'free';
  const status = isFree ? 'free_inquiry' : 'pending';

  const newInquiry: SupabaseInquiry = {
    id: `inq-${Date.now()}`,
    listing_id: inquiryData.listingId,
    campsite_title: inquiryData.campsiteTitle,
    traveler_name: inquiryData.travelerName,
    traveler_email: inquiryData.travelerEmail,
    traveler_phone: inquiryData.travelerPhone,
    message: inquiryData.message,
    start_date: inquiryData.startDate,
    end_date: inquiryData.endDate,
    guests_count: inquiryData.guestsCount || 1,
    status,
    host_plan: inquiryData.hostPlan,
    created_at: new Date().toISOString(),
  };

  return newInquiry;
}
