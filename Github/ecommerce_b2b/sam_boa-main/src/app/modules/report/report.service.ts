import { UserStatus } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

//Create Report
const createReport = async (
  reporterId: string,
  reportedUserId: string,
  reportReason: string,
  description: string
) => {
  if (reporterId === reportedUserId) {
    throw new Error("You can't report yourself")
  }
  return prisma.report.create({
    data: {
      reporterId,
      reportedUserId,
      reportReason,
      description,
    },
  })
}

//getAllReports
const getAllReports = async () => {
  return prisma.report.findMany({
    include: {
      reporter: {
        select: { id: true, firstName: true, lastName: true, userName: true, email: true, profileImage: true },
      },
      reported: {
        select: { id: true, firstName: true, lastName: true, userName: true, email: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// getSingleReport
const getSingleReport = async (reportId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: { id: true, firstName: true, lastName: true, userName: true, email: true, profileImage: true },
      },
      reported: {
        select: { id: true, firstName: true, lastName: true, userName: true, email: true, profileImage: true },
      },
    },
  });
  if (!report) {
    throw new ApiError(401, "Report not found");
  }
  return report;
};

//take Action by Admin
const takeAction = async (
  userId: string,
  action: "WARN" | "TEMP_BLOCK" | "PERM_BLOCK"
) => {
  if (action === "WARN") {
    // Here you can send email or notification logic if needed
    return { message: "Warning sent" };
  }

  let status: UserStatus = UserStatus.ACTIVE;
  let suspendedUntil: Date | null = null;

  if (action === "TEMP_BLOCK") {
    status = UserStatus.SUSPENDED;
    const now = new Date();
    suspendedUntil = new Date(now.setDate(now.getDate() + 7)); // 7 days suspension
  }

  if (action === "PERM_BLOCK") {
    status = UserStatus.BLOCKED;
    suspendedUntil = null; // not needed
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { status, suspendedUntil },
  });

  return {
    message: `${action} applied to user`,
    user,
  };
};


export const ReportService = {
  createReport,
  getAllReports,
  getSingleReport,
  takeAction
}
