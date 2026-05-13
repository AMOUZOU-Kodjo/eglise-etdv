import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Church, Heart, Users, BookOpen, Target, Sparkles,
  Calendar, Image, Mail, ChevronRight, Star, Clock, Cross
} from "lucide-react";
import Title from "./Title";
import { api } from "../context/AuthContext";

const SECTIONS = [
  {
    id: "histoire", title: "Notre Histoire", icon: BookOpen,
    content: "Notre église a été fondée en 2000 avec pour mission de servir notre communauté chrétienne.",
    color: "border-accent", gradient: "from-accent/10",
  },
  {
    id: "mission", title: "Notre Mission", icon: Target,
    content: "Aimer Dieu, servir notre prochain et faire grandir la foi en Jésus-Christ.",
    color: "border-info", gradient: "from-info/10",
  },
  {
    id: "engagement", title: "Notre Engagement", icon: Heart,
    content: "Nous servons notre communauté avec amour et dévouement depuis 2000.",
    color: "border-success", gradient: "from-success/10",
  },
];

const SectionCard = ({ section, index }) => {
  const Icon = section.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`group relative bg-base-200 border-l-4 ${section.color} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity`} />
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-xl font-bold">{section.title}</h3>
        <p className="text-base-content/70 leading-relaxed">{section.content}</p>
      </div>
    </motion.article>
  );
};

const About = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/stats/public').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const statItems = useMemo(() => [
    { label: "Ans d'existence", value: "24+", icon: Clock, key: 'years' },
    { label: "Publications", value: stats?.posts ?? "—", icon: BookOpen, key: 'posts' },
    { label: "Médias", value: stats?.media ?? "—", icon: Image, key: 'media' },
    { label: "Programmes", value: stats?.programs ?? "—", icon: Calendar, key: 'programs' },
    { label: "Abonnés", value: stats?.subscribers ?? "—", icon: Heart, key: 'subscribers' },
  ], [stats]);

  return (
    <>
      {/* <section className="relative bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <motion.div className="absolute top-20 right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Title title="À Propos de Nous" subtitle="Découvrez notre mission, notre vision et notre communauté" />
          </motion.div>
        </div>
      </section> */}

      <section className="container mx-auto px-4 py-16">
        <Title title="En savoir plus" subtitle="Notre foi et notre engagement" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-10">
          {SECTIONS.map((section, i) => (
            <SectionCard key={section.id} section={section} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Notre Impact</h2>
            <p className="text-base-content/60">Les chiffres clés de notre communauté</p>
          </motion.div>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {statItems.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-base-100 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-3xl font-bold text-accent">{stat.value}</p>
                  <p className="text-sm text-base-content/60 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Cross className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Notre Communauté</h2>
              <p className="text-base-content/70 leading-relaxed mb-6">
                Rejoignez notre communauté chrétienne chaleureuse et vivante.
                Ensemble, nous grandissons dans la foi, l'amour et le service.
                Que vous soyez nouveau dans la foi ou croyant confirmé,
                vous trouverez une place parmi nous.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="btn btn-accent gap-2">
                  <Mail size={16} /> Nous contacter
                </Link>
                <Link to="/visite" className="btn btn-outline btn-accent gap-2">
                  <Calendar size={16} /> Planifier une visite
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, label: "Amour", desc: "Au cœur de tout" },
                { icon: Users, label: "Communauté", desc: "Ensemble unis" },
                { icon: Star, label: "Foi", desc: "Notre fondement" },
                { icon: Sparkles, label: "Espérance", desc: "Tournés vers l'avenir" },
              ].map((item, i) => {
                const Ic = item.icon;
                return (
                  <div key={i} className="bg-base-200 rounded-2xl p-5 text-center hover:bg-base-300 transition-colors">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Ic className="w-5 h-5 text-accent" />
                    </div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-base-content/50">{item.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-accent to-accent/80 py-20 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à nous rejoindre ?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Venez vivre la foi avec nous et faire partie de notre communauté
          </p>
          <Link to="/visite" className="btn btn-lg bg-white text-accent hover:bg-white/90 border-0 gap-2">
            <Church size={20} /> Nous rendre visite
          </Link>
        </motion.div>
      </section>
    </>
  );
};

export default About;
