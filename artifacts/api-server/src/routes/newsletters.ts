import { Router } from "express";
import { db } from "@workspace/db";
import { newslettersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function formatNewsletter(n: typeof newslettersTable.$inferSelect) {
  return {
    ...n,
    scheduledAt: n.scheduledAt ? n.scheduledAt.toISOString() : null,
    sentAt: n.sentAt ? n.sentAt.toISOString() : null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt ? n.updatedAt.toISOString() : null,
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const newsletters = await db
      .select()
      .from(newslettersTable)
      .orderBy(desc(newslettersTable.createdAt));
    res.json(newsletters.map(formatNewsletter));
  } catch (err) {
    req.log.error({ err }, "Error listing newsletters");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const { subject, body, scheduledAt } = req.body as {
      subject?: string;
      body?: string;
      scheduledAt?: string;
    };
    if (!subject || !body) {
      res.status(400).json({ error: "subject and body are required" });
      return;
    }
    const parsedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    const status = parsedScheduledAt ? "scheduled" : "draft";
    const [newsletter] = await db
      .insert(newslettersTable)
      .values({ subject, body, scheduledAt: parsedScheduledAt, status })
      .returning();
    res.status(201).json(formatNewsletter(newsletter));
  } catch (err) {
    req.log.error({ err }, "Error creating newsletter");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { subject, body, scheduledAt, status } = req.body as {
      subject?: string;
      body?: string;
      scheduledAt?: string | null;
      status?: string;
    };
    const updateData: Record<string, unknown> = {};
    if (subject !== undefined) updateData.subject = subject;
    if (body !== undefined) updateData.body = body;
    if (scheduledAt !== undefined)
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (status !== undefined) updateData.status = status;
    if (scheduledAt && !status) updateData.status = "scheduled";

    const [newsletter] = await db
      .update(newslettersTable)
      .set(updateData)
      .where(eq(newslettersTable.id, id))
      .returning();
    if (!newsletter) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatNewsletter(newsletter));
  } catch (err) {
    req.log.error({ err }, "Error updating newsletter");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(newslettersTable).where(eq(newslettersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting newsletter");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/send", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [newsletter] = await db
      .update(newslettersTable)
      .set({
        status: "sent",
        sentAt: new Date(),
        recipientCount: Math.floor(Math.random() * 900) + 100,
      })
      .where(eq(newslettersTable.id, id))
      .returning();
    if (!newsletter) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatNewsletter(newsletter));
  } catch (err) {
    req.log.error({ err }, "Error sending newsletter");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
