import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Heart,
  Music,
  Sun,
  Moon,
  Star,
  ChevronRight,
  MapPin,
  Bell,
  Filter,
  X,
  Download,
  Share2,
  Church,
  Cross,
  Sparkles,
  Sunrise,
  Hand,
  Printer,
} from "lucide-react";
import { api } from "../context/AuthContext";
import NavBar from "./NavBar";
import Title from "./Title";
import CalendarButton from "./CalendarButton";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import monImage from "../assets/logo.jpg";

const ICON_MAP = {
  church: Church,
  users: Users,
  book: BookOpen,
  heart: Heart,
  music: Music,
  hand: Hand,
  cross: Cross,
  star: Star,
  sparkles: Sparkles,
  sunrise: Sunrise,
  calendar: Calendar,
  clock: Clock,
  bell: Bell,
};

const COLOR_GRADIENTS = {
  accent: "from-accent to-accent/80",
  primary: "from-primary to-primary/80",
  secondary: "from-secondary to-secondary/80",
  info: "from-info to-info/80",
  success: "from-success to-success/80",
  warning: "from-warning to-warning/80",
  error: "from-error to-error/80",
};

// ==================== TYPES D'ONGLETS ====================
const TABS = [
  { id: "all", label: "Tous", icon: Calendar, color: "accent" },
  { id: "weekly", label: "Hebdomadaire", icon: Calendar, color: "accent" },
  { id: "monthly", label: "Mensuel", icon: Star, color: "secondary" },
  { id: "annual", label: "Annuel", icon: Sun, color: "primary" },
];

