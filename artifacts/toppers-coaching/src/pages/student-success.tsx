import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, Briefcase } from "lucide-react";

export default function StudentSuccess() {
  const stories = [
    {
      name: "Shazil Malik",
      current: "Pursuing BBA",
      path: ["Joined in 6th Grade", "Matriculated with A+ Grade", "Enrolled in BBA Program"],
      quote: "The personalized attention I received at Toppers was the foundation of my academic confidence. They didn't just help me pass exams; they taught me how to study effectively. The analytical skills I developed there are now helping me excel in my business administration studies.",
      color: "bg-blue-50"
    },
    {
      name: "Afnan Adil",
      current: "Pursuing Doctor of Pharmacy",
      path: ["Struggled with Sciences", "Mastered Concepts at Toppers", "Accepted into Doctor of Pharmacy"],
      quote: "Science used to be my weakest subject until I was taught by Tayyaba Ma'am. The way concepts were broken down made biology and chemistry fascinating rather than intimidating. Their career counseling specifically helped me aim for and achieve my dream of entering the medical field.",
      color: "bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Student Journeys</h1>
          <p className="text-xl text-slate-600">
            We don't just teach for the next exam. We mentor students for their future careers. Read about the journeys of students who started with us and are now pursuing higher education.
          </p>
        </div>

        <div className="space-y-16 max-w-5xl mx-auto">
          {stories.map((story, idx) => (
            <motion.div 
              key={story.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-3xl p-8 md:p-12 ${story.color} border border-slate-100 relative overflow-hidden`}
            >
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <GraduationCap size={300} />
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{story.name}</h2>
                  <p className="text-primary font-semibold text-lg mb-8">{story.current}</p>
                  
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">The Journey</h3>
                    <div className="space-y-4">
                      {story.path.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-primary">
                            {i === 0 ? <BookOpen size={16} /> : i === 1 ? <TargetIcon size={16} /> : <Briefcase size={16} />}
                          </div>
                          <div className="pt-1 font-medium text-slate-700">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="bg-white p-8 rounded-2xl shadow-sm relative">
                    <span className="text-6xl text-slate-200 font-serif absolute top-4 left-4">"</span>
                    <p className="text-slate-600 text-lg leading-relaxed relative z-10 italic pt-6">
                      {story.quote}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center bg-slate-50 rounded-3xl p-12 max-w-4xl mx-auto border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Your Child Could Be Next</h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Our admissions are limited to ensure every student gets the attention they need to become a success story.
          </p>
          <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors group">
            Start Their Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </div>
  );
}

function TargetIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/0000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
