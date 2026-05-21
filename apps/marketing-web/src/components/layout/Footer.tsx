import { Link } from "wouter";
import { MapPin, Phone, Mail, Instagram, Facebook, Quote, Star } from "lucide-react";
import logoUrl from "@assets/Full_Transparent_(1)_1775893055172.webp";

export function Footer() {
  const featuredTestimonials = [
    {
      text: "I have seen a remarkable difference in my son's confidence since he joined Toppers. The teachers genuinely care.",
      author: "Mrs. Salman",
      role: "Parent of 9th Grader"
    },
    {
      text: "Finding a coaching center in Baldia with such dedicated and qualified teachers was a blessing. Highly recommended.",
      author: "Mr. Tariq",
      role: "Parent of Matric Student"
    },
    {
      text: "The small class sizes mean my daughter gets the attention she needs. Her grades have improved from B's to A's.",
      author: "Mrs. Khan",
      role: "Parent of 8th Grader"
    }
  ];

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section */}
        <div className="mb-16 pb-12 border-b border-white/10">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">What Parents Say</h3>
            <p className="text-slate-400">Real feedback from families who trust us with their children's education</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent/50 transition-colors group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="text-accent shrink-0 group-hover:scale-110 transition-transform" size={24} />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm italic mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t border-white/10 pt-4">
                  <p className="font-semibold text-sm text-white">{testimonial.author}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/testimonials" className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-primary transition-colors rounded-lg font-medium text-sm">
              Read More Testimonials →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1.4fr_1fr_1fr] gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 inline-flex group">
              <img
                src={logoUrl}
                alt="Toppers Coaching Center Karachi coaching academy logo"
                loading="lazy"
                decoding="async"
                width="500"
                height="500"
                className="h-16 w-auto group-hover:scale-105 transition-transform bg-white/10 rounded-xl p-1"
              />
            </Link>
            <p className="text-slate-300 text-sm mt-4 max-w-xs">
              A premier family-run coaching institute in Baldia, Pakistan. Educating futures since 2006.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                aria-label="Visit Toppers Coaching Center on Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/topperscoachingcenter/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Toppers Coaching Center on Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-accent shrink-0 mt-1" size={20} />
                <span className="text-slate-300">Sector 9D, Street no 4, Baldia town</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-accent shrink-0" size={20} />
                <span className="text-slate-300">+92 326 3987 552</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-accent shrink-0 mt-0.5" size={20} />
                <span className="text-slate-300 break-all">info@topperscoachingcenter.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Programs</h3>
            <ul className="space-y-3">
              <li className="text-slate-300">Montessori</li>
              <li className="text-slate-300">Primary Level</li>
              <li className="text-slate-300">Middle School</li>
              <li className="text-slate-300">Matriculation</li>
              <li className="text-slate-300">Career Counseling</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-slate-300 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/faculty" className="text-slate-300 hover:text-accent transition-colors">Our Faculty</Link></li>
              <li><Link href="/current-students" className="text-slate-300 hover:text-accent transition-colors">Current Students</Link></li>
              <li><Link href="/results" className="text-slate-300 hover:text-accent transition-colors">Results</Link></li>
              <li><Link href="/programs" className="text-slate-300 hover:text-accent transition-colors">Programs</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-accent transition-colors">Contact</Link></li>
            <li><Link href="/privacy-policy" className="text-slate-300 hover:text-accent transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="text-slate-300 hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-300 text-sm">
            &copy; {new Date().getFullYear()} Toppers Coaching Center. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

