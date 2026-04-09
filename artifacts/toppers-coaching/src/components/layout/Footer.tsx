import { Link } from "wouter";
import { BookOpen, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import logoUrl from "@assets/Logo_1775767926640.png";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 inline-flex group">
              <img src={logoUrl} alt="Toppers Coaching Center" className="h-16 w-auto group-hover:scale-105 transition-transform bg-white/10 rounded-xl p-1" />
            </Link>
            <p className="text-slate-400 text-sm mt-4 max-w-xs">
              A premier family-run coaching institute in Baldia, Pakistan. Educating futures since 2006.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/topperscoachingcenter/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-accent shrink-0 mt-1" size={20} />
                <span className="text-slate-400">House Number 770, New Saeedabad Baldia Town, Karachi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-accent shrink-0" size={20} />
                <span className="text-slate-400">+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-accent shrink-0" size={20} />
                <span className="text-slate-400">info@topperscoachingcenter.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Programs</h3>
            <ul className="space-y-3">
              <li className="text-slate-400">Montessori</li>
              <li className="text-slate-400">Primary Level</li>
              <li className="text-slate-400">Middle School</li>
              <li className="text-slate-400">Matriculation</li>
              <li className="text-slate-400">Career Counseling</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-slate-400 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/faculty" className="text-slate-400 hover:text-accent transition-colors">Our Faculty</Link></li>
              <li><Link href="/results" className="text-slate-400 hover:text-accent transition-colors">Results</Link></li>
              <li><Link href="/programs" className="text-slate-400 hover:text-accent transition-colors">Programs</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Toppers Coaching Center. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
