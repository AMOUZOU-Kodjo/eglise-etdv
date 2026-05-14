import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { jsPDF } from "jspdf";
import {
  Search, Filter, Calendar, Clock, MapPin, Download,
  Share2, Eye, X, ChevronLeft, ChevronRight, Loader,
  MessageCircle, Newspaper, BookOpen, AlertCircle,
  Heart, DownloadCloud, Printer, Church, Sparkles
} from "lucide-react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Title from "./Title";
import monImage from "../assets/logo.jpg";
// ── Import de l'instance axios partagée (token JWT auto, bonne base URL) ──
import { api } from "../context/AuthContext";

// ==================== CONFIGURATION ====================
const EVENTS_CONFIG = {
  postsPerPage: 6,
  filterOptions: [
    { value: "all",     label: "Tous",      icon: Filter,        color: "accent"  },
    { value: "message", label: "Messages",  icon: MessageCircle, color: "blue"    },
    { value: "news",    label: "Nouvelles", icon: Newspaper,     color: "green"   },
    { value: "verse",   label: "Versets",   icon: BookOpen,      color: "purple"  },
  ],
  animationVariants: {
    hidden:  { opacity: 0, y: 20  },
    visible: { opacity: 1, y: 0   },
    exit:    { opacity: 0, y: -20 },
  },
};

