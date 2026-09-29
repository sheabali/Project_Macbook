import { Request, Response } from "express"
import { ReportService } from "./report.service"
import sendResponse from "../../../shared/sendResponse"
import catchAsync from "../../../shared/catchAsync"

// Report seller
const reportUser = catchAsync(async (req: Request, res: Response) => {
  const reporter = req.user.id
  const { reportedUserId, reportReason, description } = req.body
  const result = await ReportService.createReport(reporter, reportedUserId, reportReason, description)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Done successfully",
    data: result,
  });
});

// Admin: View all reports
const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getAllReports()
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report Retrieved successfully",
    data: result,
  });
})

// 👉 Get Single Report
const getSingleReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const result = await ReportService.getSingleReport(reportId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report retrieved successfully",
    data: result,
  });
});

// Admin: Take action on report
const takeAction = catchAsync(async (req: Request, res: Response) => {
  const { reportedUserId } = req.params
  const { action } = req.body
  const result = await ReportService.takeAction(reportedUserId, action)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Action Done successfully",
    data: result,
  });
});

export const ReportController = {
  reportUser,
  getAllReports,
  getSingleReport,
  takeAction
}
