require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Création des tables PostgreSQL...');

    await client.query(`
      -- ── Tables ──────────────────────────────────────────

      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        username     VARCHAR(100) UNIQUE NOT NULL,
        email        VARCHAR(255) UNIQUE NOT NULL,
        password     TEXT NOT NULL,
        role         VARCHAR(50) DEFAULT 'admin',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        content    TEXT NOT NULL,
        type       VARCHAR(20) CHECK(type IN ('message','news','verse')) NOT NULL,
        author     VARCHAR(255),
        date       TIMESTAMPTZ DEFAULT NOW(),
        featured   BOOLEAN DEFAULT FALSE,
        views      INTEGER DEFAULT 0,
        likes      INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS media (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT,
        url         TEXT NOT NULL,
        public_id   TEXT,
        type        VARCHAR(20) CHECK(type IN ('photo','video','audio')) NOT NULL,
        thumbnail   TEXT,
        duration    TEXT,
        tags        TEXT,
        views       INTEGER DEFAULT 0,
        downloads   INTEGER DEFAULT 0,
        likes       INTEGER DEFAULT 0,
        featured    BOOLEAN DEFAULT FALSE,
        date        TIMESTAMPTZ DEFAULT NOW(),
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS programs (
        id               SERIAL PRIMARY KEY,
        title            TEXT NOT NULL,
        description      TEXT,
        long_description TEXT,
        day              VARCHAR(50),
        time             VARCHAR(50),
        location         TEXT,
        category         VARCHAR(20) CHECK(category IN ('weekly','monthly','annual')) NOT NULL,
        type             VARCHAR(100),
        week             VARCHAR(50),
        month            VARCHAR(50),
        dates            TEXT,
        capacity         TEXT,
        leaders          JSONB,
        highlights       JSONB,
        color            VARCHAR(50),
        icon             VARCHAR(100),
        date             TIMESTAMPTZ DEFAULT NOW(),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS visitors (
        id           SERIAL PRIMARY KEY,
        nom          VARCHAR(255) NOT NULL,
        prenom       VARCHAR(255),
        email        VARCHAR(255),
        telephone    VARCHAR(50),
        message      TEXT,
        date_visite  DATE DEFAULT CURRENT_DATE,
        statut       VARCHAR(50) DEFAULT 'nouveau',
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stats (
        id          SERIAL PRIMARY KEY,
        date        DATE UNIQUE NOT NULL,
        visitors    INTEGER DEFAULT 0,
        page_views  INTEGER DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_logs (
        id          SERIAL PRIMARY KEY,
        admin_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action      TEXT,
        details     TEXT,
        ip_address  VARCHAR(50),
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(255) UNIQUE NOT NULL,
        nom        VARCHAR(255),
        active     BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);

      CREATE TABLE IF NOT EXISTS notification_preferences (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email_contact   BOOLEAN DEFAULT TRUE,
        email_visiteur  BOOLEAN DEFAULT TRUE,
        email_media     BOOLEAN DEFAULT FALSE,
        resume_hebdo    BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id         SERIAL PRIMARY KEY,
        nom        VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL,
        sujet      VARCHAR(255),
        message    TEXT NOT NULL,
        lu         BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- ── Index pour accélérer les requêtes fréquentes ────

      -- Posts : tri par date (ORDER BY date DESC) et filtre par type/featured
      CREATE INDEX IF NOT EXISTS idx_posts_date     ON posts (date DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_type     ON posts (type);
      CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured) WHERE featured = TRUE;

      -- Media : tri par date, filtre par type/featured
      CREATE INDEX IF NOT EXISTS idx_media_date     ON media (date DESC);
      CREATE INDEX IF NOT EXISTS idx_media_type     ON media (type);
      CREATE INDEX IF NOT EXISTS idx_media_featured ON media (featured) WHERE featured = TRUE;

      -- Programs : filtre par catégorie
      CREATE INDEX IF NOT EXISTS idx_programs_category   ON programs (category);
      CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs (created_at DESC);

      -- Visitors : filtre par statut, tri par date
      CREATE INDEX IF NOT EXISTS idx_visitors_statut     ON visitors (statut);
      CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors (created_at DESC);

      -- Contacts : filtre non lus
      CREATE INDEX IF NOT EXISTS idx_contacts_lu         ON contacts (lu) WHERE lu = FALSE;
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

      -- Stats : recherche par date
      CREATE INDEX IF NOT EXISTS idx_stats_date ON stats (date DESC);
    `);

    console.log('Tables et index créés avec succès');

    // Admin par défaut
    const { rows } = await client.query(
      'SELECT id FROM users WHERE username = $1', ['admin']
    );
    if (rows.length === 0) {
      const hashed = await bcrypt.hash('Admin123!', 10);
      await client.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@eglise.com', hashed, 'admin']
      );
      console.log('Compte admin créé : admin / Admin123!');
      console.log('IMPORTANT : Changez ce mot de passe dès la première connexion !');
    } else {
      console.log('Compte admin déjà existant — aucune modification.');
    }

    console.log('Migration terminée avec succès !');
  } catch (error) {
    console.error('Erreur de migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
