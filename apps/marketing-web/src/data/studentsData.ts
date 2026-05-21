export type StudentTimelineEntry = {
  year: string;
  label: string;
  marks: string;
  note: string;
};

export type Student = {
  id: string;
  name: string;
  classLevel: string;
  yearsWithInstitute: number;
  schoolName: string;
  rankOrPosition?: string;
  shortHighlight: string;
  badge: string;
  image?: string;
  slug: string;
  fatherName?: string;
  residenceArea?: string;
  detailedStory: string;
  resultsTimeline: StudentTimelineEntry[];
};

export function slugifyStudentName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const studentSeed = [
  {
    id: "stu-001",
    name: "Hassan Ali",
    classLevel: "9th Class",
    yearsWithInstitute: 4,
    schoolName: "Baldia Model Secondary School",
    rankOrPosition: "Top 5 in class tests",
    shortHighlight: "Improved from 58% to 84%",
    badge: "Consistent Growth",
    fatherName: "Mr. Ali Raza",
    residenceArea: "Sector 9D, Baldia",
    detailedStory:
      "Hassan joined Toppers when he needed stronger concepts in mathematics and science. Over four years, his confidence, attendance, and test performance steadily improved. With focused revision plans and close monitoring, he has become one of the most dependable students in his batch.",
    resultsTimeline: [
      { year: "Year 1", label: "Joined Toppers", marks: "58%", note: "Needed support in core concepts and regular test discipline." },
      { year: "Year 2", label: "Concept Building", marks: "67%", note: "Started showing stable progress in mathematics and weekly tests." },
      { year: "Year 3", label: "Strong Improvement", marks: "76%", note: "Board-style practice improved accuracy and writing speed." },
      { year: "Current", label: "Pre-Board Level", marks: "84%", note: "Now among the strongest and most consistent students in class." },
    ],
  },
  {
    id: "stu-002",
    name: "Areeba Fatima",
    classLevel: "7th Class",
    yearsWithInstitute: 5,
    schoolName: "The Educators",
    rankOrPosition: "Class Position Holder",
    shortHighlight: "Maintained A grades for 3 years",
    badge: "Top Performer",
    fatherName: "Mr. Muhammad Adnan",
    residenceArea: "Ittehad Town",
    detailedStory:
      "Areeba has been with the institute since primary classes, which reflects the long-term trust her family places in Toppers Coaching Center. Her steady academic rise comes from concept clarity, disciplined homework routines, and a strong reading foundation built over several years.",
    resultsTimeline: [
      { year: "Year 1", label: "Primary Foundation", marks: "72%", note: "Joined for stronger reading, Urdu, and mathematics support." },
      { year: "Year 2", label: "Steady Progress", marks: "81%", note: "Became more confident in class participation and written work." },
      { year: "Year 4", label: "Position Holder", marks: "87%", note: "Started ranking among the best-performing students in school." },
      { year: "Current", label: "Consistent Excellence", marks: "90%", note: "Maintaining A grades with excellent revision habits." },
    ],
  },
  {
    id: "stu-003",
    name: "Mohammad Huzaifa",
    classLevel: "Montessori",
    yearsWithInstitute: 2,
    schoolName: "Little Scholars School",
    shortHighlight: "Reading confidence improved rapidly",
    badge: "Strong Foundation",
    fatherName: "Mr. Usman",
    residenceArea: "Saeedabad",
    detailedStory:
      "Huzaifa's parents wanted a nurturing environment where early learning would remain joyful and structured. Through personalized Montessori-style guidance, he has developed better letter recognition, reading habits, and classroom confidence in a short span.",
    resultsTimeline: [
      { year: "Year 1", label: "Early Learning Start", marks: "Foundation", note: "Focused on phonics, numbers, and classroom confidence." },
      { year: "Year 2", label: "Reading Growth", marks: "Strong Progress", note: "Improved reading fluency and participation in classroom tasks." },
      { year: "Current", label: "Confident Learner", marks: "Excellent", note: "Shows better comprehension and task completion consistency." },
    ],
  },
  {
    id: "stu-004",
    name: "Zainab Noor",
    classLevel: "10th Class",
    yearsWithInstitute: 3,
    schoolName: "Karachi Public School",
    rankOrPosition: "Science test topper",
    shortHighlight: "Biology and chemistry scores surged",
    badge: "Science Excellence",
    fatherName: "Mr. Noor Ahmed",
    residenceArea: "Baldia Town",
    detailedStory:
      "Zainab came to Toppers with clear goals for science subjects but needed the right structure to turn effort into results. Dedicated mentoring in biology and chemistry, paired with regular paper practice, helped her turn difficult chapters into strengths.",
    resultsTimeline: [
      { year: "Year 1", label: "Joined for Sciences", marks: "61%", note: "Needed better structure for science preparation and written answers." },
      { year: "Year 2", label: "Subject Mastery", marks: "74%", note: "Improved significantly in biology and chemistry chapter tests." },
      { year: "Year 3", label: "Board Readiness", marks: "82%", note: "Test scores reflect stronger conceptual understanding and revision." },
      { year: "Current", label: "Pre-Board Success", marks: "88%", note: "Now one of the strongest science students in her group." },
    ],
  },
  {
    id: "stu-005",
    name: "Ahmed Raza",
    classLevel: "5th Class",
    yearsWithInstitute: 6,
    schoolName: "City Grammar Support Program",
    shortHighlight: "Trusted since early primary years",
    badge: "Long-Term Trust",
    fatherName: "Mr. Raza Karim",
    residenceArea: "Baldia Sector 5",
    detailedStory:
      "Ahmed represents the kind of long-term educational partnership parents look for. He joined in the early primary years, and his family has stayed with Toppers because of dependable teaching, regular feedback, and visible academic development every year.",
    resultsTimeline: [
      { year: "Year 1", label: "Joined Young", marks: "65%", note: "Started with support in English and mathematics basics." },
      { year: "Year 3", label: "Clear Progress", marks: "75%", note: "Became more independent and confident in school work." },
      { year: "Year 5", label: "High Consistency", marks: "83%", note: "Maintained strong classroom performance and homework discipline." },
      { year: "Current", label: "Reliable Performer", marks: "86%", note: "Excelling with strong fundamentals and long-term continuity." },
    ],
  },
  {
    id: "stu-006",
    name: "Iqra Khan",
    classLevel: "8th Class",
    yearsWithInstitute: 3,
    schoolName: "Scholars Academy",
    rankOrPosition: "Best Improvement Award",
    shortHighlight: "Went from average to top bracket",
    badge: "Breakthrough Progress",
    fatherName: "Mr. Kashif Khan",
    residenceArea: "Gulshan-e-Ghazi",
    detailedStory:
      "Iqra's story is about momentum. She entered the institute as a shy and average-performing student, but through structured tests, one-on-one feedback, and regular encouragement, she now performs at a level that puts her among the top students in her class.",
    resultsTimeline: [
      { year: "Year 1", label: "Joined Toppers", marks: "54%", note: "Needed confidence building and regular academic structure." },
      { year: "Year 2", label: "Noticeable Improvement", marks: "71%", note: "Started performing better through tests and focused revision." },
      { year: "Current", label: "Top Bracket", marks: "85%", note: "Now competing with the highest achievers in her class." },
    ],
  },
  {
    id: "stu-007",
    name: "Maham Tariq",
    classLevel: "2nd Class",
    yearsWithInstitute: 3,
    schoolName: "Al-Huda School",
    shortHighlight: "Built strong reading and writing basics",
    badge: "Early Progress",
    fatherName: "Mr. Tariq Mahmood",
    residenceArea: "Baldia Sector 8",
    detailedStory:
      "Maham's parents wanted personal attention in the years that matter most for literacy and confidence. The result has been visible growth in reading, handwriting, vocabulary, and classroom readiness, supported by a calm and encouraging learning environment.",
    resultsTimeline: [
      { year: "Year 1", label: "Reading Basics", marks: "Developing", note: "Worked on phonics, sounds, and structured practice." },
      { year: "Year 2", label: "Better Writing", marks: "Good", note: "Improved sentence formation and daily reading habits." },
      { year: "Current", label: "Strong Foundation", marks: "Very Good", note: "Performs confidently with improved reading and writing skills." },
    ],
  },
  {
    id: "stu-008",
    name: "Umer Farooq",
    classLevel: "O Levels Prep",
    yearsWithInstitute: 2,
    schoolName: "Private Candidate Support",
    rankOrPosition: "High-scoring mock exams",
    shortHighlight: "Mock exam performance climbed fast",
    badge: "Exam Ready",
    fatherName: "Mr. Farooq Ahmed",
    residenceArea: "Saeedabad",
    detailedStory:
      "Umer joined for focused exam-oriented support and quickly adapted to the institute's high-discipline approach. Mock testing, concept revision, and close follow-up helped him improve time management and accuracy under exam pressure.",
    resultsTimeline: [
      { year: "Year 1", label: "Exam Strategy Build", marks: "63%", note: "Focused on revision planning and smarter paper attempts." },
      { year: "Year 2", label: "Mock Exam Rise", marks: "79%", note: "Strong improvement in timed tests and subject retention." },
      { year: "Current", label: "Confident Candidate", marks: "86%", note: "Prepared with high-scoring mock performance and consistency." },
    ],
  },
] as const;

export const studentsData: Student[] = studentSeed.map((student) => ({
  ...student,
  slug: slugifyStudentName(student.name),
  resultsTimeline: [...student.resultsTimeline] as StudentTimelineEntry[],
}));

export const uniqueStudentClasses = Array.from(new Set(studentsData.map((student) => student.classLevel)));

export function getStudentBySlug(slug: string) {
  return studentsData.find((student) => student.slug === slug);
}

