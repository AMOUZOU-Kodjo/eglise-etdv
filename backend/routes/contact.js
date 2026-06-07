const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { Resend } = require('resend');

const router = express.Router();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST /api/contact (public)
router.post('/', async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;
    if (!nom || !email || !message) {
      return res.status(400).json({ error: 'Nom, email et message sont requis' });
    }

    const { rows } = await pool.query(
      'INSERT INTO contacts (nom, email, sujet, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, email, sujet || null, message]
    );

    // Envoi email via Resend (si RESEND_API_KEY configuré)
    if (resend && process.env.CONTACT_EMAIL) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'ETDV <onboarding@resend.dev>',
          to: process.env.CONTACT_EMAIL,
          replyTo: email,
          subject: `Nouveau message de ${nom}: ${sujet || 'Contact'}`,
          html: `
            <h3>Nouveau message depuis le formulaire de contact</h3>
            <p><strong>Nom:</strong> ${nom}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sujet:</strong> ${sujet || '-'}</p>
            <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (emailErr) {
        console.warn('Resend email warning:', emailErr.message);
      }
    }

    res.status(201).json({ message: 'Message envoyé avec succès', id: rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

// GET /api/contact (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/contact/:id/lu (admin - marquer comme lu)
router.put('/:id/lu', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE contacts SET lu = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marqué comme lu' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/contact/:id (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
