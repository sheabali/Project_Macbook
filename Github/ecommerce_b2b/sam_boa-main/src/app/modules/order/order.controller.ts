import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { orderService } from "./order.service";
import sendResponse from "../../../shared/sendResponse";

const updateOrderDetailsAndStatus = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const updatedData = req.body;
  const result = await orderService.updateOrderDetailsAndStatus(orderId, updatedData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order updated successfully",
    data: result,
  });
});

const getAllSellerOrders = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await orderService.getAllSellerOrders(sellerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Seller orders fetched successfully",
    data: result,
  });
});

const getAllBuyerOrders = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const result = await orderService.getAllBuyerOrders(buyerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order Retrieved successfully",
    data: result,
  });
});

const trackOrderById = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { orderId } = req.params;
  const result = await orderService.trackOrderById(buyerId, orderId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order Details Retrieved successfully",
    data: result,
  });
});

export const orderController = {
  updateOrderDetailsAndStatus,
  getAllSellerOrders,
  getAllBuyerOrders,
  trackOrderById
};