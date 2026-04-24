import { pgEnum, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.db";

export enum ReportType {
  BUG = "BUG",
  FEATURE = "FEATURE",
  FEEDBACK = "FEEDBACK",
}

export enum ReportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export const reportType = pgEnum("report_type", ["BUG", "FEATURE", "FEEDBACK"]);
export const reportStatus = pgEnum("report_status", ["PENDING", "IN_PROGRESS", "RESOLVED"]);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: reportType("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  email: text("email"),
  userId: uuid("user_id").references(() => users.id),
  status: reportStatus("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at", { precision: 6, mode: "date" }).defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;