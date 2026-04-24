import { DBTransaction } from "@/config/drizzle";
import { Report, NewReport, ReportType, ReportStatus } from "../models";

export interface ReportFilter {
  status?: ReportStatus;
  type?: ReportType;
}

export interface ReportService {
  createReport: (report: NewReport) => Promise<Report>;
  getReports: (filter?: ReportFilter) => Promise<Report[]>;
  getReportByID: (id: number) => Promise<Report | null>;
  updateReportStatus: (id: number, status: ReportStatus) => Promise<Report>;
}

export interface ReportRepository {
  createReport: (db: DBTransaction, report: NewReport) => Promise<Report>;
  getReports: (db: DBTransaction, filter?: ReportFilter) => Promise<Report[]>;
  getReportByID: (db: DBTransaction, id: number) => Promise<Report | null>;
  updateReportStatus: (db: DBTransaction, id: number, status: ReportStatus) => Promise<Report>;
}