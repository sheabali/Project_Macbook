import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { TProductFilterRequest } from "../products/products.interface";
import { Prisma } from "@prisma/client";
import { productSearchableFields } from "../products/products.constant";

//Get All Products Posted by Seller
const getAllSellerProducts = async (sellerId: string, options: IPaginationOptions, filters: TProductFilterRequest,) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options)
  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  // Only published products
  andConditions.push({ isDraft: false });

  // Only available products
  andConditions.push({ isDeleted: false });

  // 🔍 Search by text fields
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 🎯 Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      setPrice: {
        ...(minPrice !== undefined && { gte: Number(minPrice) }),
        ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
      },
    });
  }

  // 🎯 Specific filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        const value = (filterData as any)[key];

        if (key === "availableSize") {
          return {
            availableSize: {
              has: value,
            },
          };
        }

        return {
          [key]: {
            equals: value,
            mode: "insensitive",
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    skip,
    take: limit,
    where: {
      AND: [
        { userId: sellerId },
        whereConditions,
      ],
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  })
  const total = await prisma.product.count({
    where: {
      AND: [
        { userId: sellerId },
        whereConditions,
      ],
    },
  })
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result
  }
}

// Get all UNSOLD products of a seller
const getAllUnsoldProducts = async (sellerId: string, options: IPaginationOptions, filters: TProductFilterRequest) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options)

  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  // Only published products
  andConditions.push({ isDraft: false });

  // 🔍 Search by text fields
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 🎯 Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      setPrice: {
        ...(minPrice !== undefined && { gte: Number(minPrice) }),
        ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
      },
    });
  }

  // 🎯 Specific filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        const value = (filterData as any)[key];

        if (key === "availableSize") {
          return {
            availableSize: {
              has: value,
            },
          };
        }

        return {
          [key]: {
            equals: value,
            mode: "insensitive",
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    skip,
    take: limit,
    where: { AND: [{ userId: sellerId, orderStatus: { not: "SOLD" } }, whereConditions] },
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });
  const total = await prisma.product.count({
    where: { userId: sellerId, orderStatus: { not: "SOLD" } }
  })
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result
  }
};

// Get all SOLD products of a seller
const getAllSoldProducts = async (sellerId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options)
  const result = await prisma.product.findMany({
    skip,
    take: limit,
    where: {
      userId: sellerId,
      orderStatus: 'SOLD',
      isDeleted: false
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const total = await prisma.product.count({
    where: {
      userId: sellerId,
      orderStatus: 'SOLD',
      isDeleted: false
    }
  })
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result
  }
};

// Soft delete SOLD products of a seller
const softDeleteSoldProduct = async (sellerId: string, productId: string) => {
  await prisma.product.update({
    where: {
      id: productId,
      userId: sellerId,
    },
    data: { isDeleted: true }, // 👈 mark as deleted
  });

  const updatedData = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });
  if (!updatedData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return {
    success: true,
    data: updatedData
  };
};

//Get Product By ID
const getSellerProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return product;
};

//confirm Product And Create Order
const confirmProductAndCreateOrder = async (productId: string, sellerId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.userId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You can't confirm this product");
  }

  if (product.orderStatus === "CONFIRMED") {
    throw new ApiError(httpStatus.CONFLICT, "Product already confirmed");
  }

  // 1. Confirm the product
  await prisma.product.update({
    where: { id: productId },
    data: { orderStatus: "CONFIRMED" },
  });

  // 2. Create order
  const order = await prisma.order.create({
    data: {
      sellerId: product.userId,
      productId: product.id,
      progressStatus: "CONFIRMED",
    },
  });

  return order;
};

// Toggle follow a seller
const followSeller = async (followerId: string, sellerId: string) => {
  if (followerId === sellerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't follow yourself");
  }

  // Ensure the target is a seller
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { role: true },
  });
  if (!seller || seller.role !== "SELLER") {
    throw new ApiError(httpStatus.NOT_FOUND, "Seller not found");
  }

  // Check if already following
  const existingFollow = await prisma.follow.findFirst({
    where: { followerId, followingId: sellerId },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });

    return { isFollowed: false, followed: false };
  } else {
    // Follow
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: sellerId,
      },
    });

    return { isFollowed: true, followed: true, follow };
  }
};

//Followers List
const getSellerFollowers = async (sellerId: string) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: sellerId },
    include: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return followers.map(f => f.follower);
};

//Following List
const getUserFollowing = async (userId: string) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return following.map(f => f.following);
};

//Unfollow a Seller
const unfollowSeller = async (followerId: string, sellerId: string) => {
  const follow = await prisma.follow.findFirst({
    where: {
      followerId,
      followingId: sellerId,
    },
  });
  if (!follow) {
    throw new ApiError(httpStatus.NOT_FOUND, "Follow relation not found");
  }
  await prisma.follow.delete({
    where: {
      id: follow.id,
    },
  });
  return { message: "Successfully unfollowed seller" };
};

// Get Seller Profile with followers, following, and total SOLD items
const getSellerProfile = async (userName: string, userId?: string) => {
  const seller = await prisma.user.findFirst({
    where: { userName: userName },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      profileImage: true,
      role: true,
      Seller: true,

    },
  });
  if (!seller) {
    throw new ApiError(httpStatus.NOT_FOUND, "Seller not found");
  }

  let isFollowing = false;

  if (userId) {
    const followRecord = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: seller.id,
      },
    });

    isFollowing = !!followRecord; // will be true if record exists
  }

  const [followers, following, totalSoldProducts] = await Promise.all([
    prisma.follow.count({
      where: { followingId: seller.id },
    }),
    prisma.follow.count({
      where: { followerId: seller.id },
    }),
    prisma.product.count({
      where: {
        userId: seller.id,
        orderStatus: "SOLD",
      },
    }),
  ]);
  return {
    isFollowing,
    totalFollowers: followers,
    totalFollowing: following,
    totalItemsSold: totalSoldProducts,
    ...seller,
  };
};

// Get Top Sellers of the Week
const getTopSellersOfWeek = async (limit = 5) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const topSellers = await prisma.product.groupBy({
    by: ['userId'],
    where: {
      updatedAt: { gte: oneWeekAgo },
      orderStatus: 'SOLD',
    },
    _count: {
      id: true, // count total SOLD products
    },
    orderBy: {
      _count: {
        id: 'desc', // order by total count of SOLD products
      },
    },
    take: limit,
  });
  const sellerIds = topSellers.map((s) => s.userId);
  const sellers = await prisma.user.findMany({
    where: { id: { in: sellerIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      profileImage: true,
      email: true,
      role: true,
      Seller: {
        select: {
          profileImage: true,
        }
      },
    },
  });

  const result = topSellers.map((s) => {
    const seller = sellers.find((u) => u.id === s.userId);
    return {
      ...seller,
      totalSoldProducts: s._count.id,
    };
  });
  return result;
};

export const sellerService = {
  getAllSellerProducts,
  getAllUnsoldProducts,
  getAllSoldProducts,
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