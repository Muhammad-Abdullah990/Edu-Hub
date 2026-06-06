import { db } from "@toppers/db";
import { automationJobsTable, communicationLogsTable, generatedReportsTable, messageDraftsTable, automationEventsTable, } from "@toppers/db/schema";
import { eq, sql } from "drizzle-orm";
import logger from "../logging";
export class AutomationDatabase {
    // Automation Jobs
    async createJob(job) {
        try {
            const [created] = await db
                .insert(automationJobsTable)
                .values({
                ...job,
                retryCount: 0,
            })
                .returning();
            logger.info({ jobId: created.id }, "Automation job created");
            return created;
        }
        catch (error) {
            logger.error({ error, job }, "Failed to create automation job");
            throw error;
        }
    }
    async getJobById(jobId) {
        try {
            const [job] = await db
                .select()
                .from(automationJobsTable)
                .where(eq(automationJobsTable.id, jobId))
                .limit(1);
            return job || null;
        }
        catch (error) {
            logger.error({ error, jobId }, "Failed to get automation job");
            throw error;
        }
    }
    async updateJobStatus(jobId, status, metadata) {
        try {
            // If metadata is provided, we need to merge it with existing metadata
            let finalMetadata;
            if (metadata) {
                const [currentJob] = await db
                    .select({ metadata: automationJobsTable.metadata })
                    .from(automationJobsTable)
                    .where(eq(automationJobsTable.id, jobId))
                    .limit(1);
                finalMetadata = { ...(currentJob?.metadata || {}), ...metadata };
            }
            const updateData = {
                status,
                updatedAt: new Date(),
                metadata: finalMetadata,
            };
            if (status === "completed") {
                updateData.processedAt = new Date();
            }
            else if (status === "failed") {
                updateData.failedAt = new Date();
            }
            const [updated] = await db
                .update(automationJobsTable)
                .set(updateData)
                .where(eq(automationJobsTable.id, jobId))
                .returning();
            if (updated) {
                logger.info({ jobId, status }, "Automation job status updated");
            }
            return updated || null;
        }
        catch (error) {
            logger.error({ error, jobId, status }, "Failed to update automation job status");
            throw error;
        }
    }
    async incrementRetryCount(jobId) {
        try {
            const [updated] = await db
                .update(automationJobsTable)
                .set({
                retryCount: sql `${automationJobsTable.retryCount} + 1`,
                updatedAt: new Date(),
            })
                .where(eq(automationJobsTable.id, jobId))
                .returning();
            return updated || null;
        }
        catch (error) {
            logger.error({ error, jobId }, "Failed to increment retry count");
            throw error;
        }
    }
    async getPendingJobs(limit = 10) {
        try {
            const jobs = await db
                .select()
                .from(automationJobsTable)
                .where(eq(automationJobsTable.status, "pending"))
                .orderBy(automationJobsTable.createdAt)
                .limit(limit);
            return jobs;
        }
        catch (error) {
            logger.error({ error }, "Failed to get pending jobs");
            throw error;
        }
    }
    // Communication Logs
    async createCommunicationLog(log) {
        try {
            const [created] = await db
                .insert(communicationLogsTable)
                .values(log)
                .returning();
            logger.info({ logId: created.id }, "Communication log created");
            return created;
        }
        catch (error) {
            logger.error({ error, log }, "Failed to create communication log");
            throw error;
        }
    }
    // Generated Reports
    async createGeneratedReport(report) {
        try {
            const [created] = await db
                .insert(generatedReportsTable)
                .values(report)
                .returning();
            logger.info({ reportId: created.id }, "Generated report created");
            return created;
        }
        catch (error) {
            logger.error({ error, report }, "Failed to create generated report");
            throw error;
        }
    }
    async getMessageDraftById(draftId) {
        try {
            const [draft] = await db
                .select()
                .from(messageDraftsTable)
                .where(eq(messageDraftsTable.id, draftId))
                .limit(1);
            return draft || null;
        }
        catch (error) {
            logger.error({ error, draftId }, "Failed to get message draft");
            throw error;
        }
    }
    // Message Drafts
    async createMessageDraft(draft) {
        try {
            const [created] = await db
                .insert(messageDraftsTable)
                .values(draft)
                .returning();
            logger.info({ draftId: created.id }, "Message draft created");
            return created;
        }
        catch (error) {
            logger.error({ error, draft }, "Failed to create message draft");
            throw error;
        }
    }
    async updateMessageDraftStatus(draftId, status, reviewedBy) {
        try {
            const updateData = {
                status,
                updatedAt: new Date(),
            };
            if (status === "reviewed" && reviewedBy) {
                updateData.reviewedBy = reviewedBy;
                updateData.reviewedAt = new Date();
            }
            else if (status === "sent") {
                updateData.sentAt = new Date();
            }
            const [updated] = await db
                .update(messageDraftsTable)
                .set(updateData)
                .where(eq(messageDraftsTable.id, draftId))
                .returning();
            if (updated) {
                logger.info({ draftId, status }, "Message draft status updated");
            }
            return updated || null;
        }
        catch (error) {
            logger.error({ error, draftId, status }, "Failed to update message draft status");
            throw error;
        }
    }
    // Automation Events
    async createAutomationEvent(event) {
        try {
            const [created] = await db
                .insert(automationEventsTable)
                .values({
                ...event,
                processed: false,
            })
                .returning();
            logger.info({ eventId: created.id, eventType: event.eventType }, "Automation event created");
            return created;
        }
        catch (error) {
            logger.error({ error, event }, "Failed to create automation event");
            throw error;
        }
    }
    async getUnprocessedEvents(limit = 50) {
        try {
            const events = await db
                .select()
                .from(automationEventsTable)
                .where(eq(automationEventsTable.processed, false))
                .orderBy(automationEventsTable.triggeredAt)
                .limit(limit);
            return events;
        }
        catch (error) {
            logger.error({ error }, "Failed to get unprocessed events");
            throw error;
        }
    }
    async markEventProcessed(eventId) {
        try {
            await db
                .update(automationEventsTable)
                .set({
                processed: true,
                processedAt: new Date(),
            })
                .where(eq(automationEventsTable.id, eventId));
            logger.info({ eventId }, "Automation event marked as processed");
        }
        catch (error) {
            logger.error({ error, eventId }, "Failed to mark event as processed");
            throw error;
        }
    }
}
export const automationDb = new AutomationDatabase();
//# sourceMappingURL=index.js.map