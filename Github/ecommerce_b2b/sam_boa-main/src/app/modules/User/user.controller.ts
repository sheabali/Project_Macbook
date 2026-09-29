import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";

//Create User
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDb(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered successfully!",
    data: result,
  });
});

// get all user form db
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await userService.getUsersFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

//Get Al sellers
const getAllSellersController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.getAllSellers();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sellers fetched successfully",
      data: result,
    });
  }
);

//Get Seller Request
const getSellerRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getSellerRequests();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pending sellers retrieved successfully',
    data: result,
  });
});

const getSingleUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.getSingleUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
})

// get all user form db
const updateProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req?.user;
  const result = await userService.updateProfile(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully!",
    data: result,
  });
});


// *! update user role and account status
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.updateUserIntoDb(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const uploadPhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.uploadPhoto(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photo uploaded successfully!",
    data: result,
  });
});


export const userController = {
  createUser,
  getUsers,
  getSellerRequests,
  getAllSellersController,
  getSingleUserById,
  updateProfile,
  updateUser,
  uploadPhoto,
};
