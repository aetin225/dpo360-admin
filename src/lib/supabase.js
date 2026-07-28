import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://db.lecorrespondant.ci'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q'
const ANON_KEY = 'd04335fd8622d9a272c1f2fbc7575a87913689fa35c57d0540c88f5942689f91'

export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true }
})

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, storageKey: 'sb-admin-auth-token' }
})