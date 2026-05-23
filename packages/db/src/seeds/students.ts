import { db } from "../index";
import {
  attendanceSummaryTable,
  feeStatusTable,
  parentsTable,
  performanceNotesTable,
  studentsTable,
  studentParentsTable,
} from "../schema";

const DEMO_STUDENTS = [
  {
    studentCode: "STU-001",
    fullName: "Ahmed Hassan",
    class: "Class 10",
    section: "A",
    dateOfBirth: "2010-03-15",
    admissionDate: "2020-06-01",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    studentCode: "STU-002",
    fullName: "Fatima Ali",
    class: "Class 10",
    section: "B",
    dateOfBirth: "2009-08-22",
    admissionDate: "2019-06-01",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    studentCode: "STU-003",
    fullName: "Omar Khalid",
    class: "Class 9",
    section: "A",
    dateOfBirth: "2011-01-10",
    admissionDate: "2021-06-01",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    studentCode: "STU-004",
    fullName: "Aisha Malik",
    class: "Class 8",
    section: "A",
    dateOfBirth: "2012-05-18",
    admissionDate: "2022-06-01",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffb8dde6?w=150",
  },
  {
    studentCode: "STU-005",
    fullName: "Hassan Imran",
    class: "Class 10",
    section: "A",
    dateOfBirth: "2010-11-30",
    admissionDate: "2020-06-01",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    studentCode: "STU-006",
    fullName: "Zainab Siddiqui",
    class: "Class 9",
    section: "B",
    dateOfBirth: "2011-09-05",
    admissionDate: "2021-06-01",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    studentCode: "STU-007",
    fullName: "Ali Raza",
    class: "Class 7",
    section: "A",
    dateOfBirth: "2013-02-28",
    admissionDate: "2023-06-01",
    photoUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150",
  },
  {
    studentCode: "STU-008",
    fullName: "Maryam Khan",
    class: "Class 10",
    section: "B",
    dateOfBirth: "2009-12-15",
    admissionDate: "2019-06-01",
    photoUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150",
  },
];

const DEMO_PARENTS = [
  {
    name: "Muhammad Hassan",
    phone: "+92-300-1234567",
    email: "muhammad.hassan@email.com",
    relationship: "father" as const,
    address: "123-A, Gulberg III, Lahore",
  },
  {
    name: "Sana Ali",
    phone: "+92-321-9876543",
    email: "sana.ali@email.com",
    relationship: "mother" as const,
    address: "45-B, Model Town, Lahore",
  },
  {
    name: "Khalid Mehmood",
    phone: "+92-333-5556666",
    email: "khalid.m@email.com",
    relationship: "father" as const,
    address: "78-C, DHA Phase 5, Lahore",
  },
  {
    name: "Rashida Malik",
    phone: "+92-342-7778888",
    email: "rashida.malik@email.com",
    relationship: "mother" as const,
    address: "90-D, Cantt, Lahore",
  },
  {
    name: "Imran Ahmed",
    phone: "+92-345-1112222",
    email: "imran.ahmed@email.com",
    relationship: "father" as const,
    address: "12-E, Johar Town, Lahore",
  },
  {
    name: "Amina Siddiqui",
    phone: "+92-346-3334444",
    email: "amina.s@email.com",
    relationship: "mother" as const,
    address: "34-F, Wapda Town, Lahore",
  },
];

const STUDENT_PARENT_LINKS = [
  { studentCode: "STU-001", parentIndex: 0 },
  { studentCode: "STU-001", parentIndex: 1 },
  { studentCode: "STU-002", parentIndex: 1 },
  { studentCode: "STU-003", parentIndex: 2 },
  { studentCode: "STU-004", parentIndex: 3 },
  { studentCode: "STU-005", parentIndex: 4 },
  { studentCode: "STU-005", parentIndex: 5 },
  { studentCode: "STU-006", parentIndex: 3 },
  { studentCode: "STU-007", parentIndex: 4 },
  { studentCode: "STU-008", parentIndex: 0 },
  { studentCode: "STU-008", parentIndex: 5 },
];

