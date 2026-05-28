import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql, desc } from "drizzle-orm";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  UpdatePropertyBody,
} from "@workspace/api-zod";

const router = Router();

function formatProperty(p: typeof propertiesTable.$inferSelect) {
  return {
    ...p,
    price: Number(p.price),
    area: Number(p.area),
    isPremium: p.isPremium ?? false,
    premiumUntil: p.premiumUntil ? p.premiumUntil.toISOString() : null,
  };
}

// Premium-first sort expression: active premium properties bubble to top
const premiumSortExpr = sql<number>`CASE WHEN ${propertiesTable.isPremium} = true AND (${propertiesTable.premiumUntil} IS NULL OR ${propertiesTable.premiumUntil} > NOW()) THEN 0 ELSE 1 END`;

router.get("/", async (req, res): Promise<void> => {
  try {
    const query = ListPropertiesQueryParams.parse(req.query);
    const conditions = [];

    if (query.type) conditions.push(eq(propertiesTable.type, query.type));
    if (query.city) conditions.push(ilike(propertiesTable.city, `%${query.city}%`));
    if (query.minPrice) conditions.push(gte(propertiesTable.price, String(query.minPrice)));
    if (query.maxPrice) conditions.push(lte(propertiesTable.price, String(query.maxPrice)));
    if (query.bedrooms) conditions.push(eq(propertiesTable.bedrooms, query.bedrooms));
    if (query.propertyCategory) conditions.push(eq(propertiesTable.propertyCategory, query.propertyCategory));
    if (query.search) conditions.push(ilike(propertiesTable.title, `%${query.search}%`));
    if (query.featured !== undefined) conditions.push(eq(propertiesTable.featured, query.featured));

    const properties = await db
      .select()
      .from(propertiesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(premiumSortExpr, desc(propertiesTable.createdAt))
      .limit(query.limit ?? 20)
      .offset(query.offset ?? 0);

    res.json(properties.map(formatProperty));
  } catch (err) {
    req.log.error({ err }, "Error listing properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const body = CreatePropertyBody.parse(req.body);
    const [property] = await db
      .insert(propertiesTable)
      .values({
        ...body,
        price: String(body.price),
        area: String(body.area),
      })
      .returning();
    res.status(201).json(formatProperty(property));
  } catch (err) {
    req.log.error({ err }, "Error creating property");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/featured", async (req, res): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(and(eq(propertiesTable.featured, true), eq(propertiesTable.status, "active")))
      .orderBy(premiumSortExpr, desc(propertiesTable.createdAt))
      .limit(limit);
    res.json(properties.map(formatProperty));
  } catch (err) {
    req.log.error({ err }, "Error fetching featured properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [property] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, id));
    if (!property) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatProperty(property));
  } catch (err) {
    req.log.error({ err }, "Error getting property");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const body = UpdatePropertyBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.area !== undefined) updateData.area = String(body.area);
    const [property] = await db
      .update(propertiesTable)
      .set(updateData)
      .where(eq(propertiesTable.id, id))
      .returning();
    if (!property) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatProperty(property));
  } catch (err) {
    req.log.error({ err }, "Error updating property");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting property");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
