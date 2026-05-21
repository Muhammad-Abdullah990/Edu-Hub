import { motion } from "framer-motion";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@toppers/ui";
import { EnhancedCTAButton } from "@toppers/ui";
import { Search, Users, TrendingUp, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { studentsData, uniqueStudentClasses } from "@/data/studentsData";
import { Helmet } from "react-helmet-async";

const yearsFilterOptions = [
  { label: "All Years", value: "all" },
  { label: "1-2 Years", value: "1-2" },
  { label: "3-4 Years", value: "3-4" },
  { label: "5+ Years", value: "5+" },
];

function getBadgeStyles(badge: string) {
  if (badge.includes("Top") || badge.includes("Excellence")) {
    return "bg-accent/15 text-amber-700 border-accent/25";
  }
  if (badge.includes("Trust") || badge.includes("Foundation")) {
    return "bg-primary/10 text-primary border-primary/15";
  }
  return "bg-success/10 text-emerald-700 border-emerald-200";
}

export default function CurrentStudents() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [yearsFilter, setYearsFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return studentsData.filter((student) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.shortHighlight.toLowerCase().includes(normalizedSearch);

      const matchesClass = classFilter === "all" || student.classLevel === classFilter;

      const matchesYears =
        yearsFilter === "all" ||
        (yearsFilter === "1-2" && student.yearsWithInstitute <= 2) ||
        (yearsFilter === "3-4" && student.yearsWithInstitute >= 3 && student.yearsWithInstitute <= 4) ||
        (yearsFilter === "5+" && student.yearsWithInstitute >= 5);

      return matchesSearch && matchesClass && matchesYears;
    });
  }, [classFilter, deferredSearch, yearsFilter]);

  const averageYears = useMemo(() => {
    const totalYears = studentsData.reduce((sum, student) => sum + student.yearsWithInstitute, 0);
    return (totalYears / studentsData.length).toFixed(1);
  }, []);

  return (
    <>
      <Helmet>
        <title>Current Students | Toppers Coaching Center Karachi</title>
        <meta name="description" content="Meet current students of Toppers Coaching Center and see why families stay with us for years. Real success stories from our Karachi coaching center." />
        <link rel="canonical" href="https://topperscoachingcenter.com/current-students" />
        <meta property="og:title" content="Current Students | Toppers Coaching Center Karachi" />
        <meta property="og:description" content="Meet current students of Toppers Coaching Center and see why families stay with us for years." />
        <meta property="og:url" content="https://topperscoachingcenter.com/current-students" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div
        className="min-h-screen pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}
      >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/70 border border-primary/10 text-primary text-sm font-semibold tracking-wide mb-6"
          >
            <Sparkles className="w-4 h-4" />
            A Wall of Trust
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-5"
          >
            Our Current Students
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600"
          >
            Trusted by families. Proven by results.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-5xl mx-auto mb-12">
          {[
            { label: "Avg Years With Us", value: averageYears, icon: ShieldCheck, tone: "text-secondary bg-secondary/10" },
            { label: "Success Rate", value: "97%", icon: TrendingUp, tone: "text-destructive bg-destructive/10" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm p-6 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${stat.tone}`}>
                <stat.icon size={26} />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto bg-white/85 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm p-5 md:p-6 mb-10">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students by name or highlight"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All Classes</option>
              {uniqueStudentClasses.map((classLevel) => (
                <option key={classLevel} value={classLevel}>
                  {classLevel}
                </option>
              ))}
            </select>

            <select
              value={yearsFilter}
              onChange={(event) => setYearsFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {yearsFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -6 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="group"
              >
                <Link href={`/student/${student.slug}`}>
                  <div className="h-full bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 p-5 md:p-6 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 shrink-0">
                        {student.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                      </div>
                      <span className={`text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full border ${getBadgeStyles(student.badge)}`}>
                        {student.badge}
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{student.name}</h2>
                    <p className="text-primary font-semibold mb-3">{student.classLevel}</p>
                    <p className="text-sm text-slate-500 mb-4">
                      With us for {student.yearsWithInstitute} {student.yearsWithInstitute === 1 ? "year" : "years"}
                    </p>

                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 text-slate-700 text-sm font-medium mb-5">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        {student.shortHighlight}
                      </div>

                      <div className="inline-flex items-center gap-2 text-destructive font-bold group/link">
                        <span>View Profile</span>
                        <motion.span
                          className="inline-flex"
                          initial={{ x: -4, opacity: 0.65 }}
                          whileHover={{ x: 4, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 280, damping: 22 }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center mt-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No students match your filters</h3>
              <p className="text-slate-600">Try adjusting the search or selecting a different class/year range.</p>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto mt-16 bg-primary rounded-[32px] text-white p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white_0,_transparent_50%)]" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Families stay with us because progress stays visible</h3>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              From early foundations to exam years, these journeys show the kind of long-term care and academic growth parents value.
            </p>
            <EnhancedCTAButton
              href="/contact"
              label="Ask About Admissions"
              ariaLabel="Ask About Admissions"
              className="h-14 px-8 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

