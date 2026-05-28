import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  propertyCategory: text("property_category"),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  priceUnit: text("price_unit").notNull().default("INR"),
  city: text("city").notNull(),
  locality: text("locality"),
  address: text("address"),
  area: numeric("area", { precision: 10, scale: 2 }).notNull(),
  areaUnit: text("area_unit").notNull().default("sqft"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  furnishing: text("furnishing"),
  amenities: text("amenities"),
  photos: text("photos"),
  featured: boolean("featured").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  ownerId: text("owner_id"),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
