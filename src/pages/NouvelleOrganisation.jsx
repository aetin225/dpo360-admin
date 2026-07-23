import { useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

const S = { padding: '11px 14px', borderRadius: 8, border: '1px solid #d3d1c7', background: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1a1a1a' }

export default function NouvelleOrganisation({ onBack, onCreated }) {
  const [form, setForm] = useState({ nom: '', secteur: '', effectif: '', forme: 'SA', adresse: '', plan: 'starter', admin_email: '', admin_password: '', admin_nom: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1=org, 2=admin

  async function creer() {
    if (!form.nom?.trim()) { setError("Le nom est obligatoire."); return }
    if (!form.admin_email?.trim() || !form.admin_password?.trim()) { setError("Email et mot de passe admin obligatoires."); return }
    if (form.admin_password.length < 8) { setError("Mot de passe : 8 caractères minimum."); return }

    setSaving(true); setError('')

    // 1. Créer l'organisation
    const debut = new Date().toISOString().split('T')[0]
    const fin = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]

    const { data: org, error: orgErr } = await supabase.from('organisations').insert({
      nom: form.nom, secteur: form.secteur, effectif: form.effectif,
      forme: form.forme, adresse: form.adresse, plan: form.plan,
      licence_debut: debut, licence_fin: fin, licence_statut: 'active'
    }).select().single()

    if (orgErr) { setError('Erreur organisation : ' + orgErr.message); setSaving(false); return }

    // 2. Créer le compte admin via API admin
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: form.admin_email.trim(),
      password: form.admin_password,
      email_confirm: true,
      user_metadata: { nom: form.admin_nom, password_changed: false }
    })

    if (authErr) { setError('Erreur compte admin : ' + authErr.message); setSaving(false); return }

    // 3. Ajouter dans membres comme admin
    await supabase.from('membres').insert({
      organisation_id: org.id,
      user_id: authData.user.id,
      role: 'admin',
      invited_email: form.admin_email.trim(),
      statut: 'actif'
    })

    // Envoyer email de bienvenue via Supabase
    try {
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: form.admin_email.trim(),
      })
    } catch (e) { console.warn('Email bienvenue:', e) }

    setSaving(false)
    alert(`Organisation "${form.nom}" créée avec succès !\n\nIdentifiants transmis à ${form.admin_email} :\n• Email : ${form.admin_email}\n• Mot de passe temporaire : ${form.admin_password}\n• URL : https://lecorrespondant.ci\n\nCommuniquez ces informations à l'administrateur.`)
    onCreated()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F4E79', fontSize: 15 }}>← Retour</button>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Nouvelle organisation</h1>
      </div>

      {error && <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, color: '#791F1F' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Organisation */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1.25rem', color: '#1F4E79' }}>🏢 Organisation</h2>
          {[
            ['nom', 'Nom de l\'organisation *', 'Ex : Cabinet Konan & Associés'],
            ['secteur', 'Secteur d\'activité', 'Ex : Finance, Santé, Télécom'],
            ['effectif', 'Effectif', 'Ex : 50 employés'],
            ['adresse', 'Adresse', 'Ex : Plateau, Abidjan'],
          ].map(([id, lbl, ph]) => (
            <div key={id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>{lbl}</div>
              <input value={form[id] || ''} onChange={e => setForm({ ...form, [id]: e.target.value })} placeholder={ph} style={S} />
            </div>
          ))}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>Forme juridique</div>
            <select value={form.forme} onChange={e => setForm({ ...form, forme: e.target.value })} style={S}>
              {['SA','SARL','SAS','GIE','EPIC','Association','Autre'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>Plan</div>
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={S}>
              {['starter','pro','enterprise'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ padding: '12px 14px', background: '#E1F5EE', borderRadius: 8, fontSize: 14, color: '#085041' }}>
            📅 Licence : 1 an à partir d'aujourd'hui
          </div>
        </div>

        {/* Compte Admin */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1.25rem', color: '#534AB7' }}>👤 Compte administrateur</h2>
          <p style={{ fontSize: 14, color: '#888780', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Créez le compte de l'administrateur de cette organisation. Il pourra ensuite inviter d'autres membres.
          </p>
          {[
            ['admin_nom', 'Nom complet', 'Ex : Ama KOUASSI'],
            ['admin_email', 'Email *', 'Ex : admin@entreprise.ci'],
            ['admin_password', 'Mot de passe temporaire *', 'Min. 8 caractères'],
          ].map(([id, lbl, ph]) => (
            <div key={id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 6, fontWeight: 500 }}>{lbl}</div>
              <input
                type={id === 'admin_password' ? 'password' : 'text'}
                value={form[id] || ''}
                onChange={e => setForm({ ...form, [id]: e.target.value })}
                placeholder={ph} style={S}
              />
            </div>
          ))}
          <div style={{ padding: '12px 14px', background: '#FAEEDA', borderRadius: 8, fontSize: 14, color: '#633806', marginTop: '0.5rem' }}>
            ⚠ Communiquez ces identifiants à l'administrateur de l'organisation.
          </div>
        </div>
      </div>

      {/* Récapitulatif email à envoyer */}
      <div style={{ background: '#E1F5EE', border: '1px solid #0F6E56', borderRadius: 12, padding: '1.25rem 1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: '#0F6E56', marginBottom: 8 }}>📧 Email de bienvenue — à envoyer manuellement</div>
        <div style={{ fontSize: 14, color: '#085041', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#fff', padding: '12px', borderRadius: 8, border: '1px solid #0F6E5630' }}>
{`Bonjour,

Votre espace de conformité DCP est prêt.

🔗 Accès : https://lecorrespondant.ci
📧 Email : ${form.admin_email || '[email admin]'}
🔑 Mot de passe : ${form.admin_password ? '••••••••' : '[mot de passe]'}

Connectez-vous et changez votre mot de passe dès la première connexion.

Cordialement,
LE CORRESPONDANT — Conformité DCP · ARTCI`}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button onClick={creer} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 10, background: '#1F4E79', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Création...' : '✓ Créer l\'organisation'}
        </button>
      </div>
    </div>
  )
}
