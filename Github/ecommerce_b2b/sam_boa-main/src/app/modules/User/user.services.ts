import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma, User, UserRole } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { generateUsername } from "../../../helpars/generateUsername";

// Create a new user in the database.
const createUserIntoDb = async (req: Request) => {
  const file = req.file;
  const stringData = req.body.data;
  let imageUrl: string | undefined;
  let data;

  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Form data missing");
  }

  try {
    data = JSON.parse(stringData);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON in form data");
  }
  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new ApiError(
        400,
        `User with this email ${data.email} already exists`
      );
    }
  }
  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.bcrypt_salt_rounds)
  );
  // Generate unique username
  const uniqueUsername = await generateUsername(data.firstName, data.lastName);

  if (file) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    imageUrl = uploadResult.Location;
  }

  const result = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      userName: uniqueUsername,
      city: data.city,
      region: data.region,
      area: data.area,
      role: data.role,
      profileImage: imageUrl,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!result) { throw new ApiError(404, "User Not Found") }

  // Create Buyer or Seller based on role
  if (result.role === "BUYER") {
    await prisma.buyer.create({
      data: {
        userId: result.id,
        category: data.category,
        interests: data.interests,
        brands: data.brands,
        shoeSize: data.shoeSize,
        topSize: data.topSize,
        skirtSize: data.skirtSize,
      },
    });
  }

  if (result.role === "SELLER") {

    await prisma.seller.create({
      data: {
        userId: result.id,
        shopName: data.shopName,
        phoneNumber: data.phoneNumber,
        serviceProvider: data.serviceProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
        registerdNameFormobileMoneyNumber: data.registerdNameFormobileMoneyNumber,
        facebook: data.facebook,
        twitter: data.twitter,
        instagram: data.instagram,
        snapchat: data.snapchat,
        tiktok: data.tiktok,
        bio: data.bio,
        profileImage: data.profileImage
      },
    });
  }

  const token = jwtHelpers.generateToken(
    {
      id: result.id,
      email: result.email,
      role: result.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { result, token };
};

// reterive all users from the database also searcing anf filetering
const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  // 🔹 Automatically set users inactive if not logged in for 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  await prisma.user.updateMany({
    where: {
      lastLoginAt: { lt: threeMonthsAgo },
      status: 'ACTIVE',
    },
    data: { status: 'INACTIVE' },
  });

  const andCondions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditons: Prisma.UserWhereInput = { AND: andCondions };

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
          [options.sortBy]: options.sortOrder,
        }
        : {
          createdAt: "desc",
        },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      profileImage: true,
      role: true,
      Buyer: true,
      Seller: true,
      createdAt: true,
      updatedAt: true
    },
  });
  const total = await prisma.user.count({
    where: whereConditons,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No active users found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Get all Sellers with status 'PENDING'
const getSellerRequests = async () => {
  const sellers = await prisma.seller.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userName: true,
          profileImage: true,
          region: true,
          area: true,
          city: true,
          createdAt: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return sellers;
};

//Get All Sellers
const getAllSellers = async () => {
  const sellers = await prisma.user.findMany({
    where: {
      role: "SELLER",
      Seller: {
        approved: true,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      region: true,
      area: true,
      city: true,
      profileImage: true,
      status: true,
      createdAt: true,
      Seller: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sellers;
};

// Get a single user by id
const getSingleUserById = async (id: string) => {
  const seller = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      Seller: true,
    },
  });
  return seller;
};

// update profile by user own profile uisng token or email and id
const updateProfile = async (req: Request) => {
  console.log(req.file, req.body.data);
  const file = req.file;
  const stringData = req.body.data;
  let image;
  let parseData;
  const existingUser = await prisma.user.findFirst({
    where: {
      id: req.user.id,
    },
  });
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }
  if (file) {
    image = (await fileUploader.uploadToDigitalOcean(file)).Location;
  }
  if (stringData) {
    parseData = JSON.parse(stringData);
  }
  const result = await prisma.user.update({
    where: {
      id: existingUser.id, // Ensure `existingUser.id` is valid and exists
    },
    data: {
      firstName: parseData.firstName || existingUser.firstName,
      lastName: parseData.lastName || existingUser.lastName,
      email: parseData.email || existingUser.email,
      city: parseData.city || existingUser.city,
      area: parseData.area || existingUser.area,
      region: parseData.region || existingUser.region,
      profileImage: image || existingUser.profileImage,
      updatedAt: new Date(), // Assuming your model has an `updatedAt` field
    },
  });
  if (result.role === "BUYER") {
    await prisma.buyer.update({
      where: { userId: result.id },
      data: {
        category: parseData.category,
        interests: parseData.interests,
        brands: parseData.brands,
        shoeSize: parseData.shoeSize,
        topSize: parseData.topSize,
        skirtSize: parseData.skirtSize,
      },
    });
  }
  if (result.role === "SELLER") {
    await prisma.seller.update({
      where: { userId: result.id },
      data: {
        bio: parseData.bio,
        shopName: parseData.shopName,
        phoneNumber: parseData.phoneNumber,
        mobileMoneyNumber: parseData.mobileMoneyNumber,
        serviceProvider: parseData.serviceProvider,
        registerdNameFormobileMoneyNumber: parseData.registerdNameFormobileMoneyNumber,
        facebook: parseData.facebook,
        twitter: parseData.twitter,
        instagram: parseData.instagram,
        snapchat: parseData.snapchat,
        tiktok: parseData.tiktok,
        profileImage: image || existingUser.profileImage
      },
    });
  }
  const resultFinal = await prisma.user.findFirst({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      profileImage: true,
      role: true,
      Buyer: true,
      Seller: true
    },
  });
  if (!resultFinal) throw new ApiError(400, "Profile update failed");

  return resultFinal;
};

// update user data into database by id ---> first admin
const updateUserIntoDb = async (payload: IUser, id: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);

  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: payload,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      profileImage: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    );

  return result;
};

// upload user photo
const uploadPhoto = async (req: Request) => {
  const file = req.file;
  let imageUrl;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  }
  const uploadResult = await fileUploader.uploadToDigitalOcean(file);
  imageUrl = uploadResult.Location;

  return imageUrl;
}

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  getSellerRequests,
  getAllSellers,
  getSingleUserById,
  updateProfile,
  updateUserIntoDb,
  uploadPhoto,
};
