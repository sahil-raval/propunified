import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, listingsTable, inquiriesTable, usersTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res): Promise<void> => {
  try {
    const [propCount] = await db.select({ count: count() }).from(propertiesTable);
    const [listingCount] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.status, "active"));
    const [inquiryCount] = await db.select({ count: count() }).from(inquiriesTable);
    const [userCount] = await db.select({ count: count() }).from(usersTable);

    const byType = await db
      .select({ type: propertiesTable.type, count: count() })
      .from(propertiesTable)
      .groupBy(propertiesTable.type);

    const byStatus = await db
      .select({ status: listingsTable.status, count: count() })
      .from(listingsTable)
      .groupBy(listingsTable.status);

    const recentProperties = await db
      .select()
      .from(propertiesTable)
      .limit(5);

    res.json({
      totalProperties: propCount.count,
      activeListings: listingCount.count,
      totalInquiries: inquiryCount.count,
      totalUsers: userCount.count,
      propertiesByType: byType.map(r => ({ label: r.type, count: r.count })),
      listingsByStatus: byStatus.map(r => ({ label: r.status, count: r.count })),
      recentProperties: recentProperties.map(p => ({
        ...p,
        price: Number(p.price),
        area: Number(p.area),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pipeline", async (req, res): Promise<void> => {
  try {
    const stages = [
      { stage: "Open Appraisals", status: "draft", color: "#7C3AED" },
      { stage: "Pending KYC", status: "pending_kyc", color: "#D97706" },
      { stage: "Active Listings", status: "active", color: "#059669" },
      { stage: "Sold", status: "sold", color: "#DC2626" },
      { stage: "Rented", status: "rented", color: "#2563EB" },
    ];

    const pipeline = await Promise.all(
      stages.map(async (s) => {
        const [result] = await db
          .select({ count: count(), totalValue: sql<number>`COALESCE(SUM(CAST(asking_price AS NUMERIC)), 0)` })
          .from(listingsTable)
          .where(eq(listingsTable.status, s.status));
        return {
          stage: s.stage,
          count: result.count,
          value: Number(result.totalValue ?? 0),
          color: s.color,
        };
      })
    );

    res.json(pipeline);
  } catch (err) {
    req.log.error({ err }, "Error getting pipeline");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
