import express from "express"
import { ReportController } from "./report.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.post("/reportSeller", auth(UserRole.BUYER), ReportController.reportUser)

router.get("/getAllReports", auth(UserRole.ADMIN), ReportController.getAllReports)

router.get("/getReport/:reportId", ReportController.getSingleReport);

router.post("/takeAction/:reportedUserId/action", auth(UserRole.ADMIN), ReportController.takeAction)

export const ReportRoutes = router