// ==================== COMPOSANT PROGRAM CARD ====================
const ProgramCard = ({ program, index, type, onClick }) => {
  const Icon = typeof program.icon === 'string'
    ? (ICON_MAP[program.icon] || Calendar)
    : (program.icon || Calendar);
  const gradient = COLOR_GRADIENTS[program.color] || 'from-accent to-accent/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative h-full cursor-pointer"
      onClick={() => onClick(program)}
    >
      <div className="relative h-full bg-base-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradient}`} />

        <div className="p-6 pt-8">
          <div className="flex items-start justify-between mb-5">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            {program.category && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full capitalize border bg-accent/10 text-accent border-accent/20">
                {program.category === 'weekly' ? 'Hebdomadaire' : program.category === 'monthly' ? 'Mensuel' : 'Annuel'}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold mb-1 leading-tight">
            {program.day || program.week || program.month}
          </h3>

          <h4 className="text-base font-semibold text-accent mb-4">
            {program.title}
          </h4>

          <div className="space-y-2 mb-4 pt-3 border-t border-base-200/50">
            {program.time && (
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{program.time}</span>
              </div>
            )}
            {program.location && (
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <MapPin className="w-3.5 h-3.5" />
                <span>{program.location}</span>
              </div>
            )}
          </div>

          <p className="text-base-content/60 text-sm leading-relaxed mb-4 line-clamp-2">
            {program.description}
          </p>

          <div className="flex items-center gap-1 text-accent text-sm font-medium group/link">
            <span>Voir details</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

// ==================== COMPOSANT MODAL DE DÉTAILS ====================
const ProgramModal = ({ program, isOpen, onClose, type }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  if (!program) return null;

  const Icon = typeof program.icon === 'string'
    ? (ICON_MAP[program.icon] || Calendar)
    : (program.icon || Calendar);
  const gradient = COLOR_GRADIENTS[program.color] || 'from-accent to-accent/80';

  const handleRemindMe = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Rappel de programme", {
            body: `${program.title} - ${program.day || program.week || program.month} à ${program.time || "09:00"}`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });

          setNotification({
            show: true,
            message: "Rappel programmé ! Vous serez notifié 10 min avant",
            type: "success",
          });
        } else {
          setNotification({
            show: true,
            message: "Veuillez autoriser les notifications",
            type: "error",
          });
        }
      });
    } else {
      alert(
        `Rappel pour: ${program.title}\nDate: ${program.day || program.week || program.month}\nHeure: ${program.time || "09:00"}`,
      );

      setNotification({
        show: true,
        message: "Rappel ajouté (version simple)",
        type: "success",
      });
    }

    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.addImage(monImage, 'JPEG', 14, 10, 16, 16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(60);
      doc.text("Temple du Dieu Vivant", 34, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("ETDV — Programme", 34, 23);

      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(14, 32, pageWidth - 14, 32);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text(program.title, 14, 42);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      const jour = program.day || program.week || program.month;
      doc.text(`Jour: ${jour}`, 14, 50);
      if (program.time) doc.text(`Horaire: ${program.time}`, 14, 56);
      if (program.location) doc.text(`Lieu: ${program.location}`, 14, 62);

      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(14, 68, pageWidth - 14, 68);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(40);
      const lines = doc.splitTextToSize(program.longDescription || program.description, pageWidth - 28);
      doc.text(lines, 14, 78);

      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text("Temple du Dieu Vivant — Document exporte depuis etdv.eglise", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

      doc.save(`${program.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      setNotification({ show: true, message: "PDF exporte avec succes !", type: "success" });
    } catch (e) {
      setNotification({ show: true, message: "Erreur lors de l'export PDF", type: "error" });
    }
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${program.title} - Église ETDV`,
      text: `${program.description}\n\n${program.day || program.week || program.month}\n${program.time || "À confirmer"}\n${program.location || "Église Temple du Dieu Vivant"}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setNotification({ show: true, message: "Partagé avec succès !", type: "success" });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\nLien: ${shareData.url}`,
        );
        setNotification({ show: true, message: "Copié dans le presse-papiers !", type: "success" });
      }
    } catch (error) {
      console.error("Erreur de partage:", error);
      setNotification({ show: true, message: "Erreur lors du partage", type: "error" });
    }

    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const handleDownload = () => {
    try {
      const eventDate = new Date();
      const [year, month, day] = eventDate.toISOString().split("T")[0].split("-");

      let startHour = "09", startMin = "00";
      let endHour = "10", endMin = "00";

      if (program.time) {
        const times = program.time.split(" - ");
        if (times[0]) [startHour, startMin] = times[0].split(":");
        if (times[1]) [endHour, endMin] = times[1].split(":");
      }

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Église ETDV//Programme//FR
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${program.id}@eglise-etdv.org
DTSTAMP:${year}${month}${day}T${startHour}${startMin}00Z
DTSTART:${year}${month}${day}T${startHour}${startMin}00Z
DTEND:${year}${month}${day}T${endHour}${endMin}00Z
SUMMARY:${program.title}
DESCRIPTION:${program.description.replace(/\n/g, " ")}
LOCATION:${program.location || "Église Temple du Dieu Vivant"}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${program.title.replace(/\s+/g, "-").toLowerCase()}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setNotification({ show: true, message: "Fichier téléchargé avec succès !", type: "success" });
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      setNotification({ show: true, message: "Erreur lors du téléchargement", type: "error" });
    }

    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-y-auto"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl relative">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradient} rounded-t-2xl`} />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-base-200 hover:bg-base-300 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} bg-opacity-10`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">
                        {program.day || program.week || program.month}
                      </h2>
                      <p className="text-xl text-accent">{program.title}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Informations</h3>

                      {program.time && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-accent" />
                          <span>{program.time}</span>
                        </div>
                      )}

                      {program.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-accent" />
                          <span>{program.location}</span>
                        </div>
                      )}
                    </div>

                    {program.leaders && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Responsables</h3>
                        {program.leaders.map((leader, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>{leader}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {program.highlights && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Au programme</h3>
                        {program.highlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-3">Description</h3>
                    <p className="text-base-content/80 leading-relaxed">
                      {program.longDescription || program.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleRemindMe} className="btn btn-accent flex-1 hover:scale-105 transition-transform">
                      <Bell className="w-4 h-4 mr-2" />
                      Me rappeler
                    </button>
                    <button onClick={handleShare} className="btn btn-outline btn-accent flex-1 hover:scale-105 transition-transform">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </button>
                    <button onClick={handleExportPDF} className="btn btn-outline btn-accent flex-1 hover:scale-105 transition-transform">
                      <Printer className="w-4 h-4 mr-2" />
                      Exporter PDF
                    </button>
                    <button onClick={handleDownload} className="btn btn-outline btn-accent flex-1 hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      .ICS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 50, x: "-50%" }}
                className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[60] ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}
              >
                <span className="font-medium">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

// ==================== COMPOSANT FILTER BAR ====================
const FilterBar = ({ categories, activeFilter, onFilterChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap justify-center gap-3 mb-8"
    >
      <button
        onClick={() => onFilterChange("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeFilter === "all"
            ? "bg-accent text-white shadow-lg scale-105"
            : "bg-base-200 text-base-content/70 hover:bg-base-300"
        }`}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onFilterChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
            activeFilter === cat.value
              ? "bg-accent text-white shadow-lg scale-105"
              : "bg-base-200 text-base-content/70 hover:bg-base-300"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </motion.div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
const Programs = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [programs, setPrograms] = useState({
    weekly: [],
    monthly: [],
    annual: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/programs");
        const grouped = { weekly: [], monthly: [], annual: [] };
        data.forEach((prog) => {
          if (prog.category === "weekly") grouped.weekly.push(prog);
          else if (prog.category === "monthly") grouped.monthly.push(prog);
          else if (prog.category === "annual") grouped.annual.push(prog);
        });
        setPrograms(grouped);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement programmes:", err);
        setError("Impossible de charger les programmes.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = useMemo(() => {
    if (activeTab === "weekly") {
      return [
        { value: "jeunes", label: "Jeunes" },
        { value: "etude", label: "Étude" },
        { value: "priere", label: "Prière" },
        { value: "louange", label: "Louange" },
        { value: "special", label: "Spécial" },
      ];
    }
    return [];
  }, [activeTab]);

  const filteredPrograms = useMemo(() => {
    if (activeTab === "all") {
      const all = [...programs.weekly, ...programs.monthly, ...programs.annual];
      return all;
    }
    const programsData = programs[activeTab];
    if (filter === "all" || !programsData) return programsData;
    return programsData.filter((p) => p.category === filter);
  }, [activeTab, filter, programs]);

  const handleProgramClick = useCallback((program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-base-100">
        <section className="relative bg-linear-to-br from-base-200 via-base-100 to-base-300 py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L42 45 L30 36 L18 45 L22 30 L10 20 L25 20 Z' fill='currentColor'/%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }} />
          </div>

          <motion.div
            className="absolute top-10 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6 border border-accent/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Church className="w-4 h-4" />
                <span>Vie spirituelle</span>
              </motion.div>

              <Title
                title="Nos Programmes"
                subtitle="Decouvrez nos activites spirituelles et rejoignez-nous pour grandir ensemble dans la foi"
              />

              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{programs.weekly.length}+</div>
                  <div className="text-sm text-base-content/60">Activités/semaine</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{programs.weekly.length + programs.monthly.length}+</div>
                  <div className="text-sm text-base-content/60">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{programs.annual.length}</div>
                  <div className="text-sm text-base-content/60">Événements annuels</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setFilter("all"); }}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-accent text-white shadow-lg pr-8"
                        : "bg-base-200 text-base-content hover:bg-base-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                    <span>{tab.label}</span>
                  </div>

                  <span
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {tab.id === 'all'
                      ? programs.weekly.length + programs.monthly.length + programs.annual.length
                      : programs[tab.id]?.length || 0}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {categories.length > 0 && (
            <FilterBar categories={categories} activeFilter={filter} onFilterChange={setFilter} />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + filter}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPrograms?.map((program, index) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  index={index}
                  type={activeTab}
                  onClick={handleProgramClick}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredPrograms?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-base-200 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-base-content/40" />
              </div>
              <p className="text-xl text-base-content/50 mb-4">
                Aucun programme trouvé pour cette catégorie
              </p>
              <button onClick={() => setFilter("all")} className="btn btn-accent">
                Voir tous les programmes
              </button>
            </motion.div>
          )}
        </section>

        <section className="bg-gradient-to-r from-accent to-accent/80 py-20 mt-12">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à nous rejoindre ?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Venez participer à nos programmes et découvrir une communauté chaleureuse
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <CalendarButton
                  events={[].concat(programs.weekly, programs.monthly, programs.annual)}
                  onEventClick={(event) => {
                    console.log("Événement sélectionné:", event);
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-lg bg-white text-accent hover:bg-white/90 border-0"
                >
                  <Users className="w-5 h-5 mr-2" />
                  <Link to="/contact">Nous contacter</Link>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      

      <ProgramModal
        program={selectedProgram}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={activeTab}
      />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          >
            <ChevronRight className="w-6 h-6 -rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Programs;
