-- TABLE SUPER ADMINS
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  nom TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON super_admins TO anon, authenticated;
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- Insérer le super admin principal (à exécuter après avoir récupéré le user_id)
-- INSERT INTO super_admins (user_id, email, nom) VALUES ('VOTRE_USER_ID', 'etinanicet2@gmail.com', 'Super Admin');

NOTIFY pgrst, 'reload schema';
