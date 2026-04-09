import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WaveWrap } from "@/components/ui/wave-button";
import logoUrl from "@assets/Logo_1775767926640.png";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Faculty", href: "/faculty" },
  { name: "Results", href: "/results" },
  { name: "Programs", href: "/programs" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-primary/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src={logoUrl} alt="Toppers Coaching Center" className="h-14 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-primary/5 text-primary"
                    : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/contact" className="ml-4">
              <motion.div whileHover={{ scale: 1.05 }} className="rounded-full">
                <WaveWrap variant="red" rounded="rounded-full">
                  <Button className="bg-destructive hover:bg-destructive/90 text-white rounded-full px-6 transition-all">
                    Admissions
                  </Button>
                </WaveWrap>
              </motion.div>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2 flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    location === item.href
                      ? "bg-primary/5 text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 px-4">
                <Link href="/contact" className="block w-full">
                  <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl w-full">
                    <WaveWrap variant="red" rounded="rounded-xl" className="w-full">
                      <Button className="w-full bg-destructive hover:bg-destructive/90 text-white rounded-xl py-6 text-lg transition-all">
                        Admissions Open
                      </Button>
                    </WaveWrap>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
