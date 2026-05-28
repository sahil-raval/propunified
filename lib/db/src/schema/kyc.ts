import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycTable = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  fullName: text("full_name"),
  panNumber: text("pan_number"),
  aadhaarNumber: text("aadhaar_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  phone: text("phone"),
  email: text("email"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertKycSchema = createInsertSchema(kycTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type KycRecord = typeof kycTable.$inferSelect;
