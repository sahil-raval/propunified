import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";

const router = Router();

router.get("/me", async (req, res): Promise<void> => {
  try {
    const clerkId = (req as any).auth?.userId ?? null;
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (!user) {
      [user] = await db.insert(usersTable).values({ clerkId }).returning();
    }
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error getting user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", async (req, res): Promise<void> => {
  try {
    const clerkId = (req as any).auth?.userId ?? null;
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const body = UpdateMeBody.parse(req.body);
    const [user] = await db
      .update(usersTable)
      .set(body)
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error updating user");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
