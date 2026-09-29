import { Request, Response } from 'express';
import { AdminService } from './Admin.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';

const approveSeller = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await AdminService.approveSeller(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Security approved!",
    data: result,
  });
})

const declineSellerController = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await AdminService.declineSeller(userId);

  res.status(200).json({
    success: true,
    message: "Security profile declined successfully",
    data: result,
  });
});

const getTotalUsersController = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getTotalUsers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Total users fetched",
    data: result,
  });
});

const dashboardStatsController = async (req: Request, res: Response) => {
  const data = await AdminService.getDashboardStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin dashboard data fetched successfully',
    data,
  });
};

// Promo Controllers
export const createPromo = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createPromo(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Promo created successfully",
    data: result,
  });
});

const updatePromo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updatePromo(id, req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo updated",
    data: result,
  });
});

const getPromos = catchAsync(async (req, res) => {
  const result = await AdminService.getPromos();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All promos",
    data: result,
  });
});

const deletePromo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deletePromo(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo deleted",
    data: result,
  });
});

const createBanner = catchAsync(async (req, res) => {
  const result = await AdminService.createBanner(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Banner created",
    data: result,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updateBanner(id, req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner updated",
    data: result,
  });
});

const getBanners = catchAsync(async (req, res) => {
  const result = await AdminService.getBanners();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All banners",
    data: result,
  });
});

const getPromoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.getPromoById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo fetched",
    data: result,
  });
});

const getBannerById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.getBannerById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner fetched",
    data: result,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deleteBanner(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner deleted",
    data: result,
  });
});

export const AdminController = {
  approveSeller,
  declineSellerController,
  getTotalUsersController,
  dashboardStatsController,
  createPromo,
  updatePromo,
  getPromos,
  getPromoById,
  deletePromo,
  createBanner,
  updateBanner,
  getBanners,
  getBannerById,
  deleteBanner

};
