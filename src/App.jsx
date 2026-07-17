import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import NouvelleOrganisation from './pages/NouvelleOrganisation'
import SuperAdmins from './pages/SuperAdmins'

const NAV = [
  { id: 'dashboard', label: 'Organisations', icon: '🏢' },
  { id: 'super-admins', label: 'Super Admins', icon: '🛡' },
]

export default function App() {
  const { user, isSuperAdmin, noSuperAdmin, loading, signOut } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [showNew, setShowNew] = useState(false)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1b2e', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ color: '#fff', fontSize: 16 }}>Chargement...</div>
    </div>
  )

  if (noSuperAdmin) return <Setup onComplete={() => window.location.reload()} />

  if (!user) {
    // Vérifier si c'est la première fois (aucun super admin)
    return <Login />
  }

  if (!isSuperAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1b2e', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚫</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Accès refusé</h2>
        <p style={{ fontSize: 15, color: '#888780', marginBottom: '1.5rem' }}>Vous n'êtes pas super administrateur.</p>
        <button onClick={signOut} style={{ padding: '10px 20px', borderRadius: 8, background: '#1F4E79', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15 }}>Se déconnecter</button>
      </div>
    </div>
  )

  const renderPage = () => {
    if (showNew) return <NouvelleOrganisation onBack={() => setShowNew(false)} onCreated={() => { setShowNew(false); setPage('dashboard') }} />
    if (page === 'super-admins') return <SuperAdmins />
    return <Dashboard />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: 'linear-gradient(180deg,#0d1b2e,#0a1628)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '3px solid transparent', borderImage: 'linear-gradient(90deg,#1F4E79,#534AB7) 1', background: '#0f2140' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2, marginBottom: 2 }}>LE CORRESPONDANT</div>
          <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,159,39,0.2)', color: '#EF9F27', display: 'inline-block', letterSpacing: 1 }}>SUPER ADMIN</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setShowNew(false) }}
              style={{ width: 'calc(100% - 16px)', margin: '2px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: page === n.id && !showNew ? 'rgba(83,74,183,0.2)' : 'none', border: 'none', borderLeft: page === n.id && !showNew ? '3px solid #534AB7' : '3px solid transparent', color: page === n.id && !showNew ? '#fff' : '#6b8aaa', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span style={{ fontWeight: page === n.id && !showNew ? 600 : 400 }}>{n.label}</span>
            </button>
          ))}

          <div style={{ margin: '8px 16px', borderTop: '1px solid #1e3a5f' }} />

          <button onClick={() => { setShowNew(true); setPage('') }}
            style={{ width: 'calc(100% - 16px)', margin: '2px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: showNew ? 'rgba(15,110,86,0.2)' : 'none', border: 'none', borderLeft: showNew ? '3px solid #0F6E56' : '3px solid transparent', color: showNew ? '#fff' : '#6b8aaa', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
            <span style={{ fontSize: 16 }}>➕</span>
            <span style={{ fontWeight: showNew ? 600 : 400 }}>Nouvelle organisation</span>
          </button>
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1e3a5f' }}>
          <div style={{ fontSize: 12, color: '#4a8ab5', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a8ab5', fontSize: 12, padding: 0 }}>⏻ Déconnexion</button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        {renderPage()}
      </div>
    </div>
  )
}
