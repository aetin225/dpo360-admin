import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Client normal pour la connexion admin
export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true }
})

// Client admin avec service_role pour créer des utilisateurs
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, storageKey: 'sb-admin-auth-token' }
})