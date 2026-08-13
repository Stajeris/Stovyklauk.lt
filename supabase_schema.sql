-- ========================================================
-- CAMPY.LT SUPABASE DATABASE SCHEMA SQL
-- Execute this SQL script in Supabase SQL Editor
-- ========================================================

-- 1. PROFILES TABLE (Stores user role: 'traveler' | 'host')
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('traveler', 'host', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPSITES TABLE (Stovyklavietės / Sklypai)
CREATE TABLE IF NOT EXISTS public.campsites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  price_per_night NUMERIC NOT NULL,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '12:00',
  gate_code TEXT,
  wifi_password TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS TABLE (Rezervacijos)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campsite_id UUID REFERENCES public.campsites(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESERVATIONS TABLE (Alternative / Direct schema)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campsite_id UUID REFERENCES public.campsites(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_campsite_id ON public.reservations(campsite_id);
CREATE INDEX IF NOT EXISTS idx_reservations_traveler_id ON public.reservations(traveler_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campsites RLS
CREATE POLICY "Campsites viewable by everyone" ON public.campsites FOR SELECT USING (true);
CREATE POLICY "Hosts can insert own campsites" ON public.campsites FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own campsites" ON public.campsites FOR UPDATE USING (auth.uid() = host_id);

-- Bookings & Reservations RLS
CREATE POLICY "Bookings viewable by guest or host" ON public.bookings FOR SELECT USING (
  auth.uid() = guest_id OR 
  auth.uid() IN (SELECT host_id FROM public.campsites WHERE id = campsite_id)
);
CREATE POLICY "Guests can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can update booking status" ON public.bookings FOR UPDATE USING (
  auth.uid() IN (SELECT host_id FROM public.campsites WHERE id = campsite_id)
);

CREATE POLICY "Reservations viewable by traveler or host" ON public.reservations FOR SELECT USING (
  auth.uid() = traveler_id OR 
  auth.uid() IN (SELECT host_id FROM public.campsites WHERE id = campsite_id)
);
CREATE POLICY "Travelers can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can update reservation status" ON public.reservations FOR UPDATE USING (
  auth.uid() IN (SELECT host_id FROM public.campsites WHERE id = campsite_id)
);
