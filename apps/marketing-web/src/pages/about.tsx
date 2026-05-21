import { motion } from "framer-motion";
import { CheckCircle2, Heart, Target, Lightbulb, Coffee, Smile, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@toppers/ui";
import { WaveWrap } from "@toppers/ui";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Toppers Coaching Center | 19 Years of Educational Excellence in Karachi</title>
        <meta name="description" content="Learn about Toppers Coaching Center's 19-year legacy in Karachi. Our experienced faculty and proven methods help students excel in their academic journey." />
        <link rel="canonical" href="https://topperscoachingcenter.com/about" />
        <meta property="og:title" content="About Toppers Coaching Center | 19 Years of Educational Excellence in Karachi" />
        <meta property="og:description" content="Learn about Toppers Coaching Center's 19-year legacy in Karachi. Our experienced faculty and proven methods help students excel." />
        <meta property="og:url" content="https://topperscoachingcenter.com/about" />
        <meta property="og:type" content="website" />
      </Helmet>
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
              19 Years of Dedication to Excellence • Building Toppers, Not Just Teaching Students
            </motion.p>
          </div>
        </div>
      </section>

      {/* The Founding Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">A Legacy Built on Passion</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  In 2006, amidst the bustling streets of Baldia Town, a Montessori Directress with 35+ years of teaching experience saw a gap in quality education. She noticed that many bright students weren't reaching their potential, not because they lacked ability, but because they lacked individual attention and personalized guidance.
                </p>
                <p>
                  <strong className="text-slate-900">Toppers Coaching Center was born</strong> from a mother's determination to change this. What started as a dream to support a handful of students has, over 19 years, transformed into Baldia's most trusted coaching center.
                </p>
                <p>
                  Unlike commercial institutes that hire rotating staff, Toppers remained true to its roots: <span className="text-primary font-semibold">a family-run institution where the founders teach every class</span>. This is personal. This is accountability.
                </p>
              </div>
            </motion.div>

            {/* The Founders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Meet Our Founders</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    👩‍🏫
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Founder & Director</h3>
                  <p className="text-slate-600">35+ years of Montessori teaching experience</p>
                  <p className="text-sm text-slate-500 mt-2">The heart and soul behind Toppers</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-purple-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    💻
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Muhammad Abdullah</h3>
                  <p className="text-slate-600">Software Engineer & Co-Manager</p>
                  <p className="text-sm text-slate-500 mt-2">Brings tech-savvy modernization</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    👨‍⚕️
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Tayyaba Gul</h3>
                  <p className="text-slate-600">Doctor of Pharmacy & Co-Manager</p>
                  <p className="text-sm text-slate-500 mt-2">Teaches with medical precision</p>
                </div>
              </div>
            </motion.div>
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
              <p className="text-slate-600 text-lg leading-relaxed">
                To consistently achieve a 98% success rate by delivering highly personalized, concept-focused education. We understand each student's unique learning style and guide them with clarity, completeness, and precision.
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
              <p className="text-slate-600 text-lg leading-relaxed">
                To educate Baldia and beyond. We envision a community where quality education is accessible, and every student is empowered with knowledge and confidence to pursue higher education and successful professional careers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Parents Choose Toppers</h2>
            <p className="text-slate-600 text-lg">What sets us apart isn't just results—it's how we achieve them.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Family-Taught Philosophy",
                desc: "We don't hire rotating staff. Founders teach every class. Your child's success is our personal responsibility."
              },
              {
                icon: Target,
                title: "Limited Enrollment",
                desc: "We cap student intake to ensure maximum focus. No overcrowded rooms. Every student gets individual attention."
              },
              {
                icon: CheckCircle2,
                title: "Proven Consistency",
                desc: "97%+ success rate isn't a one-time achievement—it's our standard for 19 consecutive years."
              },
              {
                icon: BookOpen,
                title: "Concept Over Memorization",
                desc: "We build deep understanding so students retain knowledge for life, not just pass exams."
              },
              {
                icon: Coffee,
                title: "Personal Mentorship",
                desc: "Beyond academics, we guide students' futures. College selection, career paths, life decisions."
              },
              {
                icon: Smile,
                title: "Warm, Welcoming Environment",
                desc: "Every student feels valued. We celebrate small wins and build confidence alongside excellence."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all"
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

      {/* By The Numbers */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">19 Years of Excellence by the Numbers</h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { stat: "19+", label: "Years of Service" },
              { stat: "1000+", label: "Students Taught" },
              { stat: "97%+", label: "Success Rate" },
              { stat: "100%", label: "Family-Taught" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-accent mb-3">{item.stat}</div>
                <p className="text-primary-foreground/80 text-lg font-medium">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Join the Toppers Family</h2>
          <p className="text-slate-600 text-lg mb-10">
            Discover why hundreds of families trust us with their child's future. Schedule a free consultation and see the Toppers difference firsthand.
          </p>
          <Link href="/contact">
            <WaveWrap variant="red" rounded="rounded-full">
              <Button className="text-lg h-14 px-10 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-full">
                Schedule Free Consultation →
              </Button>
            </WaveWrap>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}

