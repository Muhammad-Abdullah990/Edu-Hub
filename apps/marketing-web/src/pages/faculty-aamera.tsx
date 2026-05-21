import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Award, GraduationCap, Clock } from "lucide-react";

export default function FacultyAamera() {
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
              className="w-full aspect-square rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
                <path d="M20 50Q50 20 80 50T20 50Z" fill="white" fillOpacity="0.2" />
                <circle cx="50" cy="35" r="15" fill="white" fillOpacity="0.3" />
                <path d="M30 70 C30 60 70 60 70 70" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
              </svg>
            </motion.div>

            {/* Header Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Miss Aamera Ishaque</h1>
              <p className="text-2xl text-primary font-medium mb-6">Montessori Directoress | Founder | PTC | AMI Directoress | English Language & Others</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> 35+ Years Legacy
                </span>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold flex items-center">
                  <Award className="w-4 h-4 mr-2" /> Early Childhood Specialist
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
                <BookOpen className="absolute top-6 right-6 w-8 h-8 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">Teaching Philosophy</h3>
                <p className="text-slate-700 text-xl font-serif italic leading-relaxed">
                  "Every child is a unique learner. When we build a strong foundation, the rest of the academic journey becomes a path of discovery rather than a struggle."
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 text-accent mr-2" /> Key Achievements
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Mentored countless students who went on to reputed universities</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Over 35+ years of transforming young minds</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> 35+ Years Legacy of consistent excellence</li>
                  <li className="flex items-start"><div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 shrink-0" /> Founder of Baldia's most trusted family coaching center</li>
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Started Teaching</h4>
                      <span className="text-sm font-medium text-blue-600">2003</span>
                    </div>
                    <p className="text-sm text-slate-600">Began career in early childhood education.</p>
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">Founded TCC</h4>
                      <span className="text-sm font-medium text-primary">2006</span>
                    </div>
                    <p className="text-sm text-slate-600">Established Toppers Coaching Center.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">35+ Years Legacy</h4>
                      <span className="text-sm font-medium text-purple-600">Present</span>
                    </div>
                    <p className="text-sm text-slate-600">Transforming young minds and shaping futures continuously.</p>
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
