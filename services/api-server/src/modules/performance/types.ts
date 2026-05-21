export type PerformanceNoteResponse = {
  id: string;
  studentId: string;
  authorId: string | null;
  note: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  behavioralNotes: string;
  createdAt: string;
};
