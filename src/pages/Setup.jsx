import { useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

const S = { padding: '11px 14px', borderRadius: 8, border: '1px solid #d3d1c7', background: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }

export default function Setup({ onComplete }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Code secret pour protéger la création du premier super admin
  const CODE_SECRET = 'ARTCI2013450'

  async function creerSuperAdmin() {
    if (code !== CODE_SECRET) { setError('Code secret incorrect.'); return }
    if (!email?.trim() || !password?.trim()) { setError('Email et mot de passe obligatoires.'); return }
    if (password.length < 8) { setError('Mot de passe : 8 caractères minimum.'); return }
    setLoading(true); setError('')

    try {
      // Créer le compte via l'API admin
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { nom }
      })

      if (authErr) {
        // Si le compte existe déjà, récupérer l'user_id
        if (authErr.message.includes('already')) {
          const { data: { user } } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
          if (!user) { setError('Compte existant mais mot de passe incorrect.'); setLoading(false); return }
          await supabaseAdmin.from('super_admins').insert({ user_id: user.id, email: email.trim(), nom })
          await supabase.auth.signOut()
          onComplete()
          return
        }
        setError('Erreur : ' + authErr.message); setLoading(false); return
      }

      // Ajouter dans super_admins
      const { error: insertErr } = await supabaseAdmin.from('super_admins').insert({
        user_id: authData.user.id,
        email: email.trim(),
        nom: nom || email.trim()
      })

      if (insertErr) { setError('Erreur insertion : ' + insertErr.message); setLoading(false); return }

      // Connecter l'utilisateur créé
      await supabase.auth.signInWithPassword({ email: email.trim(), password })

      setLoading(false)
      window.location.href = window.location.href
    } catch (e) {
      setError('Erreur : ' + e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1b2e,#1F4E79)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🛡</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F4E79', marginBottom: 6 }}>Configuration initiale</h1>
          <p style={{ fontSize: 14, color: '#888780', lineHeight: 1.6 }}>
            Créez le compte Super Administrateur de la plateforme LE CORRESPONDANT.
          </p>
        </div>

        <div style={{ background: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: 10, padding: '12px 14px', marginBottom: '1.5rem', fontSize: 13, color: '#633806' }}>
          ⚠ Cette page n'est accessible qu'une seule fois. Une fois le super admin créé, elle ne sera plus disponible.
        </div>

        {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#791F1F', marginBottom: '1rem' }}>{error}</div>}

        {[
          ['code', 'Code secret *', 'Code fourni par le cabinet', 'password'],
          ['nom', 'Nom complet', 'Ex : ETIN Nicet'],
          ['email', 'Email *', 'votre@email.com', 'email'],
          ['password', 'Mot de passe *', 'Min. 8 caractères', 'password'],
        ].map(([id, lbl, ph, type = 'text']) => (
          <div key={id} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>{lbl}</div>
            <input
              type={type}
              value={id === 'code' ? code : id === 'nom' ? nom : id === 'email' ? email : password}
              onChange={e => {
                if (id === 'code') setCode(e.target.value)
                else if (id === 'nom') setNom(e.target.value)
                else if (id === 'email') setEmail(e.target.value)
                else setPassword(e.target.value)
              }}
              placeholder={ph} style={S}
            />
          </div>
        ))}

        <button onClick={creerSuperAdmin} disabled={loading}
          style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#1F4E79', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
          {loading ? 'Création...' : '✓ Créer le Super Admin'}
        </button>
      </div>
    </div>
  )
}
