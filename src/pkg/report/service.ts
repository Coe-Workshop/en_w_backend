import { DB } from "@/config/drizzle";
import { ReportService, ReportFilter } from "../domain/report";
import { ReportRepository } from "../domain/report";
import { NewReport, Report, ReportStatus } from "../models";

const makeReportService = (db: DB, reportRepository: ReportRepository): ReportService => ({
  createReport: async (report: NewReport) => {
    return await db.transaction(async (tx) => {
      return await reportRepository.createReport(tx, report);
    });
  },

  getReports: async (filter?: ReportFilter) => {
    return await db.transaction(async (tx) => {
      return await reportRepository.getReports(tx, filter);
    });
  },

  getReportByID: async (id: number) => {
    return await db.transaction(async (tx) => {
      return await reportRepository.getReportByID(tx, id);
    });
  },

  updateReportStatus: async (id: number, status: ReportStatus) => {
    return await db.transaction(async (tx) => {
      return await reportRepository.updateReportStatus(tx, id, status);
    });
  },
});

export default makeReportService;