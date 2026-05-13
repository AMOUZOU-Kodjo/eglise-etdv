import React, { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import {
  Menu,
  X,
  Home,
  Info,
  Calendar,
  BookOpen,
  Image,
  Phone,
  Sun,
  Moon,
  Film,
} from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: Info },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/programs", label: "Programs", icon: BookOpen },
  { to: "/gallery", label: "Gallery", icon: Image },
  { to: "/contact", label: "Contact", icon: Phone },
  // { to: "/login", label: "Admin", icon: Film },
];

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-base-200/90 backdrop-blur-md shadow-lg py-2"
          : "bg-base-200 py-4"
      }`}
    >
      <div className="container-page mx-auto px-4">
        <div className="flex justify-between   items-center">

          {/* LOGO */}
          <Link to="/" className="flex  items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full border border-accent"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold">
                Eglise <span className="text-accent">ETDV</span>
              </p>
              <p className="text-xs opacity-70">Site officiel</p>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex  items-center not-first: gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center   gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "text-accent bg-accent/10"
                      : "hover:bg-accent/10 hover:text-accent"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}

            {/* THEME BUTTON */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg bg-base-300 hover:bg-base-400"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </motion.button>
          </div>

          {/* MOBILE BUTTONS */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-base-300"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-accent/10"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive
                          ? "text-accent bg-accent/10"
                          : "hover:bg-accent/10"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default NavBar;