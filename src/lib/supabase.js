// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabaseURL = import.meta.env.VITE_SUPABASE_URL || 'https://qfahagyxugfjzrigkmkp.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REQUIRE_MANUAL_CONFIG'

export const supabase = createClient(supabaseURL, supabaseAnonKey)
