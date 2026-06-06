import { automationDb } from "../db";
import { pdfGenerator } from "../pdf";
import { whatsAppService } from "../whatsapp";
import { queueService } from "../queues";
import logger from "../logging";
export class WorkflowService {
    async processMonthlyReportReady(job) {
        const { studentId, month, year } = job.payload;
        logger.info({ jobId: job.id, studentId, month, year }, "Processing monthly report workflow");
        // Fetch student data (would integrate with API)
        const studentData = await this.fetchStudentData(studentId);
        const reportData = await this.fetchMonthlyReportData(studentId, month, year);
        // Generate PDF
        const pdfResult = await pdfGenerator.generateMonthlyReport(studentId, {
            studentName: studentData.name,
            parentName: studentData.parentName,
            attendancePercentage: reportData.attendancePercentage,
            totalDays: reportData.totalDays,
            presentDays: reportData.presentDays,
            absentDays: reportData.absentDays,
            teacherNotes: reportData.teacherNotes,
            strengths: reportData.strengths,
            weaknesses: reportData.weaknesses,
            recommendations: reportData.recommendations,
            academicProgress: reportData.academicProgress,
            generatedAt: new Date().toISOString(),
            institutionName: "Toppers Coaching Center",
        });
        // Save report metadata
        await automationDb.createGeneratedReport({
            jobId: job.id,
            studentId,
            reportType: "monthly",
            filePath: pdfResult.filePath,
            fileName: pdfResult.filePath.split("/").pop() || "",
            fileSize: pdfResult.size,
            checksum: pdfResult.checksum,
            metadata: { month, year },
        });
        // Create message drafts for all parent WhatsApp numbers
        const parentNumbers = studentData.whatsappNumbers && studentData.whatsappNumbers.length > 0
            ? studentData.whatsappNumbers
            : [studentData.parentPhone];
        for (const number of parentNumbers) {
            const message = `Dear ${studentData.parentName},\n\nPlease find attached the monthly progress report for ${studentData.name} for ${month} ${year}.\n\nBest regards,\nToppers Coaching Center`;
            await automationDb.createMessageDraft({
                jobId: job.id,
                studentId,
                parentId: studentData.parentId,
                channel: "whatsapp",
                recipient: number,
                subject: `Monthly Report - ${studentData.name}`,
                message,
                attachments: [pdfResult.filePath],
                status: "draft",
            });
        }
        // Mark job as ready for manual send
        await queueService.markJobAwaitingManualSend(job.id);
        logger.info({ jobId: job.id, recipientCount: parentNumbers.length }, "Monthly report workflow completed");
    }
    async processFeeReminderDue(job) {
        const { studentId, feeRecordId, dueDate, amount } = job.payload;
        logger.info({ jobId: job.id, studentId, feeRecordId }, "Processing fee reminder workflow");
        // Fetch student and fee data
        const studentData = await this.fetchStudentData(studentId);
        const feeData = await this.fetchFeeData(feeRecordId);
        // Create message drafts for all parent WhatsApp numbers
        const parentNumbers = studentData.whatsappNumbers && studentData.whatsappNumbers.length > 0
            ? studentData.whatsappNumbers
            : [studentData.parentPhone];
        for (const number of parentNumbers) {
            const message = `Dear ${studentData.parentName},\n\nThis is a gentle reminder regarding the monthly fee of your child ${studentData.name}.\n\nFee Amount: Rs. ${amount}\nDue Date: ${dueDate}\n\nKindly submit the fee at your earliest convenience.\n\nThank you,\nToppers Coaching Center`;
            await automationDb.createMessageDraft({
                jobId: job.id,
                studentId,
                parentId: studentData.parentId,
                channel: "whatsapp",
                recipient: number,
                subject: `Fee Reminder - ${studentData.name}`,
                message,
                status: "draft",
            });
        }
        // Mark job as ready for manual send
        await queueService.markJobAwaitingManualSend(job.id);
        logger.info({ jobId: job.id, recipientCount: parentNumbers.length }, "Fee reminder workflow completed");
    }
    async processAttendanceAlert(job) {
        const { studentId, attendancePercentage, month } = job.payload;
        logger.info({ jobId: job.id, studentId, attendancePercentage }, "Processing attendance alert workflow");
        const studentData = await this.fetchStudentData(studentId);
        const parentNumbers = studentData.whatsappNumbers && studentData.whatsappNumbers.length > 0
            ? studentData.whatsappNumbers
            : [studentData.parentPhone];
        for (const number of parentNumbers) {
            const message = `Dear ${studentData.parentName},\n\nWe noticed that ${studentData.name}'s attendance for ${month} is ${attendancePercentage}%. Please ensure regular attendance.\n\nBest regards,\nToppers Coaching Center`;
            await automationDb.createMessageDraft({
                jobId: job.id,
                studentId,
                parentId: studentData.parentId,
                channel: "whatsapp",
                recipient: number,
                subject: `Attendance Alert - ${studentData.name}`,
                message,
                status: "draft",
            });
        }
        await queueService.markJobAwaitingManualSend(job.id);
        logger.info({ jobId: job.id }, "Attendance alert workflow completed");
    }
    async processPerformanceAlert(job) {
        const { studentId, subject, grade, teacherNotes } = job.payload;
        logger.info({ jobId: job.id, studentId, subject }, "Processing performance alert workflow");
        const studentData = await this.fetchStudentData(studentId);
        const parentNumbers = studentData.whatsappNumbers && studentData.whatsappNumbers.length > 0
            ? studentData.whatsappNumbers
            : [studentData.parentPhone];
        for (const number of parentNumbers) {
            const message = `Dear ${studentData.parentName},\n\nRegarding ${studentData.name}'s performance in ${subject}:\nGrade: ${grade}\n\nTeacher Notes: ${teacherNotes}\n\nPlease schedule a meeting if needed.\n\nBest regards,\nToppers Coaching Center`;
            await automationDb.createMessageDraft({
                jobId: job.id,
                studentId,
                parentId: studentData.parentId,
                channel: "whatsapp",
                recipient: number,
                subject: `Performance Alert - ${studentData.name}`,
                message,
                status: "draft",
            });
        }
        await queueService.markJobAwaitingManualSend(job.id);
        logger.info({ jobId: job.id }, "Performance alert workflow completed");
    }
    async processCustomParentNotification(job) {
        const { studentId, parentId, subject, message } = job.payload;
        logger.info({ jobId: job.id, studentId, parentId }, "Processing custom notification workflow");
        const studentData = await this.fetchStudentData(studentId);
        const parentNumbers = studentData.whatsappNumbers && studentData.whatsappNumbers.length > 0
            ? studentData.whatsappNumbers
            : [studentData.parentPhone];
        for (const number of parentNumbers) {
            await automationDb.createMessageDraft({
                jobId: job.id,
                studentId,
                parentId,
                channel: "whatsapp",
                recipient: number,
                subject,
                message,
                status: "draft",
            });
        }
        await queueService.markJobAwaitingManualSend(job.id);
        logger.info({ jobId: job.id }, "Custom notification workflow completed");
    }
    async executeWhatsAppDraft(draftId) {
        const draft = await automationDb.getMessageDraftById?.(draftId); // Need to add this method
        if (!draft) {
            throw new Error(`Draft ${draftId} not found`);
        }
        await whatsAppService.prepareDraft({
            recipient: draft.recipient,
            message: draft.message,
            attachments: draft.attachments,
        });
        // Mark draft as reviewed
        await automationDb.updateMessageDraftStatus(draftId, "reviewed", "system");
        logger.info({ draftId }, "WhatsApp draft executed");
    }
    // Fetch actual student data from the database
    async fetchStudentData(studentId) {
        try {
            const { db, studentsTable, studentParentsTable, parentsTable } = await import("@toppers/db");
            const { eq } = await import("drizzle-orm");
            const student = await db.query.studentsTable.findFirst({
                where: eq(studentsTable.id, studentId),
                with: {
                    studentParents: {
                        with: {
                            parent: true,
                        },
                    },
                },
            });
            if (!student) {
                logger.warn({ studentId }, "Student not found, using fallback");
                return {
                    id: studentId,
                    name: "Student",
                    parentId: "",
                    parentName: "Parent",
                    parentPhone: "",
                    whatsappNumbers: [],
                };
            }
            // Collect all parent WhatsApp numbers
            const whatsappNumbers = [];
            const firstParent = student.studentParents[0]?.parent;
            for (const sp of student.studentParents) {
                const parent = sp.parent;
                if (parent.whatsappNumbers && Array.isArray(parent.whatsappNumbers)) {
                    for (const num of parent.whatsappNumbers) {
                        if (num && !whatsappNumbers.includes(num)) {
                            whatsappNumbers.push(num);
                        }
                    }
                }
                // Fallback to parent phone if no whatsappNumbers
                if ((!parent.whatsappNumbers || parent.whatsappNumbers.length === 0) && parent.phone) {
                    if (!whatsappNumbers.includes(parent.phone)) {
                        whatsappNumbers.push(parent.phone);
                    }
                }
            }
            return {
                id: student.id,
                name: student.fullName,
                parentId: firstParent?.id || "",
                parentName: firstParent?.name || "Parent",
                parentPhone: whatsappNumbers[0] || firstParent?.phone || "",
                whatsappNumbers,
            };
        }
        catch (error) {
            logger.error({ error, studentId }, "Failed to fetch student data, using fallback");
            return {
                id: studentId,
                name: "Student",
                parentId: "",
                parentName: "Parent",
                parentPhone: "",
                whatsappNumbers: [],
            };
        }
    }
    async fetchMonthlyReportData(studentId, month, year) {
        try {
            const { db, attendanceTable, progressReportsTable } = await import("@toppers/db");
            const { eq, and, gte, lte } = await import("drizzle-orm");
            // Fetch attendance for the given month
            const monthStart = `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, "0")}-01`;
            const monthEnd = `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, "0")}-31`;
            const attendanceRows = await db
                .select()
                .from(attendanceTable)
                .where(and(eq(attendanceTable.studentId, studentId), gte(attendanceTable.date, monthStart), lte(attendanceTable.date, monthEnd)));
            const totalDays = attendanceRows.length;
            const presentDays = attendanceRows.filter(r => r.status === "present").length;
            const absentDays = attendanceRows.filter(r => r.status === "absent").length;
            const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            // Fetch latest progress report for this student in this month
            const monthFormatted = `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, "0")}`;
            const report = await db.query.progressReportsTable.findFirst({
                where: and(eq(progressReportsTable.studentId, studentId), eq(progressReportsTable.month, monthFormatted)),
            });
            return {
                attendancePercentage,
                totalDays,
                presentDays,
                absentDays,
                teacherNotes: report?.teacherNote || "Good progress this month",
                strengths: report?.strengths || ["Consistent effort"],
                weaknesses: report?.weaknesses || [],
                recommendations: [],
                academicProgress: report?.academicProgress || {},
            };
        }
        catch (error) {
            logger.error({ error, studentId }, "Failed to fetch monthly report data, using fallback");
            return {
                attendancePercentage: 0,
                totalDays: 0,
                presentDays: 0,
                absentDays: 0,
                teacherNotes: "Good progress this month",
                strengths: ["Consistent effort"],
                weaknesses: [],
                recommendations: [],
                academicProgress: {},
            };
        }
    }
    async fetchFeeData(feeRecordId) {
        try {
            const { db, feeRecordsTable } = await import("@toppers/db");
            const { eq } = await import("drizzle-orm");
            const [record] = await db
                .select()
                .from(feeRecordsTable)
                .where(eq(feeRecordsTable.id, feeRecordId))
                .limit(1);
            if (record) {
                return {
                    outstandingAmount: record.amountDue - record.amountPaid,
                };
            }
            return { outstandingAmount: 0 };
        }
        catch (error) {
            logger.error({ error, feeRecordId }, "Failed to fetch fee data");
            return { outstandingAmount: 0 };
        }
    }
    async processJob(job) {
        switch (job.eventType) {
            case "MONTHLY_REPORT_READY":
                await this.processMonthlyReportReady(job);
                break;
            case "FEE_REMINDER_DUE":
                await this.processFeeReminderDue(job);
                break;
            case "ATTENDANCE_ALERT":
                await this.processAttendanceAlert(job);
                break;
            case "PERFORMANCE_ALERT":
                await this.processPerformanceAlert(job);
                break;
            case "CUSTOM_PARENT_NOTIFICATION":
                await this.processCustomParentNotification(job);
                break;
            default:
                throw new Error(`Unknown event type: ${job.eventType}`);
        }
    }
}
export const workflowService = new WorkflowService();
//# sourceMappingURL=index.js.map