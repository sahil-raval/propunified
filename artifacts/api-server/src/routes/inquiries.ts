import { Router } from "express";
import { db } from "@workspace/db";
import { inquiriesTable, propertiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListInquiriesQueryParams, CreateInquiryBody } from "@workspace/api-zod";

const router = Router();

async function enrichInquiry(inquiry: typeof inquiriesTable.$inferSelect) {
  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, inquiry.propertyId));
  return {
    ...inquiry,
    property: property
      ? { ...property, price: Number(property.price), area: Number(property.area) }
      : null,
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const query = ListInquiriesQueryParams.parse(req.query);
    const conditions = [];
    if (query.propertyId) conditions.push(eq(inquiriesTable.propertyId, query.propertyId));
    if (query.status) conditions.push(eq(inquiriesTable.status, query.status));

    const inquiries = await db
      .select()
      .from(inquiriesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const enriched = await Promise.all(inquiries.map(enrichInquiry));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing inquiries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const body = CreateInquiryBody.parse(req.body);
    const [inquiry] = await db.insert(inquiriesTable).values(body).returning();
    const enriched = await enrichInquiry(inquiry);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error creating inquiry");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
