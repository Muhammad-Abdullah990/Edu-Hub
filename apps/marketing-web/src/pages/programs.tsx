import { motion } from "framer-motion";
import { Check, GraduationCap, Users, Calendar, TrendingUp, Clock, BookOpen, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@toppers/ui";
import { WaveWrap } from "@toppers/ui";
import { PrimaryCTAButton } from "@toppers/ui";
import { Helmet } from "react-helmet-async";

export default function Programs() {
  const levels = [
    {
      title: "Montessori & Primary",
      grades: "Nursery to Class 5",
      desc: "Building a strong foundation in reading, writing, basic mathematics, and critical thinking in a nurturing, interactive environment.",
      features: ["Interactive learning methods", "Focus on phonics and vocabulary", "Basic mathematical concepts", "Regular progress updates for parents", "Small class batches (max 8-10 students)"],
      price: "Affordable & Transparent",
      cta: "Enroll Your Child"
    },
    {
      title: "Middle School",
      grades: "Class 6 to Class 8",
      desc: "Transitioning to more complex subjects. Introducing detailed science and advanced math concepts to prepare students for board exams.",
      features: ["Subject-specific expert teaching", "Introduction to biology, chemistry, physics", "Weekly testing and progress tracking", "Conceptual clarity over memorization", "Career awareness sessions"],
      price: "Competitive Rates",
      cta: "Start Now"
    },
    {
      title: "Matriculation",
      grades: "Class 9 & 10",
      desc: "Rigorous preparation for board examinations. Comprehensive syllabus coverage with extensive past-paper practice and expert guidance.",
      features: ["Intensive board exam preparation", "Career counseling & college guidance", "Extra holiday sessions", "Mock exams and time management", "One-on-one doubt clearing sessions"],
      price: "Semester-based",
      cta: "Secure Seat Now"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Coaching Classes for School Students in Karachi | Toppers Coaching Center</title>
        <meta name="description" content="Comprehensive coaching classes for school students in Karachi. From Montessori to Matric, we provide expert guidance and proven results at Toppers Coaching Center." />
        <link rel="canonical" href="https://topperscoachingcenter.com/programs" />
        <meta property="og:title" content="Coaching Classes for School Students in Karachi | Toppers Coaching Center" />
        <meta property="og:description" content="Comprehensive coaching classes for school students in Karachi. From Montessori to Matric, we provide expert guidance." />
        <meta property="og:url" content="https://topperscoachingcenter.com/programs" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block py-2 px-4 rounded-full bg-white/70 border border-primary/10 text-primary text-sm font-semibold tracking-wide mb-6"
          >
            📚 Courses for All Levels
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Academic Programs</h1>
          <p className="text-xl text-slate-600">
            We provide continuous educational support from your child's first school years all the way through their critical matriculation board exams. Every level is designed to build confidence and mastery.
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
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="mb-6 relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{level.title}</h3>
                <p className="text-secondary font-medium text-sm tracking-wide uppercase">{level.grades}</p>
              </div>
              
              <p className="text-slate-600 mb-8 h-auto leading-relaxed">{level.desc}</p>
              
              <ul className="space-y-3 mb-8">
                {level.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-success shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-slate-100 relative z-10">
                <p className="text-sm text-slate-500 mb-4">{level.price}</p>
                <PrimaryCTAButton 
                  label={`${level.cta} →`}
                  href="/contact"
                  fullWidth
                  ariaLabel={`${level.cta} - Enroll in ${level.title}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Teaching Methodology */}
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Proven Teaching Methodology</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">We don't just teach the syllabus; we ensure every student understands concepts deeply enough to apply them confidently in exams and beyond.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Small Batches", desc: "Limited students per class for maximum personal attention." },
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

        {/* Why Choose Toppers */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Choose Toppers for Your Child?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: Award,
                title: "Proven Results",
                desc: "97%+ success rate consistently year after year. Not just numbers—real transformations."
              },
              {
                icon: Clock,
                title: "Timely & Transparent",
                desc: "Regular parent updates, scheduled classes, and clear communication always."
              },
              {
                icon: BookOpen,
                title: "Concept-Focused",
                desc: "We build understanding, not just memorization. Your child retains knowledge for life."
              },
              {
                icon: Users,
                title: "Family-Run Quality",
                desc: "Taught by founders themselves, not rotating hired staff. Personal accountability guaranteed."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-1">
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-12 text-center">
            <p className="text-slate-600 mb-6">Ready to give your child the edge they need?</p>
            <Link href="/contact">
              <WaveWrap variant="gold" rounded="rounded-full">
                <Button className="text-lg h-14 px-10 bg-accent hover:bg-accent/90 text-primary font-bold rounded-full">
                  Schedule Free Demo Class →
                </Button>
              </WaveWrap>
            </Link>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}

