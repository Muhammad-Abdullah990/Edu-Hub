import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Pill, Award, GraduationCap, Dna } from "lucide-react";

export default function FacultyTayyaba() {
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
              className="w-full aspect-square rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-emerald-500/20"
            >
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20 L80 80 L20 80 Z" stroke="white" strokeWidth="2" strokeOpacity="0.4" fill="white" fillOpacity="0.1"/>
                <circle cx="50" cy="55" r="15" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                <path d="M40 55 A 10 10 0 0 0 60 55" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
              </svg>
            </motion.div>

            {/* Header Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Doctor Tayyaba Gul</h1>
              <p className="text-2xl text-primary font-medium mb-6">
                Pharm D<br />Co-Director
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold flex items-center">
                  <Pill className="w-4 h-4 mr-2" /> Pharmacy Background
                </span>
                <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold flex items-center">
                  <Dna className="w-4 h-4 mr-2" /> Expert in Sciences
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
                <Dna className="absolute top-6 right-6 w-8 h-8 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">Teaching Philosophy</h3>
                <p className="text-slate-700 text-xl font-serif italic leading-relaxed">
                  "Science is not memorization, it's understanding. By connecting textbook theories to real-world applications, I help students see the magic in biology."
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 text-accent mr-2" /> Key Achievements
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Led science results to a consistently high 97%+.</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Made biology and chemistry accessible to struggling students.</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Mentored future medical professionals and doctors.</li>
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Graduation</h4>
                      <span className="text-sm font-medium text-emerald-600">Past</span>
                    </div>
                    <p className="text-sm text-slate-600">Graduated as a Doctor of Pharmacy (Pharm D).</p>
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
                    <p className="text-sm text-slate-600">Brought medical and advanced science expertise to the center.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-teal-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Excellence</h4>
                      <span className="text-sm font-medium text-teal-600">Present</span>
                    </div>
                    <p className="text-sm text-slate-600">Consistently leading students to top biology and chemistry grades.</p>
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