export type ReportListItem = {
  id: string;
  studentId: string;
  month: string;
  status: string;
  generatedPdfPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportJobResponse = {
  reportId: string;
  status: "pending";
  message: string;
};
