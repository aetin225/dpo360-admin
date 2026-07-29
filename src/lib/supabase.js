import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://db.lecorrespondant.ci'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.YE9YKkrAZTgMIe_Pe5lj6QfJHLsndg8GR5g2La33yqE'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.eEDGy575BPTAi9GIaTYg3ggs0a3He5My5u4zeNsrT3E'

// Client normal pour la connexion admin
export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true }
})

// Client admin avec service_role pour créer des utilisateurs
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, storageKey: 'sb-admin-auth-token' }
})
