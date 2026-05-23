import { db, sessionsTable } from "@toppers/db";
import { and, desc, eq, gt, isNull } from "drizzle-orm";

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

  async listActiveForUser(userId: string, limit = 20) {
    return db.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.userId, userId),
        isNull(sessionsTable.revokedAt),
        gt(sessionsTable.expiresAt, new Date()),
      ),
      orderBy: desc(sessionsTable.lastUsedAt),
      limit,
    });
  },
};

