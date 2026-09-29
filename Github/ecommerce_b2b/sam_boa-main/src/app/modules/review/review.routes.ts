import express from "express"
import { ReviewController } from "./review.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.post("/createReview", auth(), ReviewController.addReview)

router.get("/all", ReviewController.getAllReviews)

router.get("/product/:productId", ReviewController.getProductReviews)

router.get("/seller/:sellerId", ReviewController.getSellerReviews)

export const reviewRoutes = router
