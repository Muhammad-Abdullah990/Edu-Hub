import { motion } from "framer-motion";
import { Check, GraduationCap, Users, Calendar, TrendingUp } from "lucide-react";

export default function Programs() {
  const levels = [
    {
      title: "Montessori & Primary",
      grades: "Nursery to Class 5",
      desc: "Building a strong foundation in reading, writing, basic mathematics, and critical thinking in a nurturing environment.",
      features: ["Interactive learning methods", "Focus on phonics and vocabulary", "Basic mathematical concepts", "Regular progress updates for parents"]
    },
    {
      title: "Middle School",
      grades: "Class 6 to Class 8",
      desc: "Transitioning to more complex subjects. Introducing detailed science and advanced math concepts to prepare for board exams.",
      features: ["Subject-specific focus", "Introduction to biology, chemistry, physics", "Weekly testing system", "Conceptual clarity over memorization"]
    },
    {
      title: "Matriculation",
      grades: "Class 9 & 10",
      desc: "Rigorous preparation for board examinations. Comprehensive syllabus coverage with extensive past-paper practice.",
      features: ["Intensive board exam preparation", "Career counseling sessions", "Extra holiday sessions", "Mock exams and time management"]
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Academic Programs</h1>
          <p className="text-xl text-slate-600">
            We provide continuous educational support from a child's first school years all the way through their critical matriculation board exams.
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {levels.map((level, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{level.title}</h3>
                <p className="text-secondary font-medium text-sm tracking-wide uppercase">{level.grades}</p>
              </div>
              
              <p className="text-slate-600 mb-8 h-24">{level.desc}</p>
              
              <ul className="space-y-3">
                {level.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-success shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Teaching Methodology */}
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Teaching Methodology</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">We don't just teach the syllabus; we ensure the student understands it deeply enough to apply it.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Small Batches", desc: "Limited students per class to ensure personal attention." },
              { icon: Calendar, title: "Holiday Sessions", desc: "Extra classes during holidays to cover weak areas." },
              { icon: TrendingUp, title: "Weekly Tests", desc: "Continuous assessment to track retention and progress." },
              { icon: GraduationCap, title: "Career Guidance", desc: "Mentorship beyond exams for future studies." }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-accent" />
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-primary-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