const PERFORMANCE_NOTES = [
  {
    studentCode: "STU-001",
    note: "Exceptional performance in mathematics. Shows great analytical skills.",
    strengths: "Mathematics, Problem Solving, Logical Thinking",
    weaknesses: "Needs to improve presentation skills",
    recommendations: "Consider participating in math olympiad",
    behavioralNotes: "Always punctual and attentive in class",
  },
  {
    studentCode: "STU-002",
    note: "Consistent top performer. Great teamwork in group activities.",
    strengths: "Science, Communication, Teamwork",
    weaknesses: "Can be nervous during exams",
    recommendations: "Practice mock tests to reduce exam anxiety",
    behavioralNotes: "Helpful towards classmates",
  },
  {
    studentCode: "STU-003",
    note: "Improving steadily. Shows interest in literature.",
    strengths: "English Literature, Creative Writing",
    weaknesses: "Slow in calculations",
    recommendations: "Extra practice in mathematics fundamentals",
    behavioralNotes: "Quiet but participative when prompted",
  },
];

async function seedStudents() {
  const createdStudents = [];

  for (const student of DEMO_STUDENTS) {
    const [created] = await db
      .insert(studentsTable)
      .values({
        ...student,
        status: "active",
      })
      .onConflictDoUpdate({
        target: studentsTable.studentCode,
        set: {
          fullName: student.fullName,
          class: student.class,
          section: student.section,
        },
      })
      .returning({ id: studentsTable.id });

    createdStudents.push({
      id: created.id,
      studentCode: student.studentCode,
    });

    // Create attendance summary
    await db
      .insert(attendanceSummaryTable)
      .values({
        studentId: created.id,
        attendancePercentage: Math.floor(Math.random() * 20) + 80,
        totalDays: 180,
        presentDays: Math.floor(Math.random() * 20) + 160,
        absentDays: Math.floor(Math.random() * 10) + 5,
        lastRecordedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: attendanceSummaryTable.studentId,
        set: {
          attendancePercentage: Math.floor(Math.random() * 20) + 80,
          lastRecordedAt: new Date(),
        },
      });

    // Create fee status
    const feeStatuses = ["paid", "pending", "partial"];
    await db
      .insert(feeStatusTable)
      .values({
        studentId: created.id,
        status: feeStatuses[Math.floor(Math.random() * feeStatuses.length)],
        outstandingAmount: Math.floor(Math.random() * 5000),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      })
      .onConflictDoUpdate({
        target: feeStatusTable.studentId,
        set: {
          status: feeStatuses[Math.floor(Math.random() * feeStatuses.length)],
        },
      });
  }

  return createdStudents;
}

async function seedParents(createdStudents: Array<{ id: string; studentCode: string }>) {
  const createdParents = [];

  for (let i = 0; i < DEMO_PARENTS.length; i++) {
    const parent = DEMO_PARENTS[i];
    const [created] = await db
      .insert(parentsTable)
      .values(parent)
      .onConflictDoNothing()
      .returning({ id: parentsTable.id });
    if (created) {
      createdParents.push({
        id: created.id,
        index: i,
      });
      continue;
    }

    const existing = await db.query.parentsTable.findFirst({
      where: (table, { eq }) => eq(table.phone, parent.phone),
    });

    if (existing) {
      createdParents.push({
        id: existing.id,
        index: i,
      });
    }
  }

  // Link parents to students
  for (const link of STUDENT_PARENT_LINKS) {
    const student = createdStudents.find((s) => s.studentCode === link.studentCode);
    const parent = createdParents.find((p) => p.index === link.parentIndex);

    if (student && parent) {
      await db
        .insert(studentParentsTable)
        .values({
          studentId: student.id,
          parentId: parent.id,
        })
        .onConflictDoNothing();
    }
  }
}

async function seedPerformanceNotes(createdStudents: Array<{ id: string; studentCode: string }>) {
  for (const note of PERFORMANCE_NOTES) {
    const student = createdStudents.find((s) => s.studentCode === note.studentCode);

    if (student) {
      await db
        .insert(performanceNotesTable)
        .values({
          studentId: student.id,
          note: note.note,
          strengths: note.strengths,
          weaknesses: note.weaknesses,
          recommendations: note.recommendations,
          behavioralNotes: note.behavioralNotes,
        })
        .onConflictDoNothing();
    }
  }
}

async function main() {
  process.stdout.write("Seeding students...\n");
  const createdStudents = await seedStudents();
  process.stdout.write(`Created ${createdStudents.length} students\n`);

  process.stdout.write("Seeding parents...\n");
  await seedParents(createdStudents);
  process.stdout.write(`Created ${DEMO_PARENTS.length} parents\n`);

  process.stdout.write("Seeding performance notes...\n");
  await seedPerformanceNotes(createdStudents);
  process.stdout.write(`Created ${PERFORMANCE_NOTES.length} performance notes\n`);

  process.stdout.write("Student seed completed!\n");
}

import pino from "pino";
const logger = pino();

main()
  .catch((error) => {
    logger.error({ error }, "Failed to seed student data");
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
