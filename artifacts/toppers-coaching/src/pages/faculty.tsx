import { motion } from "framer-motion";
import { BookOpen, Code, Pill, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Faculty() {
  const teachers = [
    {
      name: "Miss Aamera Ishaque",
      role: "Montessori Directress, Founder",
      experience: "35+ Years Experience",
      icon: BookOpen,
      quote: "Education begins with understanding the child. When we build a strong foundation, the rest of the academic journey becomes a path of discovery rather than a struggle.",
      color: "from-blue-500/20 to-purple-500/20",
      iconColor: "text-blue-600",
      slug: "/faculty/aamera-ishaque"
    },
    {
      name: "Engineer Muhammad Abdullah",
      role: "Software Engineer, Co-Director",
      experience: "Mathematics & Sciences",
      icon: Code,
      quote: "Logic and problem-solving are not just for exams; they are life skills. I aim to demystify complex concepts so students learn how to think, not just what to memorize.",
      color: "from-sky-400/20 to-blue-500/20",
      iconColor: "text-sky-600",
      slug: "/faculty/muhammad-abdullah"
    },
    {
      name: "Doctor Tayyaba Gul",
      role: "Pharm D, Co-Director",
      experience: "Biology & Chemistry",
      icon: Pill,
      quote: "Science is the study of life. By connecting textbook theories to real-world applications, I help students see the magic in biology and chemistry, inspiring future medical professionals.",
      color: "from-emerald-400/20 to-teal-500/20",
      iconColor: "text-emerald-600",
      slug: "/faculty/tayyaba-gul"
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider mb-4"
          >
            OUR EXPERT EDUCATORS
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Taught by Family, <br />Driven by Excellence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600"
          >
            At Toppers, we do not rely on outside hires. Your children are taught exclusively by our highly qualified founders and family members.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              {/* Glow Effect behind card */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              
              <div className="relative h-full flex flex-col bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-200/20 overflow-hidden">
                {/* Abstract Avatar Graphic */}
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${teacher.color} flex items-center justify-center mb-8 relative overflow-hidden`}>
                  <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" className={teacher.iconColor} strokeOpacity="0.2" />
                    <path d="M20 50Q50 20 80 50T20 50Z" fill="currentColor" className={teacher.iconColor} fillOpacity="0.1" />
                    <circle cx="50" cy="35" r="15" fill="currentColor" className={teacher.iconColor} fillOpacity="0.2" />
                  </svg>
                  <teacher.icon size={40} className={`relative z-10 ${teacher.iconColor}`} />
                </div>

                <div className="text-center flex-grow">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{teacher.name}</h2>
                  <p className="text-primary font-semibold mb-2">{teacher.role}</p>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-6">
                    {teacher.experience}
                  </span>
                </div>

                <div className="relative mb-8">
                  <span className="absolute -top-4 -left-2 text-4xl text-slate-200 font-serif">"</span>
                  <p className="text-slate-600 italic text-center relative z-10 leading-relaxed">
                    {teacher.quote}
                  </p>
                  <span className="absolute -bottom-4 -right-2 text-4xl text-slate-200 font-serif">"</span>
                </div>

                <div className="text-center mt-auto pt-4">
                  <Link href={teacher.slug}>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-xl group/btn"
                    >
                      View Profile
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                        className="ml-2 flex group-hover/btn:[animation-duration:0.8s]"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
