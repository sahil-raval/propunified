import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  sellerId: text("seller_id").notNull(),
  sellerName: text("seller_name"),
  status: text("status").notNull().default("draft"),
  listingType: text("listing_type").notNull(),
  askingPrice: numeric("asking_price", { precision: 15, scale: 2 }),
  description: text("description"),
  documents: text("documents"),
  kycVerified: boolean("kyc_verified").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
