import { motion } from "framer-motion";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, ChartColumnIncreasing, GraduationCap, MapPin, Medal, Phone, Trophy } from "lucide-react";
import { Button } from "@toppers/ui";
import { WaveWrap } from "@toppers/ui";
import { getPublicStudentBySlug, StudentPublicProfile } from "@/lib/backend";
import { Helmet } from "react-helmet-async";

type StudentProfileProps = {
  slug: string;
};

function getYearsWithInstitute(admissionDate: string) {
  const admission = new Date(admissionDate);
  const now = new Date();
  const years = Math.floor((now.valueOf() - admission.valueOf()) / (1000 * 60 * 60 * 24 * 365));
  return Math.max(1, years || 1);
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function StudentProfile({ slug }: StudentProfileProps) {
  const profileQuery = useQuery({
    queryKey: ["publicStudent", slug],
    queryFn: () => getPublicStudentBySlug(slug),
    enabled: !!slug,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const student = profileQuery.data;

  const yearsWithInstitute = useMemo(
    () => (student ? getYearsWithInstitute(student.admissionDate) : 0),
    [student],
  );

  const latestObservation = useMemo(
    () => student?.performanceNotes?.[0]?.note ?? "No recent updates are available yet.",
    [student],
  );

  const timelineEntries = useMemo(() => {
    if (!student) {
      return [];
    }

    const entries = [
      {
        year: "Admission",
        label: "Joined the program",
        marks: "—",
        note: `Admitted on ${formatDate(student.admissionDate)}`,
      },
    ];

    return [
      ...entries,
      ...student.performanceNotes.slice(0, 3).map((note, index) => ({
        year: `Update ${index + 1}`,
        label: "Performance note",
        marks: "—",
        note: note.note,
      })),
    ];
  }, [student]);

  if (!student && !profileQuery.isLoading) {
    return (
      <div
        className="min-h-screen pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Student profile not found</h1>
            <p className="text-slate-600 mb-8">The requested student journey is unavailable right now.</p>
            <Link href="/current-students">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-6">
                Back to Current Students
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{student ? `Student Success – ${student.fullName} | Toppers Coaching Center` : "Student Profile | Toppers Coaching Center"}</title>
        <meta
          name="description"
          content={student ? `${student.fullName} from ${student.class} section ${student.section} is building stronger academic confidence at Toppers Coaching Center.` : "View current student journeys at Toppers Coaching Center."}
        />
        <link rel="canonical" href={`https://topperscoachingcenter.com/student/${slug}`} />
        <meta property="og:title" content={student ? `Student Success – ${student.fullName} | Toppers Coaching Center` : "Student Profile | Toppers Coaching Center"} />
        <meta
          property="og:description"
          content={student ? `${student.fullName} from ${student.class} section ${student.section} is building stronger academic confidence at Toppers Coaching Center.` : "View current student journeys at Toppers Coaching Center."}
        />
        <meta property="og:url" content={`https://topperscoachingcenter.com/student/${slug}`} />
        <meta property="og:type" content="profile" />
      </Helmet>
      <div
        className="min-h-screen pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/current-students" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-medium mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Current Students
            </Link>

            <section className="bg-white rounded-[36px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 mb-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,193,7,0.12),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(30,58,138,0.08),_transparent_40%)]" />
              <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-5">
                    <Trophy className="w-4 h-4" />
                    A journey of consistent growth
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                    {student ? student.fullName : "Student Profile"}
                  </h1>
                  <p className="text-xl text-slate-600 mb-6">
                    {student ? `${student.class} • Section ${student.section}` : "Connecting to backend data..."}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {student && (
                      <>
                        <span className="px-4 py-2 rounded-full bg-accent/15 text-amber-700 font-semibold text-sm">Code {student.studentCode}</span>
                        <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">{student.status === "active" ? "Current Student" : "Archived"}</span>
                      </>
                    )}
                  </div>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    This profile is loaded from the same live backend data source used across the portal.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-[32px] border border-slate-100 p-8">
                  <div className="w-28 h-28 rounded-[28px] bg-gradient-to-br from-primary via-secondary to-accent text-white flex items-center justify-center font-bold text-4xl shadow-lg shadow-primary/20 mb-6">
                    {student ? student.fullName.split(" ").slice(0, 2).map((part) => part[0]).join("") : "ST"}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Class Level</p>
                        <p className="text-slate-600">{student?.class}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Section</p>
                        <p className="text-slate-600">{student?.section}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Admission Date</p>
                        <p className="text-slate-600">{student ? formatDate(student.admissionDate) : "Loading..."}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Medal className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Years with Institute</p>
                        <p className="text-slate-600">{yearsWithInstitute} {yearsWithInstitute === 1 ? "year" : "years"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                    <BookOpen className="text-primary w-6 h-6" />
                    Student Story
                  </h2>
                  <p className="text-slate-600 leading-8 text-lg">{latestObservation}</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <ChartColumnIncreasing className="text-secondary w-6 h-6" />
                    Progress Timeline
                  </h2>
                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-px before:bg-slate-200">
                    {timelineEntries.map((entry, index) => (
                      <div key={`${index}-${entry.year}`} className="relative flex gap-5">
                        <div className="w-10 h-10 rounded-full bg-white border-4 border-secondary/20 flex items-center justify-center text-secondary shrink-0 z-10">
                          {index + 1}
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <h3 className="font-bold text-slate-900">{entry.year} • {entry.label}</h3>
                            <span className="px-3 py-1 rounded-full bg-white text-primary text-sm font-semibold">{entry.marks}</span>
                          </div>
                          <p className="text-slate-600">{entry.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.aside initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                    <Trophy className="text-accent w-6 h-6" />
                    Achievements
                  </h2>
                  <ul className="space-y-4">
                    <li className="rounded-2xl bg-accent/10 border border-accent/20 px-4 py-4 font-medium text-slate-700">
                      {student ? `Code ${student.studentCode}` : "Loading student details"}
                    </li>
                    <li className="rounded-2xl bg-primary/8 border border-primary/15 px-4 py-4 font-medium text-slate-700">
                      Maintained a stable journey for {yearsWithInstitute} {yearsWithInstitute === 1 ? "year" : "years"}
                    </li>
                    {student && student.attendanceSummary.attendancePercentage !== null && (
                      <li className="rounded-2xl bg-secondary/10 border border-secondary/15 px-4 py-4 font-medium text-slate-700">
                        Attendance at {student.attendanceSummary.attendancePercentage}%
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-5">Academic Info</h2>
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-1">Student Code</p>
                      <p className="text-slate-800 font-medium">{student?.studentCode}</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-1">Class</p>
                      <p className="text-slate-800 font-medium">{student?.class}</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-1">Section</p>
                      <p className="text-slate-800 font-medium">{student?.section}</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-1">Status</p>
                      <p className="text-slate-800 font-medium">{student?.status}</p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>

            <section className="mt-10 bg-destructive rounded-[32px] p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white_0,_transparent_45%)]" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Want results like this for your child?</h2>
                <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                  Let’s build the same kind of consistency, confidence, and long-term progress for your family.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/contact">
                    <WaveWrap variant="gold" rounded="rounded-full">
                      <Button className="h-14 px-8 rounded-full bg-accent text-primary font-bold hover:bg-accent/90">
                        Book Free Demo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </WaveWrap>
                  </Link>
                  <a
                    href="https://wa.me/923263987552"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-white/25 bg-white/10 font-bold hover:bg-white/15 transition-colors"
                  >
                    <Phone className="mr-2 w-4 h-4" />
                    Contact on WhatsApp
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

