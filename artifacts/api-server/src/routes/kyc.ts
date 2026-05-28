import { Router } from "express";
import { db } from "@workspace/db";
import { kycTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitKycBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? null;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const [kyc] = await db.select().from(kycTable).where(eq(kycTable.userId, userId));
    if (!kyc) {
      res.status(404).json({ error: "No KYC record found" });
      return;
    }
    res.json(kyc);
  } catch (err) {
    req.log.error({ err }, "Error getting KYC");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? null;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const body = SubmitKycBody.parse(req.body);
    const [existing] = await db.select().from(kycTable).where(eq(kycTable.userId, userId));
    if (existing) {
      const [updated] = await db
        .update(kycTable)
        .set({ ...body, status: "pending" })
        .where(eq(kycTable.userId, userId))
        .returning();
      await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.clerkId, userId));
      res.status(201).json(updated);
      return;
    }
    const [kyc] = await db
      .insert(kycTable)
      .values({ userId, ...body, status: "pending" })
      .returning();
    await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.clerkId, userId));
    res.status(201).json(kyc);
  } catch (err) {
    req.log.error({ err }, "Error submitting KYC");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
