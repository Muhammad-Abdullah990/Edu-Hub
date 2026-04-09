import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Code, Award, GraduationCap, Lightbulb } from "lucide-react";

export default function FacultyAbdullah() {
  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/faculty" className="inline-flex items-center text-slate-500 hover:text-primary font-medium mb-8 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Faculty
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-center mb-16">
            {/* Abstract Avatar Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full aspect-square rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-sky-500/20"
            >
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="20" width="60" height="60" rx="10" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
                <path d="M30 40L50 60L70 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
                <circle cx="50" cy="50" r="10" fill="white" fillOpacity="0.2" />
              </svg>
            </motion.div>

            {/* Header Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Engineer Muhammad Abdullah</h1>
              <p className="text-2xl text-primary font-medium mb-6">Software Engineer, Co-Director</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold flex items-center">
                  <Code className="w-4 h-4 mr-2" /> Tech Meets Education
                </span>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" /> Modern Methodology
                </span>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
                <Code className="absolute top-6 right-6 w-8 h-8 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">Teaching Philosophy</h3>
                <p className="text-slate-700 text-xl font-serif italic leading-relaxed">
                  "Learning should be as intuitive as technology. I aim to demystify complex subjects through visual learning and logic, so students learn how to think."
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 text-accent mr-2" /> Key Achievements
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Integrated visual aids for STEM subjects.</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Restructured logical problem solving for high schoolers.</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Created automated testing systems for continuous tracking.</li>
                </ul>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                <GraduationCap className="w-6 h-6 text-primary mr-2" /> Career Journey
              </h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-sky-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Graduation</h4>
                      <span className="text-sm font-medium text-sky-600">Past</span>
                    </div>
                    <p className="text-sm text-slate-600">Engineering graduate equipped with analytical skills.</p>
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Joined TCC</h4>
                      <span className="text-sm font-medium text-primary">Key Milestone</span>
                    </div>
                    <p className="text-sm text-slate-600">Brought engineering precision to educational management.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Revolutionized STEM</h4>
                      <span className="text-sm font-medium text-indigo-600">Present</span>
                    </div>
                    <p className="text-sm text-slate-600">Modern teaching methodology leading to exceptional math & science results.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}