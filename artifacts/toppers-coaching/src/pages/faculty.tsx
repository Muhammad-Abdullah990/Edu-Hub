import { motion } from "framer-motion";
import { BookOpen, Code, Pill } from "lucide-react";

export default function Faculty() {
  const teachers = [
    {
      name: "The Founder",
      role: "Montessori Directress",
      experience: "20+ Years Experience",
      icon: BookOpen,
      quote: "Education begins with understanding the child. When we build a strong foundation, the rest of the academic journey becomes a path of discovery rather than a struggle.",
      color: "from-blue-500/20 to-purple-500/20",
      iconColor: "text-blue-600"
    },
    {
      name: "Muhammad Abdullah",
      role: "Software Engineer",
      experience: "Mathematics & Sciences",
      icon: Code,
      quote: "Logic and problem-solving are not just for exams; they are life skills. I aim to demystify complex concepts so students learn how to think, not just what to memorize.",
      color: "from-sky-400/20 to-blue-500/20",
      iconColor: "text-sky-600"
    },
    {
      name: "Tayyaba Gul",
      role: "Doctor of Pharmacy",
      experience: "Biology & Chemistry",
      icon: Pill,
      quote: "Science is the study of life. By connecting textbook theories to real-world applications, I help students see the magic in biology and chemistry, inspiring future medical professionals.",
      color: "from-emerald-400/20 to-teal-500/20",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
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
              
              <div className="relative h-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-200/20 overflow-hidden">
                {/* Abstract Avatar Graphic */}
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${teacher.color} flex items-center justify-center mb-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pjwvc3ZnPg==')]"></div>
                  <teacher.icon size={48} className={teacher.iconColor} />
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{teacher.name}</h2>
                  <p className="text-primary font-semibold mb-2">{teacher.role}</p>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-6">
                    {teacher.experience}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute -top-4 -left-2 text-4xl text-slate-200 font-serif">"</span>
                  <p className="text-slate-600 italic text-center relative z-10 leading-relaxed">
                    {teacher.quote}
                  </p>
                  <span className="absolute -bottom-4 -right-2 text-4xl text-slate-200 font-serif">"</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
