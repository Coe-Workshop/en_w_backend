import { Request, Response, Router } from "express";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import z from "zod";
import { ReportService } from "../domain/report";
import { CreateReportRequest, UpdateReportStatusRequest } from "@/internal/validator/report.schema";
import { MiddlewareResources } from "@/internal/middleware/auth";
import { UserRole, ReportStatus } from "@/pkg/models";

const makeReportHandler = (reportService: ReportService, middleware: MiddlewareResources) => {
  const router = Router();
  const handler = reportHandler(reportService);

  // Public: Create report (works for both logged-in and anonymous users)
  router.post("/", middleware.reqAuthHandler(), handler.createReport);
  
  // Admin only: List all reports
  router.get("/", middleware.requireRoles(UserRole.ADMIN), handler.getReports);
  
  // Admin only: Update report status
  router.patch("/:id", middleware.requireRoles(UserRole.ADMIN), handler.updateReportStatus);

  return router;
};

const reportHandler = (reportService: ReportService) => ({
  createReport: async (req: Request, res: Response) => {
    try {
      const reqData: CreateReportRequest = CreateReportRequest.parse(req.body);
      
      const report = await reportService.createReport({
        type: reqData.type,
        title: reqData.title,
        description: reqData.description,
        email: reqData.email || null,
        userId: res.locals.id || null,
        status: ReportStatus.PENDING,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: report,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถสร้างรายงานได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  getReports: async (req: Request, res: Response) => {
    try {
      const status = req.query.status as any;
      const type = req.query.type as any;
      
      const filter: any = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      const reports = await reportService.getReports(filter);

      res.status(HttpStatus.OK).json({
        success: true,
        data: reports,
      });
    } catch (err) {
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถดึงข้อมูลรายงานได้ในขณะนี้",
        error: er.message,
      });
    }
  },

  updateReportStatus: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: "ID ไม่ถูกต้อง",
        });
      }

      const reqData: UpdateReportStatusRequest = UpdateReportStatusRequest.parse(req.body);
      
      const report = await reportService.updateReportStatus(id, reqData.status as ReportStatus);

      res.status(HttpStatus.OK).json({
        success: true,
        data: report,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }

      if (err instanceof AppErr && err.code === HttpStatus.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบรายงาน",
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถอัปเดตสถานะรายงานได้ในขณะนี้",
        error: er.message,
      });
    }
  },
});

export default makeReportHandler;