const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings/notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT email_contact, email_visiteur, email_media, resume_hebdo FROM notification_preferences WHERE user_id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      const defaults = { email_contact: true, email_visiteur: true, email_media: false, resume_hebdo: true };
      return res.json(defaults);
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get notification prefs error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/notifications
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const { email_contact, email_visiteur, email_media, resume_hebdo } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO notification_preferences (user_id, email_contact, email_visiteur, email_media, resume_hebdo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET email_contact = $2, email_visiteur = $3, email_media = $4, resume_hebdo = $5, updated_at = NOW()
       RETURNING email_contact, email_visiteur, email_media, resume_hebdo`,
      [req.user.id, email_contact, email_visiteur, email_media, resume_hebdo]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Update notification prefs error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et email requis' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur ou email est déjà utilisé' });
    }

    await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3',
      [username, email, req.user.id]
    );

    const { rows } = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

module.exports = router;
