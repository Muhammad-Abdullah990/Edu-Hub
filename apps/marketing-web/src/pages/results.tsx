import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, Target, Award, Medal, Star, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@toppers/ui";
import { WaveWrap } from "@toppers/ui";
import { Helmet } from "react-helmet-async";

const data = [
  { year: "2016", rate: 92 },
  { year: "2017", rate: 93 },
  { year: "2018", rate: 94 },
  { year: "2019", rate: 95 },
  { year: "2020", rate: 94 },
  { year: "2021", rate: 96 },
  { year: "2022", rate: 96.5 },
  { year: "2023", rate: 97 },
  { year: "2024", rate: 97.2 },
];

export default function Results() {
  return (
    <>
      <Helmet>
        <title>Student Results & Achievements | Toppers Coaching Center Karachi</title>
        <meta name="description" content="See our proven track record of student success at Toppers Coaching Center Karachi. 97% success rate with outstanding board exam results and academic achievements." />
        <link rel="canonical" href="https://topperscoachingcenter.com/results" />
        <meta property="og:title" content="Student Results & Achievements | Toppers Coaching Center Karachi" />
        <meta property="og:description" content="See our proven track record of student success at Toppers Coaching Center Karachi. 97% success rate with outstanding results." />
        <meta property="og:url" content="https://topperscoachingcenter.com/results" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block py-2 px-4 rounded-full bg-white/70 border border-primary/10 text-primary text-sm font-semibold tracking-wide mb-6"
          >
            📊 19+ Years of Proven Excellence
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Track Record Speaks</h1>
          <p className="text-xl text-slate-600">
            Numbers speak louder than words. For 19+ years, we have consistently delivered exceptional board results, far exceeding the national and regional averages. Our commitment: <span className="text-primary font-semibold">98% success rate</span>.
          </p>
        </div>

        {/* Stats Highlights */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">97.2%</div>
            <div className="text-slate-600 font-medium">2024 Success Rate</div>
            <p className="text-xs text-slate-500 mt-2">Consistent year after year</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={100} />
            </div>
            <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 relative z-10">
              <Target size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2 relative z-10">98%</div>
            <div className="text-slate-600 font-medium relative z-10">Our Mission Target</div>
            <p className="text-xs text-slate-500 mt-2 relative z-10">Driving excellence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 mx-auto bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
              <Award size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">+25%</div>
            <div className="text-slate-600 font-medium">Above Regional Average</div>
            <p className="text-xs text-slate-500 mt-2">Leading our district</p>
          </motion.div>
        </div>

        {/* Chart Section */}
        <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">19+ Years of Unwavering Excellence</h2>
            <p className="text-slate-500">Board examination success rates demonstrating consistent improvement and reliability.</p>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43A047" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#43A047" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[80, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b' }}
                  dx={-10}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Success Rate']}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#43A047" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Toppers Consistent Performance</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="text-slate-500">Accelerating steadily toward 98%</div>
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Toppers of the Year</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                year: "2024",
                name: "Ahmed Hassan",
                marks: "95/100",
                class: "Class 10",
                achievement: "Board Topper - Mathematics",
                icon: Medal
              },
              {
                year: "2024",
                name: "Zainab Khan",
                marks: "93/100",
                class: "Class 10",
                achievement: "Board Topper - Science",
                icon: Star
              },
              {
                year: "2023",
                name: "Faisal Ahmed",
                marks: "94/100",
                class: "Class 10",
                achievement: "Board Topper - Overall",
                icon: Medal
              },
              {
                year: "2023",
                name: "Aisha Malik",
                marks: "92/100",
                class: "Class 9",
                achievement: "Highest in English",
                icon: Star
              }
            ].map((topper, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{topper.year}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{topper.name}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <topper.icon className="text-accent" size={24} />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">{topper.class}</span>
                    <span className="text-2xl font-bold text-primary">{topper.marks}</span>
                  </div>
                  <p className="text-slate-600 italic">{topper.achievement}</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-success font-semibold flex items-center gap-2">
                    ✓ Studied at Toppers for 3+ years
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Improvement Statistics */}
        <div className="max-w-5xl mx-auto bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-200 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Student Improvement Metrics</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-primary mb-2">+32%</div>
              <p className="text-slate-700 font-medium">Average Grade Improvement</p>
              <p className="text-sm text-slate-600 mt-2">Within first 6 months of joining</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-success mb-2">94%</div>
              <p className="text-slate-700 font-medium">Retention Rate</p>
              <p className="text-sm text-slate-600 mt-2">Students continue through graduation</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-accent mb-2">89%</div>
              <p className="text-slate-700 font-medium">Parent Satisfaction</p>
              <p className="text-sm text-slate-600 mt-2">Would recommend Toppers again</p>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Join Our Success Story?</h2>
          <p className="text-slate-600 text-lg mb-8">
            See firsthand how Toppers transforms students into toppers. Schedule a free consultation and discover the difference personalized coaching makes.
          </p>
          <Link href="/contact">
            <WaveWrap variant="red" rounded="rounded-full">
              <Button className="text-lg h-14 px-10 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-full">
                Start Your Journey Today →
              </Button>
            </WaveWrap>
          </Link>
        </div>

      </div>
    </div>
    </>
  );
}

