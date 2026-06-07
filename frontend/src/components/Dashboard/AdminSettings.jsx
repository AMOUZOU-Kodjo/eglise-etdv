// src/components/Dashboard/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Lock, Bell, Globe, Eye, EyeOff,
  Save, CheckCircle, Key, Mail, Shield, Info, Pencil
} from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Tab button ────────────────────────────────────────
const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
      active ? 'bg-accent text-white shadow-md' : 'hover:bg-base-200 text-base-content/70'
    }`}
  >
    <Icon size={16} className="flex-shrink-0" />
    {label}
  </button>
);

// ── Section card ──────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-base-100 rounded-2xl shadow-sm p-6">
    <h3 className="text-lg font-semibold mb-5 pb-3 border-b border-base-200">{title}</h3>
    {children}
  </div>
);

// ── Main ──────────────────────────────────────────────
const AdminSettings = () => {
  const { user, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');

  // ── Onglet Profil ─────────────────────────────────
  const ProfileTab = () => {
    const isSuperAdmin = user?.role === 'super_admin';
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setForm({ username: user?.username || '', email: user?.email || '' });
    }, [user]);

    const handleSave = async () => {
      if (!form.username || !form.email) return toast.error('Tous les champs sont requis');
      setSaving(true);
      try {
        const { data } = await api.put('/api/settings/profile', form);
        localStorage.setItem('authUser', JSON.stringify(data));
        setEditing(false);
        toast.success('Profil mis à jour');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Erreur de mise à jour');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <Section title="Informations du compte">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
              <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.username}</p>
                <p className="text-sm text-base-content/60">{user?.email}</p>
                <span className="badge badge-sm badge-accent mt-1 capitalize">{user?.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text font-medium block mb-1 flex items-center gap-1">
                  <User size={13} /> Nom d'utilisateur
                </label>
                <input value={form.username} readOnly={!editing}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  className={`input input-bordered w-full ${!editing ? 'bg-base-200 cursor-not-allowed' : ''}`} />
              </div>
              <div>
                <label className="label-text font-medium block mb-1 flex items-center gap-1">
                  <Mail size={13} /> Email
                </label>
                <input value={form.email} readOnly={!editing}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`input input-bordered w-full ${!editing ? 'bg-base-200 cursor-not-allowed' : ''}`} />
              </div>
            </div>

            {isSuperAdmin && !editing && (
              <button onClick={() => setEditing(true)} className="btn btn-accent btn-sm gap-2">
                <Pencil size={15} /> Modifier le profil
              </button>
            )}
            {isSuperAdmin && editing && (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn btn-accent btn-sm gap-2">
                  {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={15} />}
                  Enregistrer
                </button>
                <button onClick={() => { setEditing(false); setForm({ username: user?.username || '', email: user?.email || '' }); }} className="btn btn-ghost btn-sm">
                  Annuler
                </button>
              </div>
            )}
            {!isSuperAdmin && (
              <div className="p-3 bg-info/10 rounded-xl flex items-start gap-2 text-sm text-info">
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                <p>Pour modifier votre nom d'utilisateur ou email, contactez un super administrateur.</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    );
  };

  // ── Onglet Sécurité ───────────────────────────────
  const SecurityTab = () => {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [show, setShow]       = useState(false);
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState(false);

    const handle = (e) => {
      const { name, value } = e.target;
      setForm((p) => ({ ...p, [name]: value }));
    };

    const pwdChecks = [
      { ok: form.newPassword.length >= 8,    label: '8 caractères minimum' },
      { ok: /[A-Z]/.test(form.newPassword),  label: 'Une lettre majuscule' },
      { ok: /\d/.test(form.newPassword),     label: 'Un chiffre' },
      { ok: form.newPassword === form.confirm && form.confirm.length > 0, label: 'Mots de passe identiques' },
    ];
    const allOk = pwdChecks.every((c) => c.ok);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!allOk) return toast.error('Vérifiez les conditions du mot de passe');
      setSaving(true);
      const result = await changePassword(form.oldPassword, form.newPassword);
      setSaving(false);
      if (result.success) {
        setSuccess(true);
        setForm({ oldPassword: '', newPassword: '', confirm: '' });
        setTimeout(() => setSuccess(false), 4000);
      }
    };

    return (
      <Section title="Changer le mot de passe">
        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2 text-success text-sm">
            <CheckCircle size={16} /> Mot de passe modifié avec succès !
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {[
            { name: 'oldPassword', label: 'Mot de passe actuel', placeholder: 'Votre mot de passe actuel' },
            { name: 'newPassword', label: 'Nouveau mot de passe', placeholder: 'Min 8 car., 1 maj., 1 chiffre' },
            { name: 'confirm',    label: 'Confirmer le nouveau', placeholder: 'Répéter le nouveau mot de passe' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="label-text font-medium block mb-1 flex items-center gap-1">
                <Key size={13} /> {label}
              </label>
              <div className="relative">
                <input
                  name={name} type={show ? 'text' : 'password'}
                  value={form[name]} onChange={handle} required
                  className="input input-bordered w-full pr-10"
                  placeholder={placeholder}
                />
                {name === 'oldPassword' && (
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {form.newPassword && (
            <ul className="space-y-1.5">
              {pwdChecks.map(({ ok, label }) => (
                <li key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-success' : 'text-base-content/40'}`}>
                  <CheckCircle size={12} className={ok ? '' : 'opacity-30'} /> {label}
                </li>
              ))}
            </ul>
          )}

          <button type="submit" disabled={saving || !allOk}
            className="btn btn-accent btn-sm gap-2">
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save size={15} />
            )}
            Changer le mot de passe
          </button>
        </form>
      </Section>
    );
  };

  // ── Onglet Notifications ──────────────────────────
  const NotifTab = () => {
    const [prefs, setPrefs] = useState({
      emailContact:    true,
      emailVisiteur:   true,
      emailMedia:      false,
      resumeHebdo:     true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          const { data } = await api.get('/api/settings/notifications');
          setPrefs({
            emailContact:  data.email_contact,
            emailVisiteur: data.email_visiteur,
            emailMedia:    data.email_media,
            resumeHebdo:   data.resume_hebdo,
          });
        } catch (err) {
          console.warn('Erreur chargement préférences:', err.message);
        } finally {
          setLoading(false);
        }
      })();
    }, []);

    const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

    const toggleKeyMap = {
      emailContact:  'email_contact',
      emailVisiteur: 'email_visiteur',
      emailMedia:    'email_media',
      resumeHebdo:   'resume_hebdo',
    };

    const items = [
      { key: 'emailContact',  label: 'Nouveau message de contact',     sub: 'Recevoir un email quand quelqu\'un envoie un message via le formulaire' },
      { key: 'emailVisiteur', label: 'Nouveau visiteur enregistré',     sub: 'Notification lors d\'un enregistrement de visiteur' },
      { key: 'emailMedia',    label: 'Confirmation d\'upload de médias', sub: 'Email de confirmation après chaque upload de fichier' },
      { key: 'resumeHebdo',   label: 'Résumé hebdomadaire',             sub: 'Rapport d\'activité chaque semaine' },
    ];

    const handleSave = async () => {
      setSaving(true);
      try {
        const body = {};
        for (const [camel, snake] of Object.entries(toggleKeyMap)) {
          body[snake] = prefs[camel];
        }
        const { data } = await api.put('/api/settings/notifications', body);
        setPrefs({
          emailContact:  data.email_contact,
          emailVisiteur: data.email_visiteur,
          emailMedia:    data.email_media,
          resumeHebdo:   data.resume_hebdo,
        });
        toast.success('Préférences de notification enregistrées');
      } catch (err) {
        toast.error('Erreur lors de l\'enregistrement');
      } finally {
        setSaving(false);
      }
    };

    return (
      <Section title="Préférences de notifications">
        <div className="space-y-4 max-w-lg">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : (
            items.map(({ key, label, sub }) => (
              <div key={key} className="flex items-start justify-between gap-4 p-4 bg-base-200 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">{sub}</p>
                </div>
                <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)}
                  className="checkbox checkbox-accent checkbox-sm mt-0.5 flex-shrink-0" />
              </div>
            ))
          )}
          {!loading && (
            <button onClick={handleSave} disabled={saving} className="btn btn-accent btn-sm gap-2">
              {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={15} />}
              Enregistrer les préférences
            </button>
          )}
        </div>
      </Section>
    );
  };

  // ── Onglet À propos ───────────────────────────────
  const AboutTab = () => (
    <Section title="À propos de l'application">
      <div className="space-y-4 max-w-md">
        {[
          { label: 'Application',   value: 'ETDV Église — Plateforme communautaire' },
          { label: 'Version',       value: '2.0.0' },
          { label: 'Frontend',      value: 'React 18 + Vite + TailwindCSS + DaisyUI' },
          { label: 'Backend',       value: 'Node.js + Express + PostgreSQL' },
          { label: 'Hébergement',   value: 'Vercel (Frontend) + Render (Backend)' },
          { label: 'Médias',        value: 'Cloudinary' },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 sm:w-36 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>
    </Section>
  );

  const tabs = [
    { key: 'profil',    icon: User,    label: 'Profil' },
    { key: 'securite',  icon: Shield,  label: 'Sécurité' },
    { key: 'notif',     icon: Bell,    label: 'Notifications' },
    { key: 'about',     icon: Info,    label: 'À propos' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'profil':   return <ProfileTab />;
      case 'securite': return <SecurityTab />;
      case 'notif':    return <NotifTab />;
      case 'about':    return <AboutTab />;
      default:         return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="bg-base-100 rounded-2xl shadow-sm p-3 space-y-1">
            {tabs.map(({ key, icon, label }) => (
              <TabBtn key={key} active={activeTab === key} onClick={() => setActiveTab(key)}
                icon={icon} label={label} />
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
