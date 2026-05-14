import { memo, useMemo, useEffect, useState, useRef } from "react";
import { FaFacebook, FaWhatsapp, FaTwitter, FaYoutube } from "react-icons/fa";
import {
  Heart, Cross, BookOpen, Clock, Users, Handshake,
  ArrowRight, Sparkles, Sunrise, ChevronDown, MapPin, Church
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import monImage from "../assets/logo.jpg";
import Footer from "./Footer";
import Title from "./Title";
import NavBar from "./NavBar";

const HOME_CONFIG = {
  socialLinks: [
    { Icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61564484227797", label: "Facebook", color: "hover:bg-blue-600" },
    { Icon: FaWhatsapp, url: "https://wa.me/228910387", label: "WhatsApp", color: "hover:bg-green-600" },
    { Icon: FaTwitter, url: "https://twitter.com/etde815", label: "Twitter", color: "hover:bg-sky-500" },
    { Icon: FaYoutube, url: "https://www.youtube.com/@etde815", label: "YouTube", color: "hover:bg-red-600" }
  ],
  bibleVerse: {
    text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    reference: "Matthieu 11:28"
  },
  features: [
    { Icon: Heart, text: "Amour et Compassion", desc: "Un accueil chaleureux pour tous" },
    { Icon: Cross, text: "Foi et Espérance", desc: "Ancrés dans la parole de Dieu" },
    { Icon: BookOpen, text: "Enseignement Biblique", desc: "Une croissance spirituelle continue" }
  ],
  stats: [
    { Icon: Clock, value: 24, suffix: "+", label: "Années de service" },
    { Icon: Users, value: 500, suffix: "+", label: "Membres" },
    { Icon: Heart, value: 1000, suffix: "+", label: "Mes touchées" },
    { Icon: Handshake, value: 50, suffix: "+", label: "Projets" }
  ],
  serviceTimes: [
    { day: "Dimanche", morning: "08:00 - 10:00", evening: "10:30 - 12:30" },
    { day: "Mercredi", morning: "18:00 - 20:00", evening: null },
    { day: "Vendredi", morning: "18:00 - 20:00", evening: null }
  ]
};

const SocialIcon = memo(({ Icon, url, label, color }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`
      group relative rounded-full border-2 border-accent p-3 text-2xl
      text-accent transition-all duration-300 hover:text-white
      hover:shadow-lg hover:-translate-y-1 ${color}
    `}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Icon className="transition-transform duration-300 group-hover:scale-110" />
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-base-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
      {label}
    </span>
  </motion.a>
));

SocialIcon.displayName = 'SocialIcon';

const FeatureCard = memo(({ Icon, text, desc, index }) => (
  <motion.div
    className="group relative p-6 bg-base-200/60 rounded-2xl border border-base-300/30 hover:border-accent/20 transition-all duration-500 text-center"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5 }}
    whileHover={{ y: -6 }}
  >
    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/10 transition-all duration-300">
      <Icon className="text-accent text-2xl" />
    </div>
    <h3 className="font-semibold text-base-content mb-1">{text}</h3>
    <p className="text-sm text-base-content/50">{desc}</p>
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

const AnimatedCounter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const ScrollIndicator = () => (
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-base-content/40"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.5 }}
  >
    <span className="text-xs tracking-widest uppercase">Découvrir</span>
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ChevronDown className="w-5 h-5" />
    </motion.div>
  </motion.div>
);

const ServiceTimeCard = ({ item }) => (
  <motion.div
    className="bg-base-200/50 rounded-xl p-5 border border-base-300/20 hover:border-accent/20 transition-all duration-300"
    whileHover={{ y: -3 }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
        <Clock className="w-4 h-4 text-accent" />
      </div>
      <span className="font-semibold text-base-content">{item.day}</span>
    </div>
    <div className="space-y-1.5 pl-11">
      <div className="flex items-center gap-2 text-sm">
        <Sunrise className="w-3.5 h-3.5 text-accent/70" />
        <span className="text-base-content/70">
          {item.morning}
          {item.evening ? "" : ""}
        </span>
      </div>
      {item.evening && (
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent/70" />
          <span className="text-base-content/70">{item.evening}</span>
        </div>
      )}
    </div>
  </motion.div>
);

const Home = () => {
  const { socialLinks, bibleVerse, features, stats, serviceTimes } = useMemo(() => HOME_CONFIG, []);
  const mainRef = useRef(null);

  return (
    <>
      <NavBar />
      <main ref={mainRef} className="min-h-screen">
        {/* ===== HERO SECTION ===== */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-300">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L42 45 L30 36 L18 45 L22 30 L10 20 L25 20 Z' fill='currentColor'/%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }} />
          </div>

          <motion.div
            className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left: Text Content */}
              <motion.div
                className="flex-1 text-center lg:text-left"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-8 border border-accent/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Church className="w-4 h-4" />
                  <span>Temple du Dieu Vivant</span>
                </motion.div>

                <Title
                  title="Bienvenue dans la maison du Seigneur"
                  subtitle="Un lieu de paix, d'amour et de renaissance spirituelle"
                />

                <motion.div
                  className="max-w-2xl mx-auto lg:mx-0 my-8 p-6 bg-base-200/60 backdrop-blur-sm rounded-2xl border-l-4 border-accent shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-base-content/70 leading-relaxed mb-4">
                    Nous sommes heureux de vous accueillir sur le site officiel de notre communauté chrétienne.
                    Ici, chaque ame est precieuse, chaque coeur est une promesse, et chaque visite est une benediction.
                  </p>
                  <blockquote className="border-t border-base-300/50 pt-4">
                    <p className="text-lg font-semibold text-base-content italic">
                      &laquo; {bibleVerse.text} &raquo;
                    </p>
                    <footer className="text-accent font-medium mt-2 text-sm">&mdash; {bibleVerse.reference}</footer>
                  </blockquote>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to="/contact"
                    className="btn btn-accent btn-lg px-8 gap-2 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <span>Contactez-nous</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="btn btn-ghost btn-lg px-8 gap-2 group"
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  className="flex justify-center lg:justify-start gap-3 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {socialLinks.map((social, index) => (
                    <SocialIcon key={index} Icon={social.Icon} url={social.url} label={social.label} color={social.color} />
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Image */}
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl group-hover:from-accent/30 group-hover:to-primary/30 transition-all duration-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -inset-4 rounded-full border border-accent/10 group-hover:border-accent/30"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -inset-8 rounded-full border border-accent/5 group-hover:border-accent/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.img
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    src={monImage}
                    alt="Logo du Temple du Dieu Vivant"
                    className="relative z-10 w-64 h-64 md:w-80 md:h-80 object-cover rounded-full shadow-2xl border-4 border-accent/30 group-hover:border-accent/60"
                    loading="lazy"
                  />
                  <motion.div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg z-20 whitespace-nowrap"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Depuis 2000
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <ScrollIndicator />
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="relative py-20 bg-base-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-accent mb-3">Nos Valeurs</h2>
              <p className="text-base-content/60 max-w-2xl mx-auto">
                Les piliers qui fondent notre communaute et guident notre mission
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <FeatureCard key={feature.text} Icon={feature.Icon} text={feature.text} desc={feature.desc} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== SERVICE TIMES ===== */}
        <section className="relative py-20 bg-gradient-to-b from-base-200 to-base-100 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
              <motion.div
                className="flex-1 text-center lg:text-left"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-accent mb-4">Rejoignez-nous</h2>
                <p className="text-base-content/70 leading-relaxed mb-6">
                  Nous vous invitons a venir partager un moment de recueillement et de communion.
                  Que vous soyez de passage ou a la recherche d'une communaute, vous serez accueilli
                  les bras ouverts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/contact" className="btn btn-accent gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Nous trouver</span>
                  </Link>
                  <Link to="/programs" className="btn btn-outline btn-accent gap-2">
                    <span>Nos programmes</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="flex-1 w-full max-w-md"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>Horaires des cultes</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {serviceTimes.map((item) => (
                    <ServiceTimeCard key={item.day} item={item} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section className="relative py-20 bg-base-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-accent mb-3">Notre Impact</h2>
              <p className="text-base-content/60 max-w-2xl mx-auto">
                Par la grace de Dieu, notre communaute ne cesse de grandir et de servir
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative text-center p-6 bg-base-200/60 rounded-2xl border border-base-300/30 hover:border-accent/20 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.Icon className="text-accent text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-base-content/60 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
    </>
  );
};

export default memo(Home);
