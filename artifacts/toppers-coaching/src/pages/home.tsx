import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { WaveWrap } from "@/components/ui/wave-button";
import { BookOpen, GraduationCap, Star, Pencil, Trophy, Users, Target, ShieldCheck, ArrowRight } from "lucide-react";
import logoUrl from "@assets/Logo_1775767926640.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-light">
        {/* Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src={logoUrl} alt="Watermark" className="w-full max-w-4xl opacity-5 md:opacity-10 object-contain" />
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-1/4 left-[10%] text-primary/20"
          >
            <BookOpen size={48} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute top-1/3 right-[15%] text-accent/40"
          >
            <GraduationCap size={56} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-[20%] text-secondary/30"
          >
            <Star size={32} />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-[25%] text-success/20"
          >
            <Pencil size={40} />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/50 border border-primary/10 text-primary text-sm font-semibold tracking-wider mb-6">
                Established 2006 • Baldia Town
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6"
            >
              Shaping Toppers <br />
              <span className="text-[#1E3A8A]">Since 2006</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium"
            >
              We Don't Teach - We Build TOPPERS
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} className="rounded-full w-full sm:w-auto">
                  <WaveWrap variant="red" rounded="rounded-full">
                    <Button className="w-full sm:w-auto text-lg h-14 px-8 bg-destructive hover:bg-destructive/90 text-white rounded-full group transition-all">
                      Admissions Open
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                  </WaveWrap>
                </motion.div>
              </Link>
              <Link href="/results">
                <motion.div whileHover={{ scale: 1.05 }} className="rounded-full w-full sm:w-auto">
                  <WaveWrap variant="blue" rounded="rounded-full">
                    <Button variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-full">
                      View Our Results
                    </Button>
                  </WaveWrap>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <Trophy className="text-accent" size={24} />
              <span>97%+ Results Every Year</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-accent" size={24} />
              <span>Trusted Since 2006</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Target className="text-accent" size={24} />
              <span>Limited Students = Maximum Focus</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADMISSION RIBBON */}
      <div className="bg-destructive py-3 overflow-hidden flex relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto relative z-10 flex justify-center">
           <h2 className="text-white font-bold tracking-widest uppercase text-sm md:text-base flex items-center gap-4">
             <Star size={16} className="text-accent fill-accent" />
             Admissions Open Now For Current Session
             <Star size={16} className="text-accent fill-accent" />
           </h2>
        </div>
      </div>

      {/* STATS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Years of Excellence", value: "18+", icon: Trophy },
              { label: "Pass Rate", value: "97%", icon: Target },
              { label: "Expert Faculty", value: "100%", icon: Users },
              { label: "Mission Goal", value: "98%", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                  <stat.icon size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SUCCESS */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Proven Success Stories</h2>
            <p className="text-slate-600 text-lg">Real students achieving real results through our dedicated coaching and personalized attention.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Story 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Shazil Malik</h3>
              <p className="text-secondary font-semibold mb-4">Pursuing BBA</p>
              <p className="text-slate-600 mb-6 italic">"The foundational concepts I learned at Toppers gave me the confidence to excel in my higher studies. The personalized attention is unmatched."</p>
              <Link href="/student-success" className="text-primary font-medium flex items-center group">
                Read Full Story <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Story 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-6">
                <Star size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Afnan Adil</h3>
              <p className="text-secondary font-semibold mb-4">Pharm D Candidate</p>
              <p className="text-slate-600 mb-6 italic">"Toppers didn't just teach me the syllabus; they guided my career path. Tayyaba Ma'am's mentorship was crucial for my medical field journey."</p>
              <Link href="/student-success" className="text-primary font-medium flex items-center group">
                Read Full Story <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-primary relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Secure Your Child's Future</h2>
          <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
            Join the coaching center that prioritizes individual attention and guaranteed results.
          </p>
          <Link href="/contact">
            <WaveWrap variant="gold" rounded="rounded-full">
              <Button className="text-lg h-14 px-10 bg-accent hover:bg-accent/90 text-primary font-bold rounded-full">
                Contact Us Today
              </Button>
            </WaveWrap>
          </Link>
        </div>
      </section>
    </div>
  );
}
