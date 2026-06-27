import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader,
  Clock, Copy, Check, FileText, XCircle, Info, Shield, ArrowRight, Sparkles, Church
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../context/AuthContext";
import Footer from "./Footer";

const REQUEST_TIMEOUT = 15000;
const MAX_RETRY_COUNT = 3;

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  email: "contact@eglise.com",
  phone: "+228 91 03 87 27",
  phoneFormatted: "+228 91 03 87 27",
  address: "Lomé, Togo",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.123456!2d0.914092!3d6.683333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1026bf002690c053%3A0x34ca13adae2ad0f!2sETDV+BANIKOP%C3%89+(Temple+B%C3%A9thel),+Togo!5e0!3m2!1sfr!2stg!4v1690000000000!5m2!1sfr!2stg",
  hours: [
    { day: "Lundi - Vendredi", hours: "09:00 - 18:00" },
    { day: "Samedi", hours: "18:00 - 19:30" },
    { day: "Dimanche", hours: "09:00 - 12:00" }
  ]
};

const INITIAL_FORM_STATE = { name: "", email: "", phone: "", subject: "", message: "" };

const STATUS_TYPES = { IDLE: null, INFO: "info", SUCCESS: "success", ERROR: "error", WARNING: "warning" };

const useContactForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [status, setStatus] = useState({ type: STATUS_TYPES.IDLE, message: "" });
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Format d'email invalide";
      case "phone": return !value || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value) ? null : "Format invalide";
      case "name": return value.trim().length >= 2 ? null : "Minimum 2 caractères";
      case "subject": return value.trim().length >= 3 ? null : "Minimum 3 caractères";
      case "message": return value.trim().length >= 10 ? null : "Minimum 10 caractères";
      default: return null;
    }
  }, []);

  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = useCallback(() => {
    const errors = {};
    ["name", "email", "subject", "message"].forEach(f => {
      const e = validateField(f, formData[f]);
      if (e) errors[f] = e;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateField]);

  const submitWithRetry = async (data, retryAttempt = 0) => {
    try {
      const response = await api.post('/api/contact', {
        nom: data.name, email: data.email, sujet: data.subject, message: data.message,
      }, { timeout: REQUEST_TIMEOUT });
      return { success: true, data: response.data };
    } catch (error) {
      if (error.code === 'ECONNABORTED' && retryAttempt < MAX_RETRY_COUNT - 1) {
        setRetryCount(retryAttempt + 1);
        return submitWithRetry(data, retryAttempt + 1);
      }
      const msg = error.response?.data?.error || error.message || "Erreur serveur";
      throw new Error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setStatus({ type: STATUS_TYPES.ERROR, message: "Veuillez corriger les erreurs dans le formulaire" });
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setLoading(true);
    setRetryCount(0);
    setStatus({ type: STATUS_TYPES.INFO, message: "Envoi en cours..." });

    try {
      const result = await submitWithRetry(formData);
      if (result.success) {
        setStatus({
          type: STATUS_TYPES.SUCCESS,
          message: result.data.acknowledged
            ? "Message envoyé ! Un accusé de réception vous a été envoyé par email."
            : "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
          acknowledged: result.data.acknowledged
        });
        setFormData(INITIAL_FORM_STATE);
        setFieldErrors({});
      }
    } catch (error) {
      let msg = "Une erreur est survenue. Veuillez réessayer.";
      if (!navigator.onLine) msg = "Pas de connexion internet. Vérifiez votre réseau.";
      else if (error.name === "AbortError") msg = "Requête annulée. Veuillez réessayer.";
      else if (error.message === "Failed to fetch") msg = "Impossible de joindre le serveur.";
      setStatus({ type: STATUS_TYPES.ERROR, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, status, loading, retryCount, fieldErrors, handleSubmit, validateField, setFieldErrors };
};

const ContactForm = () => {
  const { formData, setFormData, status, loading, retryCount, fieldErrors, handleSubmit, validateField, setFieldErrors } = useContactForm();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  }, [setFormData, validateField, setFieldErrors]);

  return (
    <>
      {/* Notification de succès */}
      <AnimatePresence>
        {status.type === STATUS_TYPES.SUCCESS && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-2xl p-4 text-white">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Message envoyé !</h3>
                  <p className="text-sm text-white/90">{status.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative min-h-screen pb-24 bg-gradient-to-br from-base-200 via-base-100 to-base-300 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L42 45 L30 36 L18 45 L22 30 L10 20 L25 20 Z' fill='currentColor'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />
          <motion.div
            className="absolute top-20 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          {/* En-tête */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 bg-accent/10 text-accent text-sm px-4 py-1.5 rounded-full mb-4 border border-accent/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Church className="w-4 h-4" />
              <span>Nous sommes a votre ecoute</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Contactez-nous
              </span>
            </h1>
            <p className="text-lg text-base-content/70 max-w-xl mx-auto leading-relaxed">
              Nous sommes la pour repondre a vos questions, vous soutenir dans la priere
              et vous accueillir au sein de notre communaute
            </p>
          </motion.div>

          {/* Grille principale */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Informations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="relative bg-base-200/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-base-300/50 h-fit"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-accent" />
                  </span>
                  {CHURCH_INFO.name}
                </h2>

                <div className="space-y-6">
                  <ContactInfo icon={Mail} href={`mailto:${CHURCH_INFO.email}`} text={CHURCH_INFO.email} label="Email" />
                  <ContactInfo icon={Phone} href={`tel:${CHURCH_INFO.phone}`} text={CHURCH_INFO.phoneFormatted} label="Téléphone" />
                  <ContactInfo icon={MapPin} text={CHURCH_INFO.address} label="Adresse" />

                  <div className="border-t border-base-300/50 pt-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Horaires d'ouverture
                    </h3>
                    <div className="space-y-3">
                      {CHURCH_INFO.hours.map((s, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-base-100/50 hover:bg-base-100 transition-colors">
                          <span className="text-sm text-base-content/60">{s.day}</span>
                          <span className="font-medium text-sm">{s.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {CHURCH_INFO.mapUrl && (
                <div className="h-56 w-full relative overflow-hidden">
                  <iframe src={CHURCH_INFO.mapUrl} className="w-full h-full" allowFullScreen loading="lazy" title="Localisation" />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-200/50 to-transparent pointer-events-none" />
                </div>
              )}
            </motion.div>

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="relative bg-base-200/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-accent" />
                  </span>
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <FormField label="Nom complet" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Kodjo Marcellin" error={fieldErrors.name} required disabled={loading} icon={FileText} />
                  <FormField label="Adresse email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contact@gmail.com" error={fieldErrors.email} required disabled={loading} icon={Mail} />
                  <FormField label="Téléphone (optionnel)" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+228 90 00 00 00" error={fieldErrors.phone} disabled={loading} icon={Phone} />
                  <FormField label="Sujet" name="subject" type="text" value={formData.subject} onChange={handleChange} placeholder="Question sur les cultes" error={fieldErrors.subject} required disabled={loading} icon={FileText} />
                  <FormField label="Message" name="message" type="textarea" value={formData.message} onChange={handleChange} placeholder="Décrivez votre demande en détail..." rows={5} error={fieldErrors.message} required disabled={loading} />

                  {retryCount > 0 && (
                    <div className="text-xs text-accent flex items-center gap-1">
                      <Loader className="w-3 h-3 animate-spin" />
                      Tentative {retryCount + 1}/{MAX_RETRY_COUNT}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-accent w-full group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader className="w-5 h-5 animate-spin" /><span>Envoi en cours...</span></>
                      ) : (
                        <><Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /><span>Envoyer le message</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </button>

                  <AnimatePresence mode="wait">
                    {status.message && (
                      <motion.div key={status.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <StatusMessage status={status} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <Shield className="w-3 h-3" />
                    <span>Vos données sont protégées et ne seront jamais partagées</span>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
    </>
  );
};

// ==================== SOUS-COMPOSANTS ====================

const FormField = ({ label, name, type, value, onChange, placeholder, rows, error, required, disabled, icon: Icon }) => {
  const [touched, setTouched] = useState(false);

  const baseClassName = `
    w-full px-4 py-3 bg-base-100 border-2 rounded-xl
    focus:outline-none focus:ring-2 transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error && touched ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' : 'border-base-300/50 focus:ring-accent/20 focus:border-accent'}
    ${Icon ? 'pl-11' : ''}
  `;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="text-sm font-medium text-base-content/80">
          {label} {required && <span className="text-accent ml-0.5">*</span>}
        </label>
        {error && touched && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{error}
          </span>
        )}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-base-content/40" />
          </div>
        )}
        {type === "textarea" ? (
          <textarea id={name} name={name} value={value} onChange={onChange} onBlur={() => setTouched(true)} placeholder={placeholder} rows={rows} required={required} disabled={disabled} className={`${baseClassName} resize-none min-h-[120px]`} />
        ) : (
          <input type={type} id={name} name={name} value={value} onChange={onChange} onBlur={() => setTouched(true)} placeholder={placeholder} required={required} disabled={disabled} className={baseClassName} />
        )}
      </div>
    </div>
  );
};

const ContactInfo = ({ icon: Icon, href, text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex items-start gap-4 group p-3 rounded-xl hover:bg-base-100/50 transition-colors">
      <div className="shrink-0 w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-105 transition-all">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-base-content/50 mb-0.5">{label}</p>
        {href ? (
          <a href={href} className="text-base-content hover:text-accent transition-colors font-medium break-all">{text}</a>
        ) : (
          <p className="text-base-content font-medium">{text}</p>
        )}
      </div>
      {href && (
        <button onClick={handleCopy} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-base-300/50" title="Copier">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-base-content/40" />}
        </button>
      )}
    </div>
  );
};

const StatusMessage = ({ status }) => {
  const config = {
    success: { icon: CheckCircle, bg: "from-green-500 to-green-600", border: "border-green-400" },
    error: { icon: AlertCircle, bg: "from-red-500 to-red-600", border: "border-red-400" },
    info: { icon: Loader, bg: "from-blue-500 to-blue-600", border: "border-blue-400" },
    warning: { icon: AlertCircle, bg: "from-yellow-500 to-yellow-600", border: "border-yellow-400" }
  };
  const c = config[status.type] || config.info;
  const Icon = c.icon;

  return (
    <div className={`bg-gradient-to-r ${c.bg} text-white p-4 rounded-xl flex items-start gap-3 shadow-lg border-l-4 ${c.border}`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${status.type === "info" ? "animate-spin" : ""}`} />
      <p className="text-sm font-medium">{status.message}</p>
    </div>
  );
};

export default ContactForm;