// ==================== COMPOSANT CARD ====================
const EventCard = ({ post, onView, onExport, index }) => {
  const getTypeIcon  = (t) => ({ message: MessageCircle, news: Newspaper, verse: BookOpen }[t] || Calendar);
  const getTypeColor = (t) => ({
    message: "from-blue-500 to-cyan-500",
    news:    "from-green-500 to-emerald-500",
    verse:   "from-purple-500 to-pink-500",
  }[t] || "from-accent to-accent/80");
  const getTypeBadge = (t) => ({
    message: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50",
    news:    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200/50",
    verse:   "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50",
  }[t] || "bg-accent/10 text-accent border-accent/20");

  const TypeIcon = getTypeIcon(post.type);

  return (
    <motion.div
      variants={EVENTS_CONFIG.animationVariants}
      initial="hidden" animate="visible" exit="exit"
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative bg-base-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onClick={() => onView(post)}
    >
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getTypeColor(post.type)}`} />
      <div className="relative p-6 pt-8">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(post.type)} shadow-lg`}>
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${getTypeBadge(post.type)}`}>
            {post.type === "message" ? "Message" : post.type === "news" ? "Actualite" : "Verset"}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300 leading-snug">
          {post.title}
        </h3>
        <p className="text-base-content/60 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.content}
        </p>

        <div className="flex items-center gap-4 text-xs text-base-content/40 mb-4 pt-2 border-t border-base-200/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(post.date || Date.now()).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          {post.author && (
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-base-content/20" />
              <span className="font-medium text-base-content/50">{post.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views ?? 0}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onView(post); }}
            className="btn btn-sm flex-1 gap-1.5 bg-accent text-white hover:bg-accent/90 border-none shadow-md hover:shadow-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Lire
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExport(post); }}
            className="btn btn-sm btn-ghost gap-1.5 hover:bg-base-200"
            title="Exporter en PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MODAL ====================
const EventModal = ({ post, isOpen, onClose, onExport }) => {
  if (!post) return null;
  const getTypeColor = (t) => ({
    message: "from-blue-500 to-cyan-500",
    news:    "from-green-500 to-emerald-500",
    verse:   "from-purple-500 to-pink-500",
  }[t] || "from-accent to-accent/80");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className={`h-2 w-full bg-gradient-to-r ${getTypeColor(post.type)} rounded-t-2xl`} />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="badge badge-sm mb-2 capitalize">{post.type}</span>
                    <h2 className="text-2xl font-bold">{post.title}</h2>
                    <p className="text-sm text-base-content/50 mt-1">
                      {post.author || "Anonyme"} · {new Date(post.date || Date.now()).toLocaleDateString("fr-FR", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                  <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                <div className="flex gap-2 pt-4 border-t border-base-200">
                  <button onClick={() => onExport(post)} className="btn btn-sm btn-outline gap-2">
                    <Download className="w-4 h-4" /> Exporter PDF
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Lien copié !");
                    }}
                    className="btn btn-sm btn-ghost gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Partager
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==================== PAGINATION ====================
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center gap-2 mt-10">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
      className="p-2 rounded-lg bg-base-200 hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed">
      <ChevronLeft className="w-5 h-5" />
    </button>
    {[...Array(totalPages)].map((_, i) => {
      const p = i + 1;
      if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
        return (
          <button key={p} onClick={() => onPageChange(p)}
            className={`min-w-[40px] h-10 rounded-lg font-medium transition-all
              ${currentPage === p ? "bg-accent text-white shadow-lg scale-105" : "bg-base-200 hover:bg-base-300"}`}>
            {p}
          </button>
        );
      }
      if (p === currentPage - 3 || p === currentPage + 3) return <span key={p} className="px-2">…</span>;
      return null;
    })}
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-base-200 hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed">
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================
const Events = () => {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch]         = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  // ── Chargement depuis l'API réelle ──────────────────────
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/posts");
        setPosts(res.data || []);
      } catch (err) {
        console.error("Erreur de chargement des posts:", err);
        setError("Impossible de charger les publications.");
        toast.error("Impossible de charger les publications");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // ── Incrémenter les vues à l'ouverture d'un post ────────
  const handleViewPost = useCallback(async (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    try {
      await api.post(`/api/posts/${post.id}/view`);
    } catch { /* silencieux */ }
  }, []);

  // ── Filtrage + tri ───────────────────────────────────────
  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => filterType === "all" || p.type === filterType)
      .filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        (p.author || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [posts, filterType, search]);

  // ── Pagination ───────────────────────────────────────────
  const totalPages = Math.ceil(filteredPosts.length / EVENTS_CONFIG.postsPerPage);
  const currentPosts = useMemo(() => {
    const last  = currentPage * EVENTS_CONFIG.postsPerPage;
    const first = last - EVENTS_CONFIG.postsPerPage;
    return filteredPosts.slice(first, last);
  }, [filteredPosts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filterType, search]);

  // ── Export PDF ───────────────────────────────────────────
  const exportPDF = useCallback((post) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // En-tête : logo + nom de l'église
      doc.addImage(monImage, 'JPEG', 14, 10, 16, 16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(60);
      doc.text("Temple du Dieu Vivant", 34, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("ETDV — Publication", 34, 23);

      // Séparateur
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(14, 32, pageWidth - 14, 32);

      // Titre du post
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(post.title, 14, 42);

      // Métadonnées
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Type: ${post.type === "message" ? "Message" : post.type === "news" ? "Actualite" : "Verset"} | Auteur: ${post.author || "Anonyme"}`, 14, 50);
      doc.text(`Date: ${new Date(post.date || Date.now()).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, 14, 56);

      // Second séparateur
      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(14, 60, pageWidth - 14, 60);

      // Contenu
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(40);
      const lines = doc.splitTextToSize(post.content, pageWidth - 28);
      doc.text(lines, 14, 70);

      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text("Temple du Dieu Vivant — Document exporte depuis etdv.eglise", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

      doc.save(`${post.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      toast.success("PDF exporte !");
    } catch (e) {
      toast.error("Erreur lors de l'export PDF");
    }
  }, []);

  const counts = useMemo(() => ({
    all:     posts.length,
    message: posts.filter(p => p.type === "message").length,
    news:    posts.filter(p => p.type === "news").length,
    verse:   posts.filter(p => p.type === "verse").length,
  }), [posts]);

  return (
    <>
      <NavBar />
      <Toaster position="top-right" />

      <main className="min-h-screen bg-base-100">
        {/* ===== HERO ===== */}
        <section className="relative bg-gradient-to-br from-base-200 via-base-100 to-base-300 py-24 overflow-hidden">
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
            className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6 border border-accent/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Church className="w-4 h-4" />
                <span>Vie de la communaute</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Publications & Evenements
                </span>
              </h1>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
                Messages edificants, actualites de notre communaute et versets bibliques
                pour nourrir votre foi au quotidien
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== INTRO ===== */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <p className="text-base-content/70 leading-relaxed text-lg">
              Restez connecte a la vie de notre eglise. Retrouvez ici les messages partages
              lors de nos cultes, les annonces de la communaute et des versets pour votre
              meditation quotidienne.
            </p>
          </motion.div>

          {/* Recherche */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par titre, contenu ou auteur..."
                className="input input-bordered w-full pl-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {EVENTS_CONFIG.filterOptions.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(value)}
                className={`px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all
                  ${filterType === value
                    ? "bg-accent text-white shadow-lg"
                    : "bg-base-200 text-base-content/70 hover:bg-base-300"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {counts[value]}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader className="w-10 h-10 animate-spin text-accent" />
              <p className="text-base-content/50">Chargement des publications…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-error">
              <AlertCircle className="w-12 h-12" />
              <p className="font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-accent btn-sm">
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <p className="text-base-content/50 text-sm mb-6">
                {filteredPosts.length} publication{filteredPosts.length !== 1 ? "s" : ""} trouvée{filteredPosts.length !== 1 ? "s" : ""}
              </p>

              <AnimatePresence mode="wait">
                {currentPosts.length > 0 ? (
                  <motion.div
                    key={filterType + search + currentPage}
                    initial="hidden" animate="visible" exit="exit"
                    variants={{
                      hidden:  { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                      exit:    { opacity: 0 },
                    }}
                    className="grid md:grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {currentPosts.map((post, index) => (
                      <EventCard
                        key={post.id}
                        post={post}
                        index={index}
                        onView={handleViewPost}
                        onExport={exportPDF}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-base-200 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-base-content/40" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Aucune publication trouvee</h3>
                    <p className="text-base-content/50 mb-6">Essayez de modifier vos filtres ou votre recherche</p>
                    <button onClick={() => { setFilterType("all"); setSearch(""); }} className="btn btn-accent">
                      Voir toutes les publications
                    </button>
                  </div>
                )}
              </AnimatePresence>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </section>
      </main>

      <EventModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPost(null); }}
        onExport={exportPDF}
      />

      
    </>
  );
};

export default Events;