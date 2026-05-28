import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, propertiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListListingsQueryParams,
  CreateListingBody,
  UpdateListingBody,
} from "@workspace/api-zod";

const router = Router();

async function enrichListing(listing: typeof listingsTable.$inferSelect) {
  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, listing.propertyId));
  return {
    ...listing,
    askingPrice: listing.askingPrice ? Number(listing.askingPrice) : null,
    isPremium: listing.isPremium ?? false,
    premiumUntil: listing.premiumUntil ? listing.premiumUntil.toISOString() : null,
    property: property
      ? { ...property, price: Number(property.price), area: Number(property.area) }
      : null,
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const query = ListListingsQueryParams.parse(req.query);
    const conditions = [];
    if (query.status) conditions.push(eq(listingsTable.status, query.status));

    const listings = await db
      .select()
      .from(listingsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const enriched = await Promise.all(listings.map(enrichListing));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const body = CreateListingBody.parse(req.body);
    const sellerId = (req as any).auth?.userId ?? "anonymous";

    // Auto-set premiumUntil if isPremium is requested
    const isPremium = (body as any).isPremium === true;
    const premiumUntil = isPremium ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;

    const [listing] = await db
      .insert(listingsTable)
      .values({
        ...body,
        sellerId,
        askingPrice: body.askingPrice ? String(body.askingPrice) : null,
        isPremium,
        premiumUntil,
      })
      .returning();

    // Mirror premium flag on associated property
    if (isPremium) {
      await db.update(propertiesTable)
        .set({ isPremium: true, premiumUntil })
        .where(eq(propertiesTable.id, listing.propertyId));
    }

    const enriched = await enrichListing(listing);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error creating listing");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, id));
    if (!listing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const enriched = await enrichListing(listing);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error getting listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const body = UpdateListingBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.askingPrice !== undefined) updateData.askingPrice = String(body.askingPrice);

    // Handle premium toggle
    const isPremiumSet = (body as any).isPremium;
    if (isPremiumSet === true) {
      updateData.isPremium = true;
      updateData.premiumUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    } else if (isPremiumSet === false) {
      updateData.isPremium = false;
      updateData.premiumUntil = null;
    }

    const [listing] = await db
      .update(listingsTable)
      .set(updateData)
      .where(eq(listingsTable.id, id))
      .returning();
    if (!listing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Mirror premium flag on associated property
    if (isPremiumSet !== undefined) {
      await db.update(propertiesTable)
        .set({
          isPremium: isPremiumSet === true,
          premiumUntil: isPremiumSet === true
            ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            : null,
        })
        .where(eq(propertiesTable.id, listing.propertyId));
    }

    const enriched = await enrichListing(listing);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error updating listing");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
