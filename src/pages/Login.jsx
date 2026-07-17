import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const S = { padding: '11px 14px', borderRadius: 8, border: '1px solid #d3d1c7', background: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiants incorrects.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1b2e,#1F4E79)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛡</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F4E79', marginBottom: 4 }}>Panel Super Admin</h1>
          <p style={{ fontSize: 14, color: '#888780' }}>LE CORRESPONDANT · Accès réservé</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={S} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>Mot de passe</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={S} required />
          </div>
          {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#791F1F', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#1F4E79', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
