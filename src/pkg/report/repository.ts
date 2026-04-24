import { eq, and } from "drizzle-orm";
import { ReportRepository } from "../domain/report";
import { reports, Report, NewReport, ReportStatus, ReportType } from "../models";
import { DBTransaction } from "@/config/drizzle";

const makeReportRepository = (): ReportRepository => ({
  createReport: async (db, report) => {
    const result = await db.insert(reports).values(report).returning();
    return result[0];
  },

  getReports: async (db, filter) => {
    const conditions = [];
    
    if (filter?.status) {
      conditions.push(eq(reports.status, filter.status));
    }
    
    if (filter?.type) {
      conditions.push(eq(reports.type, filter.type));
    }
    
    const result = await db
      .select()
      .from(reports)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(reports.createdAt);
    
    return result;
  },

  getReportByID: async (db, id) => {
    const result = await db.select().from(reports).where(eq(reports.id, id));
    return result[0] || null;
  },

  updateReportStatus: async (db, id, status) => {
    const result = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return result[0];
  },
});

export default makeReportRepository;