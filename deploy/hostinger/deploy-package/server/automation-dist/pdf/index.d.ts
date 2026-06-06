export declare class PDFGenerator {
    private browser;
    initialize(): Promise<void>;
    close(): Promise<void>;
    generateFromTemplate(templatePath: string, data: Record<string, unknown>, outputFileName: string): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    generateMonthlyReport(studentId: string, data: {
        studentName: string;
        parentName: string;
        attendancePercentage: number;
        totalDays?: number;
        presentDays?: number;
        absentDays?: number;
        teacherNotes: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        academicProgress: Record<string, unknown>;
        generatedAt: string;
        institutionName: string;
    }): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    generateFeeReminder(studentId: string, data: {
        studentName: string;
        parentName: string;
        feeAmount: number;
        dueDate: string;
        outstandingAmount: number;
        generatedAt: string;
    }): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
}
export declare const pdfGenerator: PDFGenerator;
//# sourceMappingURL=index.d.ts.map