import { motion } from "framer-motion";
import { CheckCircle2, Heart, Target, Lightbulb } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl pl-4 sm:pl-8 md:pl-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Our Story
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-foreground/80 leading-relaxed"
            >
              Established in 2006, Toppers Coaching Center began with a simple mission: to provide unparalleled educational focus to every student in Baldia Town.
            </motion.p>
          </div>
        </div>
      </section>

      {/* The Founding Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">A Legacy of Education</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Founded by a passionate Montessori Directress with over 35+ years combined teaching experience, Toppers was built on the philosophy that every child has the potential to excel if given the right guidance and attention. 
              </p>
              <p>
                What started as a small initiative has grown into Baldia's premier coaching center. Unlike commercial institutes that rely on rotating hired staff, Toppers is a family-run institution. Our founders and management are the teachers. 
              </p>
              <p>
                Today, managed alongside Muhammad Abdullah (Software Engineer) and Tayyaba Gul (Doctor of Pharmacy), the center bridges foundational early education with modern, career-focused mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-secondary/5 border border-secondary/10"
            >
              <Target className="w-12 h-12 text-secondary mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 text-lg">
                To consistently attain a 98% success rate by delivering highly personalized, concept-focused education. We are committed to clearly understanding each student's unique learning style and effectively guiding them to reach their fullest potential with clarity, completeness, and precision.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-accent/10 border border-accent/20"
            >
              <Lightbulb className="w-12 h-12 text-accent mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 text-lg">
                To Educate Baldia. We envision a community where quality education is accessible, and every student is equipped with the knowledge and confidence to pursue higher education and professional careers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Toppers Difference</h2>
            <p className="text-slate-600 text-lg">Why parents trust us with their children's future.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Family-Taught Philosophy",
                desc: "We don't hire outside teachers. Every student is personally taught by the founders. We treat your children's success as our personal responsibility."
              },
              {
                icon: Target,
                title: "Limited Enrollment",
                desc: "We cap our student intake to ensure maximum focus. No overcrowded classrooms. Every student gets the individual attention they need to grasp complex concepts."
              },
              {
                icon: CheckCircle2,
                title: "Proven Consistency",
                desc: "A 97%+ pass rate isn't a one-time achievement; it's our standard. Since 2006, we have consistently delivered top results in board examinations."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
