import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const S = { padding: '11px 14px', borderRadius: 8, border: '1px solid #d3d1c7', background: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }

export default function SuperAdmins() {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('super_admins').select('*').order('created_at')
    setAdmins(data || [])
  }

  async function ajouter() {
    if (!email?.trim()) return
    setSaving(true)
    // Chercher le user_id par email
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email.trim())
    if (!user) { setMsg('Utilisateur non trouvé. Il doit d\'abord créer un compte.'); setSaving(false); return }
    const { error } = await supabase.from('super_admins').insert({ user_id: user.id, email: email.trim(), nom })
    if (error) { setMsg('Erreur : ' + error.message); setSaving(false); return }
    setMsg('Super admin ajouté ✓')
    setEmail(''); setNom('')
    setSaving(false)
    await load()
    setTimeout(() => setMsg(''), 3000)
  }

  async function supprimer(id) {
    if (!confirm('Supprimer ce super admin ?')) return
    await supabase.from('super_admins').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Super Administrateurs</h1>
        <p style={{ fontSize: 15, color: '#888780' }}>Gérez les accès au panel d'administration</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>Ajouter un super admin</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom complet" style={{ ...S, flex: 1, minWidth: 160 }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" style={{ ...S, flex: 2, minWidth: 200 }} />
          <button onClick={ajouter} disabled={saving}
            style={{ padding: '11px 20px', borderRadius: 8, background: '#1F4E79', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {saving ? '...' : '+ Ajouter'}
          </button>
        </div>
        {msg && <div style={{ marginTop: 10, fontSize: 14, color: msg.includes('✓') ? '#085041' : '#791F1F' }}>{msg}</div>}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Super admins ({admins.length})</h2>
        </div>
        {admins.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1F4E79,#534AB7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {a.email.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{a.nom || a.email}</div>
                <div style={{ fontSize: 13, color: '#888780' }}>{a.email}</div>
              </div>
            </div>
            <button onClick={() => supprimer(a.id)}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #F09595', background: '#fff', color: '#D85A30', cursor: 'pointer', fontSize: 13 }}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
