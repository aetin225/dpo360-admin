import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SUPER_ADMINS = ['etinanicet2@gmail.com']

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [noSuperAdmin, setNoSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      checkSuperAdmin(u)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      checkSuperAdmin(u)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkSuperAdmin(u) {
    // Vérifier si des super admins existent
    const { data: allAdmins } = await supabase.from('super_admins').select('id')
    if (!allAdmins || allAdmins.length === 0) {
      setNoSuperAdmin(true)
      setLoading(false)
      return
    }
    setNoSuperAdmin(false)
    if (!u) { setIsSuperAdmin(false); setLoading(false); return }
    const { data } = await supabase.from('super_admins').select('id').eq('user_id', u.id)
    setIsSuperAdmin((data && data.length > 0) || SUPER_ADMINS.includes(u.email))
    setLoading(false)
  }

  return { user, isSuperAdmin, noSuperAdmin, loading, signOut: () => supabase.auth.signOut() }
}
