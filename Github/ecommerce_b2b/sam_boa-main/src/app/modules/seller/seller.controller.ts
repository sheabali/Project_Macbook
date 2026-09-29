import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { sellerService } from "./seller.service";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { productFilterableFields } from "../products/products.constant";

const getAllSellerProducts = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const filters = pick(req.query, productFilterableFields);
  const result = await sellerService.getAllSellerProducts(sellerId, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller's Product Retrieve successfully!",
    data: result,
  });
})

const getAllSoldProducts = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await sellerService.getAllSoldProducts(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All sold products fetched successfully",
    data: result,
  });
});

const softDeleteSoldProduct = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const { productId } = req.params;
  const result = await sellerService.softDeleteSoldProduct(sellerId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const getAllUnsoldProducts = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const filters = pick(req.query, productFilterableFields);
  const result = await sellerService.getAllUnsoldProducts(sellerId, options, filters);;
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All unsold products fetched successfully",
    data: result,
  });
});

export const getSellerProductById = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const result = await sellerService.getSellerProductById(productId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// Confirm product & create order
const confirmProductAndCreateOrder = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const sellerId = req.user.id;
  const result = await sellerService.confirmProductAndCreateOrder(productId, sellerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product confirmed and order created",
    data: result,
  });
});

//followSeller
const followSeller = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user.id;
  const sellerId = req.params.sellerId;
  const result = await sellerService.followSeller(followerId, sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully followed the seller",
    data: result,
  });
});

//Get Followers of a Seller
const getSellerFollowers = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await sellerService.getSellerFollowers(sellerId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Followers fetched successfully",
    data: result,
  });
});

//Get Users Followed by a Buyer/User
const getUserFollowing = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await sellerService.getUserFollowing(userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Following list fetched successfully",
    data: result,
  });
});

// 📌 Unfollow a Seller
const unfollowSeller = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user.id;
  const sellerId = req.params.sellerId;
  const result = await sellerService.unfollowSeller(followerId, sellerId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Unfollowed successfully",
    data: result,
  });
});

const getSellerProfile = catchAsync(async (req: Request, res: Response) => {
  const { userName } = req.params;
  const userId = req.user?.id ?? null
  const result = await sellerService.getSellerProfile(userName, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller profile retrieved successfully",
    data: result,
  });
});

const getTopSellersOfWeek = catchAsync(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const result = await sellerService.getTopSellersOfWeek(limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Top sellers of the week retrieved successfully",
      data: result,
    });
  }
);

export const sellerController = {
  getAllSellerProducts,
  getAllSoldProducts,
  getAllUnsoldProducts,
  softDeleteSoldProduct,
  getSellerProductById,
  confirmProductAndCreateOrder,
  followSeller,
  getSellerFollowers,
  getUserFollowing,
  unfollowSeller,
  getSellerProfile,
  getTopSellersOfWeek
};