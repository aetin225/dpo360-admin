import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  'https://mludvtzvcapdrqcjiytf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdWR2dHp2Y2FwZHJxY2ppeXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzQ0MTIsImV4cCI6MjA5ODE1MDQxMn0.OUezOCwBhaK1hkJ9UVysMrq-oQaIJzXu3mmd8c12BH8',
  { auth: { autoRefreshToken: true, persistSession: true } }
)
