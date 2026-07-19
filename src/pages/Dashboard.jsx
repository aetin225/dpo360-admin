import { useState, useEffect } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ orgs: 0, actives: 0, expirees: 0, membres: 0 })
  const [organisations, setOrganisations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOrg, setEditOrg] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)

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

  async function supprimer(org) {
    if (!confirm('Supprimer definitivement ' + org.nom + ' ? Toutes les donnees seront supprimees. Cette action est irreversible.')) return
    const id = org.id
    const tables = ['traitements','demandes_droits','violations','documents','consentements','personnes','sous_traitants','bilans_annuels','evaluations_conformite','parametres','questions_m1','historique_conservation','invitations','membres','formations']
    for (const table of tables) {
      await supabaseAdmin.from(table).delete().eq('organisation_id', id)
    }
    const { error } = await supabaseAdmin.from('organisations').delete().eq('id', id)
    if (error) { alert('Erreur suppression : ' + error.message); return }
    await load()
  }

  async function modifierAdmin() {
    if (!editForm.email?.trim()) { alert('Email obligatoire.'); return }
    setEditSaving(true)
    // Mettre à jour le membre admin
    const { data: membres } = await supabaseAdmin.from('membres')
      .select('*').eq('organisation_id', editOrg.id).eq('role', 'admin')
    if (membres && membres.length > 0) {
      await supabaseAdmin.from('membres').update({
        invited_email: editForm.email.trim()
      }).eq('id', membres[0].id)
      // Mettre à jour le mot de passe si renseigné
      if (editForm.password?.trim() && editForm.password.length >= 8) {
        await supabaseAdmin.auth.admin.updateUserById(membres[0].user_id, {
          email: editForm.email.trim(),
          password: editForm.password
        })
      } else {
        await supabaseAdmin.auth.admin.updateUserById(membres[0].user_id, {
          email: editForm.email.trim()
        })
      }
    }
    // Mettre à jour l'organisation
    await supabaseAdmin.from('organisations').update({
      nom: editForm.nom,
      secteur: editForm.secteur,
      plan: editForm.plan,
      licence_fin: editForm.licence_fin,
      licence_statut: editForm.licence_statut,
    }).eq('id', editOrg.id)
    setEditSaving(false)
    setEditOrg(null)
    await load()
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
                          <button onClick={() => { setEditOrg(org); setEditForm({ nom: org.nom, secteur: org.secteur || '', plan: org.plan || 'starter', licence_fin: org.licence_fin || '', licence_statut: org.licence_statut || 'active', email: '', password: '' }) }}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#534AB7', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            ✎ Modifier
                          </button>
                          <button onClick={() => renouveler(org)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#0F6E56', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            +1 an
                          </button>
                          <button onClick={() => toggleStatut(org)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: org.licence_statut === 'active' ? '#FAEEDA' : '#E1F5EE', border: 'none', color: org.licence_statut === 'active' ? '#633806' : '#085041', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            {org.licence_statut === 'active' ? 'Suspendre' : 'Activer'}
                          </button>
                          <button onClick={() => supprimer(org)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#FCEBEB', border: 'none', color: '#791F1F', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                            🗑 Supprimer
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
    {/* Modal modification */}
      {editOrg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Modifier — {editOrg.nom}</h2>
              <button onClick={() => setEditOrg(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            <div style={{ borderBottom: '1px solid #e8eaed', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#534AB7', marginBottom: '0.75rem' }}>🏢 Organisation</div>
              {[['nom','Nom'],['secteur','Secteur']].map(([id,lbl]) => (
                <div key={id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>{lbl}</div>
                  <input value={editForm[id] || ''} onChange={e => setEditForm({...editForm,[id]:e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>Plan</div>
                  <select value={editForm.plan || 'starter'} onChange={e => setEditForm({...editForm,plan:e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit' }}>
                    {['starter','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>Statut licence</div>
                  <select value={editForm.licence_statut || 'active'} onChange={e => setEditForm({...editForm,licence_statut:e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit' }}>
                    {['active','suspendue','expiree'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>Date expiration licence</div>
                <input type="date" value={editForm.licence_fin || ''} onChange={e => setEditForm({...editForm,licence_fin:e.target.value})}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F4E79', marginBottom: '0.75rem' }}>👤 Compte administrateur</div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>Nouvel email</div>
                <input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm,email:e.target.value})}
                  placeholder="nouveau@email.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 4 }}>Nouveau mot de passe (laisser vide pour ne pas changer)</div>
                <input type="password" value={editForm.password || ''} onChange={e => setEditForm({...editForm,password:e.target.value})}
                  placeholder="Min. 8 caractères"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d3d1c7', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setEditOrg(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d3d1c7', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Annuler</button>
              <button onClick={modifierAdmin} disabled={editSaving}
                style={{ padding: '10px 24px', borderRadius: 8, background: '#1F4E79', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {editSaving ? 'Enregistrement...' : '✓ Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
