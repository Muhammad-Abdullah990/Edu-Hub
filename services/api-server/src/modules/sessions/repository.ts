import { db, sessionsTable } from "@toppers/db";
import { and, eq, gt, isNull } from "drizzle-orm";

export const sessionsRepository = {
  async create(input: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    await db.insert(sessionsTable).values(input);
  },

  async findById(sessionId: string) {
    return db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.id, sessionId),
    });
  },

  async rotate(sessionId: string, refreshTokenHash: string, expiresAt: Date) {
    await db
      .update(sessionsTable)
      .set({
        refreshTokenHash,
        expiresAt,
        lastUsedAt: new Date(),
      })
      .where(eq(sessionsTable.id, sessionId));
  },

  async revoke(sessionId: string) {
    await db
      .update(sessionsTable)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(sessionsTable.id, sessionId));
  },

  async revokeAllForUser(userId: string) {
    await db
      .update(sessionsTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessionsTable.userId, userId), isNull(sessionsTable.revokedAt)));
  },

  async findActiveById(sessionId: string) {
    return db.query.sessionsTable.findFirst({
      where: and(
        eq(sessionsTable.id, sessionId),
        isNull(sessionsTable.revokedAt),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    });
  },
};
