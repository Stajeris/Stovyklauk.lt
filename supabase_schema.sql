-- ====================================================================
-- CAMPY.LT - SUPABASE DATABASE MIGRATION SCRIPT
-- Upgrade: Pro Plan Pitch-Level Inventory, iCal Sync, Dynamic Pricing & Email Logs
-- ====================================================================

-- Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LISTINGS (CAMPSITES) TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL DEFAULT 'campsite', -- campsite, camper_pitch, glamping, cabin
    price_per_night NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    max_guests INT NOT NULL DEFAULT 4,
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL DEFAULT 'Aukštaitija',
    latitude NUMERIC(10, 6) DEFAULT 55.058120,
    longitude NUMERIC(10, 6) DEFAULT 25.452310,
    address_line VARCHAR(255),
    postal_code VARCHAR(20),
    is_pro BOOLEAN NOT NULL DEFAULT true,
    host_id UUID NOT NULL,
    cancellation_policy VARCHAR(50) NOT NULL DEFAULT 'lanksti',
    rules JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PITCHES (SUB-UNITS) TABLE
CREATE TABLE IF NOT EXISTS public.pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Vieta A - Ant ežero kranto (su elektra)"
    type VARCHAR(50) NOT NULL DEFAULT 'tent', -- tent, camper, glamping, cabin
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    max_guests INT NOT NULL DEFAULT 4,
    has_electricity BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, maintenance, disabled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pitch lookups by listing
CREATE INDEX IF NOT EXISTS idx_pitches_listing_id ON public.pitches(listing_id);

-- 3. SEASONAL PRICING RULES TABLE
CREATE TABLE IF NOT EXISTS public.seasonal_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE, -- NULL applies to whole listing
    name VARCHAR(255) NOT NULL, -- e.g., "Joninių Sūkurys", "Vasaros Pikis"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_night NUMERIC(10, 2), -- fixed price override
    multiplier NUMERIC(4, 2) DEFAULT 1.00, -- e.g., 1.30 = +30%
    minimum_nights INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seasonal_rules_listing ON public.seasonal_pricing_rules(listing_id, start_date, end_date);

-- 4. ICAL FEEDS & IMPORTED CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.ical_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Airbnb Calendar',
    feed_url TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.imported_calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ical_feed_id UUID NOT NULL REFERENCES public.ical_feeds(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
    summary VARCHAR(255) DEFAULT 'Išorinė rezervacija (iCal)',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.imported_calendar_events(listing_id, pitch_id, start_date, end_date);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES public.pitches(id) ON DELETE SET NULL,
    pitch_name VARCHAR(255),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_note TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_nights INT NOT NULL DEFAULT 1,
    nightly_rate NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00,
    service_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed, free_inquiry
    escrow_status VARCHAR(50) DEFAULT 'held_in_escrow',
    stripe_payment_status VARCHAR(50) DEFAULT 'succeeded',
    payment_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_listing ON public.bookings(listing_id, check_in, check_out);

-- 6. AUTOMATED EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.automated_email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- welcome_user, welcome_host, reservation_confirmed, etc.
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_preview TEXT,
    html_body TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.automated_email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_listing ON public.automated_email_logs(listing_id);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_email_logs ENABLE ROW LEVEL SECURITY;

-- Email Logs Policy: Users and Hosts can view their own sent email logs
CREATE POLICY "Users and hosts view their email logs" ON public.automated_email_logs
    FOR SELECT USING (
        recipient_email = auth.jwt() ->> 'email' OR
        EXISTS (SELECT 1 FROM public.listings WHERE id = automated_email_logs.listing_id AND host_id = auth.uid()) OR
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Anyone or server can insert email logs" ON public.automated_email_logs
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- SUPABASE AUTH & CUSTOM SMTP CONFIGURATION GUIDE
-- ====================================================================
-- To use Supabase SMTP for auth emails (Signup confirmation, Reset Password, Magic Links):
-- 1. In Supabase Dashboard, go to Project Settings -> Authentication -> SMTP Settings.
-- 2. Enable Custom SMTP.
-- 3. Enter the following parameters:
--    - Sender Name: Campy.lt Stovyklavietės
--    - Sender Email: noreply@campy.lt
--    - Host: smtp.resend.com (or your SMTP host, e.g., smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com)
--    - Port: 587 (or 465 for SSL)
--    - Username: resend (or your SMTP user)
--    - Password: your_resend_api_key (e.g. re_123456789)
-- ====================================================================

-- Public Read Policy for Listings, Pitches & Seasonal Rules
CREATE POLICY "Public listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Public pitches are viewable by everyone" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Seasonal rules viewable by everyone" ON public.seasonal_pricing_rules FOR SELECT USING (true);

-- Host Modification Policies (Check host_id matches auth.uid)
CREATE POLICY "Hosts can manage their own listings" ON public.listings 
    FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Hosts can manage pitches for their listings" ON public.pitches 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = pitches.listing_id AND host_id = auth.uid())
    );

CREATE POLICY "Hosts can manage seasonal rules for their listings" ON public.seasonal_pricing_rules 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = seasonal_pricing_rules.listing_id AND host_id = auth.uid())
    );

-- Traveler Booking Creation Policy (Anyone can create a booking request without account)
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT WITH CHECK (true);

-- Bookings View Policy for Guests and Hosts
CREATE POLICY "Guests and hosts can view their relevant bookings" ON public.bookings 
    FOR SELECT USING (
        guest_email = auth.jwt() ->> 'email' OR
        EXISTS (SELECT 1 FROM public.listings WHERE id = bookings.listing_id AND host_id = auth.uid())
    );

-- Function to Auto-Update updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_modtime BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pitches_modtime BEFORE UPDATE ON public.pitches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Migration Completed
