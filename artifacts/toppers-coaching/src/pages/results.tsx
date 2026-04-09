import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, Target, Award } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Track Record</h1>
          <p className="text-xl text-slate-600">
            Numbers speak louder than words. For over a decade, we have consistently delivered exceptional board results, far exceeding the national average.
          </p>
        </div>

        {/* Stats Highlights */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">97.2%</div>
            <div className="text-slate-600 font-medium">Pass Rate (2024)</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={100} />
            </div>
            <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 relative z-10">
              <Target size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2 relative z-10">98%</div>
            <div className="text-slate-600 font-medium relative z-10">Our Mission Goal</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
              <Award size={28} />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">+25%</div>
            <div className="text-slate-600 font-medium">Above Regional Average</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Yearly Performance Consistency</h2>
            <p className="text-slate-500">Board examination pass rates over the last few years.</p>
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
                  formatter={(value: number) => [`${value}%`, 'Pass Rate']}
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
              <span>Toppers Pass Rate</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="text-slate-500">Heading steadily toward our 98% mission</div>
          </div>
        </div>

      </div>
    </div>
  );
}
