import { Request, Response } from "express"
import { ReviewService } from "./review.service"
import sendResponse from "../../../shared/sendResponse"
import pick from "../../../shared/pick";
import catchAsync from "../../../shared/catchAsync";


const addReview = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const result = await ReviewService.addReview(buyerId, req.body)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review created successfully",
    data: result,
  });
})

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await ReviewService.getAllReviews(options)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review Retrieved successfully",
    data: result,
  });
})

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params
  const result = await ReviewService.getReviewsForProduct(productId)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review Retrieved successfully",
    data: result,
  });
});

const getSellerReviews = catchAsync(async (req: Request, res: Response) => {
  const { sellerId } = req.params
  const result = await ReviewService.getReviewsForSeller(sellerId)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review Retrieved successfully",
    data: result,
  });
})

export const ReviewController = {
  addReview,
  getAllReviews,
  getProductReviews,
  getSellerReviews
}
