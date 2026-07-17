import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ orgs: 0, actives: 0, expirees: 0, membres: 0 })
  const [organisations, setOrganisations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: orgs } = await supabase
      .from('organisations')
      .select('*, membres(count)')
      .order('created_at', { ascending: false })

    const today = new Date().toISOString().split('T')[0]
    const actives = (orgs || []).filter(o => o.licence_fin >= today && o.licence_statut === 'active').length
    const expirees = (orgs || []).filter(o => !o.licence_fin || o.licence_fin < today || o.licence_statut !== 'active').length

    setOrganisations(orgs || [])
    setStats({ orgs: orgs?.length || 0, actives, expirees, membres: 0 })
    setLoading(false)
  }

  async function toggleStatut(org) {
    const newStatut = org.licence_statut === 'active' ? 'suspendue' : 'active'
    await supabase.from('organisations').update({ licence_statut: newStatut }).eq('id', org.id)
    await load()
  }

  async function renouveler(org) {
    const nouvelleFin = new Date()
    nouvelleFin.setFullYear(nouvelleFin.getFullYear() + 1)
    await supabase.from('organisations').update({
      licence_fin: nouvelleFin.toISOString().split('T')[0],
      licence_statut: 'active'
    }).eq('id', org.id)
    await load()
  }

  const today = new Date().toISOString().split('T')[0]
  const statutBadge = (org) => {
    if (org.licence_statut === 'suspendue') return { label: 'Suspendue', bg: '#F1EFE8', color: '#444' }
    if (!org.licence_fin || org.licence_fin < today) return { label: 'Expirée', bg: '#FCEBEB', color: '#791F1F' }
    const jours = Math.ceil((new Date(org.licence_fin) - new Date()) / (1000*60*60*24))
    if (jours <= 30) return { label: `Expire dans ${jours}j`, bg: '#FAEEDA', color: '#633806' }
    return { label: 'Active', bg: '#E1F5EE', color: '#085041' }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Vue d'ensemble</h1>
        <p style={{ fontSize: 15, color: '#888780' }}>Toutes les organisations clientes</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: '2rem' }}>
        {[
          { label: 'Organisations', value: stats.orgs, color: '#1F4E79', icon: '🏢' },
          { label: 'Licences actives', value: stats.actives, color: '#0F6E56', icon: '✅' },
          { label: 'Licences expirées', value: stats.expirees, color: '#A32D2D', icon: '⚠' },
          { label: 'Total membres', value: stats.membres, color: '#534AB7', icon: '👥' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{loading ? '—' : s.value}</div>
            <div style={{ fontSize: 13, color: '#888780' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Liste organisations */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Organisations ({organisations.length})</h2>
        </div>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#888780' }}>Chargement...</div>
          : organisations.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: '#888780' }}>Aucune organisation</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Organisation', 'Secteur', 'Plan', 'Licence début', 'Licence fin', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#888780', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organisations.map(org => {
                  const badge = statutBadge(org)
                  return (
                    <tr key={org.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{org.nom}</div>
                        <div style={{ fontSize: 13, color: '#888780' }}>{org.adresse || '—'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: '#5F5E5A' }}>{org.secteur || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 10, background: '#EEEDFE', color: '#534AB7', fontWeight: 500 }}>{org.plan || 'starter'}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>{org.licence_debut || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>{org.licence_fin || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 10, background: badge.bg, color: badge.color, fontWeight: 500 }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => renouveler(org)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#0F6E56', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            +1 an
                          </button>
                          <button onClick={() => toggleStatut(org)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: org.licence_statut === 'active' ? '#FAEEDA' : '#E1F5EE', border: 'none', color: org.licence_statut === 'active' ? '#633806' : '#085041', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            {org.licence_statut === 'active' ? 'Suspendre' : 'Activer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}
