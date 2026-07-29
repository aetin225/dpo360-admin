import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mludvtzvcapdrqcjiytf.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdWR2dHp2Y2FwZHJxY2ppeXRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU3NDQxMiwiZXhwIjoyMDk4MTUwNDEyfQ.KlenTwY0dAk_7O7cyfSgrnWVR202LCm42JjzUtx-Igs'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdWR2dHp2Y2FwZHJxY2ppeXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzQ0MTIsImV4cCI6MjA5ODE1MDQxMn0.OUezOCwBhaK1hkJ9UVysMrq-oQaIJzXu3mmd8c12BH8'

// Client normal pour la connexion admin
export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true }
})

// Client admin avec service_role pour créer des utilisateurs
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, storageKey: 'sb-admin-auth-token' }
})
