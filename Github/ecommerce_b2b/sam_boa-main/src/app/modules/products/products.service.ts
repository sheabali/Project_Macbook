import prisma from "../../../shared/prisma"
import { TProductFilterRequest } from "./products.interface"
import ApiError from "../../../errors/ApiErrors"
import httpStatus from "http-status"
import { Request } from "express"
import { fileUploader } from "../../../helpars/fileUploader"
import { IPaginationOptions } from "../../../interfaces/paginations"
import { paginationHelper } from "../../../helpars/paginationHelper"
import { Prisma, Product, UserStatus } from "@prisma/client"
import { productSearchableFields } from "./products.constant"

//Create Products
const createProduct = async (req: Request) => {
  const sellerId = req.user.id;
  if (!sellerId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access: no user ID found');
  }

  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user || user.role !== 'SELLER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only sellers can create products');
  }

  const sellerProfile = await prisma.seller.findUnique({ where: { userId: sellerId } });
  if (!sellerProfile) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Seller profile not found');
  }

  if (sellerProfile.status !== "APPROVED") {
    throw new ApiError(httpStatus.FORBIDDEN, 'Profile is not approved yet, Please wait for approval before creating products');
  }

  // // ✅ Check Subscription Before Allowing Product Post
  // const userSubscription = await prisma.userSubscription.findFirst({
  //   where: {
  //     userId: sellerId,
  //     status: 'ACTIVE',
  //     paymentStatus: 'PAID',
  //     endDate: { gte: new Date() }, // Make sure it's still valid
  //   },
  //   include: {
  //     subscriptionOffer: {
  //       select: { planType: true },
  //     },
  //   },
  // });

  // if (!userSubscription) {
  //   throw new ApiError(httpStatus.FORBIDDEN, "No active subscription found. Please subscribe to post products.");
  // }

  // const currentPostCount = await prisma.product.count({
  //   where: { userId: sellerId },
  // });

  // const plan = userSubscription.subscriptionOffer.planType?.toLowerCase();

  // if (plan === 'basic' && currentPostCount >= 2) {
  //   throw new ApiError(httpStatus.FORBIDDEN, "Basic plan allows only 2 product posts");
  // }

  // if (plan === 'standard' && currentPostCount >= 10) {
  //   throw new ApiError(httpStatus.FORBIDDEN, "Standard plan allows only 10 product posts");
  // }

  const files = req.files as any;
  if (!files) {
    throw new ApiError(400, "Not found");
  }

  const stringData = req.body.data;
  if (!stringData) throw new ApiError(httpStatus.BAD_REQUEST, 'Product data is required');

  const parseData = JSON.parse(stringData);

  // ✅ Upload main image
  let mainImage: string = "";
  if (files?.mainImage && files.mainImage.length > 0) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(files.mainImage[0]);
    mainImage = uploadResult.Location;
  }

  // ✅ Upload sub images
  let subImages: string[] = [];
  if (files?.subImages && files.subImages.length > 0) {
    const uploadResults = await Promise.all(
      files.subImages.map((file: any) => fileUploader.uploadToDigitalOcean(file))
    );
    subImages = uploadResults.map((res: any) => res.Location);
  }

  // ✅ Ensure numeric types
  parseData.setPrice = parseFloat(parseData.setPrice);
  parseData.setDiscount = parseFloat(parseData.setDiscount || "0");

  // ✅ Calculate discounted price accurately
  let discountedPrice = parseData.setPrice;

  if (!isNaN(parseData.setDiscount) && parseData.setDiscount > 0) {
    const discountAmount = (parseData.setPrice * parseData.setDiscount) / 100;
    discountedPrice = parseData.setPrice - discountAmount;
  }

  // ✅ Step 1: Proper rounding (numeric precision)
  discountedPrice = Math.round((discountedPrice + Number.EPSILON) * 100) / 100;

  // ✅ Step 2: Ensure fixed 2-decimal output (string format)
  discountedPrice = Number(discountedPrice.toFixed(2));

  // ✅ Create product
  const product = await prisma.product.create({
    data: {
      ...parseData,
      userId: user.id,
      mainImage,
      subImages,
      discoutedPrice: discountedPrice,
    },
  });

  return product;
};

//Save Product As Draft
const saveProductAsDraft = async (req: Request) => {
  const sellerId = req.user.id;
  if (!sellerId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access: no user ID found');
  }

  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user || user.role !== 'SELLER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only sellers can save drafts');
  }

  const sellerProfile = await prisma.seller.findUnique({ where: { userId: sellerId } });
  if (!sellerProfile) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Seller profile not found');
  }

  if (sellerProfile.status !== "APPROVED") {
    throw new ApiError(httpStatus.FORBIDDEN, 'Profile is not approved yet, Please wait for approval before creating products');
  }

  const files = req.files as any;
  const stringData = req.body.data;
  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product data is required');
  }

  const parseData = JSON.parse(stringData);

  let mainImage: string = "";
  if (files?.mainImage && files.mainImage.length > 0) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(files.mainImage[0]);
    mainImage = uploadResult.Location;
  }

  let subImages: string[] = [];
  if (files?.subImages && files.subImages.length > 0) {
    const uploadResults = await Promise.all(
      files.subImages.map((file: any) => fileUploader.uploadToDigitalOcean(file))
    );
    subImages = uploadResults.map((res: any) => res.Location);
  }
  console.log(parseData);

  const draftProduct = await prisma.product.create({
    data: {
      ...parseData,
      isDraft: true,
      userId: user.id,
      mainImage: mainImage,
      subImages: subImages
    },
  });

  return draftProduct;
};

//getAllDraftProducts
const getAllDraftProducts = async (req: Request) => {
  const sellerId = req.user.id;
  if (!sellerId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access: no user ID found");
  }
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller || seller.role !== "SELLER") {
    throw new ApiError(httpStatus.FORBIDDEN, "Only sellers can view draft products");
  }
  const drafts = await prisma.product.findMany({
    where: {
      userId: sellerId,
      isDraft: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return drafts;
};

//publishDraftProduct
const publishDraftProduct = async (productId: string, req: Request) => {
  const sellerId = req.user.id;
  if (!sellerId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access: no user ID found");
  }

  const sellerProfile = await prisma.seller.findUnique({ where: { userId: sellerId } });
  if (!sellerProfile) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Seller profile not found');
  }

  if (sellerProfile.status !== "APPROVED") {
    throw new ApiError(httpStatus.FORBIDDEN, 'Profile is not approved yet, Please wait for approval before creating products');
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Draft product not found");
  }
  if (existingProduct.userId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to publish this product");
  }
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      isDraft: false,
    },
  });

  return updatedProduct;
};

// Update Product
const updateProduct = async (req: Request, productId: string) => {
  const sellerId = req.user?.id;
  if (!sellerId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access: no user ID found');
  }

  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user || user.role !== 'SELLER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only sellers can update products');
  }

  // ✅ Ensure product exists & belongs to seller
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (existingProduct.userId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to edit this product');
  }

  // ✅ Handle files
  const files = req.files as any;
  const stringData = req.body.data;
  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product data is required');
  }

  const parsedData = JSON.parse(stringData);

  // ✅ Upload main image (if provided)
  let mainImage: string | undefined;
  if (files?.mainImage && files.mainImage.length > 0) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(files.mainImage[0]);
    mainImage = uploadResult.Location;
  }

  // ✅ Upload sub-images (if provided)
  let subImages: string[] | undefined;
  if (files?.subImages && files.subImages.length > 0) {
    const uploadResults = await Promise.all(
      files.subImages.map((file: any) => fileUploader.uploadToDigitalOcean(file))
    );
    subImages = uploadResults.map((res: any) => res.Location);
  }

  // ✅ Convert numeric fields
  parsedData.setPrice = Number(parsedData.setPrice);
  parsedData.setDiscount = parsedData.setDiscount ? Number(parsedData.setDiscount) : 0;

  // ✅ Calculate discount as percentage (e.g., 7 means 7%)
  const discountedPrice =
    parsedData.setDiscount > 0
      ? parsedData.setPrice - (parsedData.setPrice * parsedData.setDiscount) / 100
      : parsedData.setPrice;

  // ✅ Update product
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      ...parsedData,
      userId: user.id,
      ...(mainImage && { mainImage }),
      ...(subImages && { subImages }),
      discoutedPrice: discountedPrice,
    },
  });

  return updatedProduct;
};

// getAllProducts
const getAllProducts = async (
  filters: TProductFilterRequest,
  userId?: string
) => {
  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  // ✅ Only published products
  andConditions.push({ isDraft: false, isDeleted: false, orderStatus: "PENDING" });

  // 🔍 Search by text fields
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map((field) => ({
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

        if (key === "color") {
          return {
            color: {
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

  // Fetch products
  const products = await prisma.product.findMany({
    where: whereConditions,
    orderBy: {
      createdAt: "desc",
    }
  });

  // ✅ If userId exists, check wishlist
  let wishlist: { productId: string }[] = [];
  if (userId) {
    wishlist = await prisma.wishlist.findMany({
      where: { buyerId: userId },
      select: { productId: true },
    });
  }

  const wishlistSet = new Set(wishlist.map((w) => w.productId));

  const productsWithWishlistFlag = products.map((product) => ({
    ...product,
    isAdded: wishlistSet.has(product.id),
  }));

  return {
    data: productsWithWishlistFlag,
  };
};

// getProductById with offers
const getProductById = async (id: string, userId?: string) => {

  // Increment total views
  await prisma.product.update({
    where: { id },
    data: {
      totalViews: { increment: 1 },
    },
  });

  // Fetch product with seller info
  const productWithSeller = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });

  if (!productWithSeller) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const sellerId = productWithSeller.userId;

  // Parallel checks (wishlist + following)
  let isInWishlist = false;
  let isFollowing = false;

  if (userId) {
    const [wishlistItem, followItem] = await Promise.all([
      prisma.wishlist.findFirst({
        where: {
          buyerId: userId,
          productId: id,
        },
      }),
      prisma.follow.findFirst({
        where: {
          followerId: userId,
          followingId: sellerId,
        },
      }),
    ]);

    isInWishlist = !!wishlistItem;
    isFollowing = !!followItem;
  }

  // Seller stats
  const [followers, following, totalSoldProducts] = await Promise.all([
    prisma.follow.count({
      where: { followingId: sellerId },
    }),
    prisma.follow.count({
      where: { followerId: sellerId },
    }),
    prisma.product.count({
      where: {
        userId: sellerId,
        orderStatus: "SOLD",
      },
    }),
  ]);

  return {
    ...productWithSeller,
    isAdded: isInWishlist,
    sellerStats: {
      isFollowing,
      totalFollowers: followers,
      totalFollowing: following,
      totalItemsSold: totalSoldProducts,
    },
  };
};

// getTrendingProducts by highest views
const getFeaturedProducts = async (
  options: IPaginationOptions,
  userId?: string
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const products = await prisma.product.findMany({
    skip,
    take: limit,
    where: {
      isDraft: false,
      isDeleted: false,
      orderStatus: "PENDING",
      totalViews: {
        gt: 20,
      }
    },
    orderBy: {
      totalViews: "desc",
    },
  });

  const total = await prisma.product.count({
    where: {
      isDraft: false,
      isDeleted: false,
      orderStatus: "PENDING",
      totalViews: {
        gt: 20,
      }
    },
  });

  // ✅ If userId exists, fetch wishlist
  let wishlist: { productId: string }[] = [];
  if (userId) {
    wishlist = await prisma.wishlist.findMany({
      where: { buyerId: userId },
      select: { productId: true },
    });
  }

  const wishlistSet = new Set(wishlist.map((w) => w.productId));

  const productsWithWishlistFlag = products.map((product) => ({
    ...product,
    isAdded: wishlistSet.has(product.id),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: productsWithWishlistFlag,
  };
};

// getProductsUnder70
const getProductsUnder70 = async (
  options: IPaginationOptions,
  userId?: string
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const products = await prisma.product.findMany({
    where: {
      isDraft: false,
      isDeleted: false,
      orderStatus: "PENDING",
      setPrice: {
        lte: 70, // ✅ Price under or equal to $70
      },
    },
    orderBy: {
      createdAt: "desc", // ✅ Most recent first
    },
    skip,
    take: limit,
  });

  const total = await prisma.product.count({
    where: {
      isDraft: false,
      isDeleted: false,
      orderStatus: "PENDING",
      setPrice: {
        lte: 70,
      },
    },
  });

  // ✅ If userId exists, fetch wishlist
  let wishlist: { productId: string }[] = [];
  if (userId) {
    wishlist = await prisma.wishlist.findMany({
      where: { buyerId: userId },
      select: { productId: true },
    });
  }

  const wishlistSet = new Set(wishlist.map((w) => w.productId));

  const productsWithWishlistFlag = products.map((product) => ({
    ...product,
    isAdded: wishlistSet.has(product.id),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: productsWithWishlistFlag,
  };
};

// getSuggestedProducts
const getSuggestedProducts = async (
  userId: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const buyer = await prisma.buyer.findUnique({
    where: { userId },
    select: {
      category: true,
      interests: true,
      brands: true,
    },
  });

  if (!buyer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Buyer profile not found");
  }

  const orConditions: Prisma.ProductWhereInput[] = [];

  if (buyer.category) {
    orConditions.push({
      category: {
        equals: buyer.category,
      },
    });
  }

  if (Array.isArray(buyer.interests) && buyer.interests.length > 0) {
    orConditions.push({
      interest: {
        in: buyer.interests,
      },
    });
  }

  if (Array.isArray(buyer.brands) && buyer.brands.length > 0) {
    orConditions.push({
      brand: {
        in: buyer.brands,
      },
    });
  }

  const whereCondition: Prisma.ProductWhereInput =
    orConditions.length > 0
      ? {
        isDraft: false,
        OR: orConditions,
      }
      : {
        isDraft: false,
      };

  // fetch wishlist for this buyer
  const wishlist = await prisma.wishlist.findMany({
    where: { buyerId: userId },
    select: { productId: true },
  });
  const wishlistSet = new Set(wishlist.map(w => w.productId));

  const products = await prisma.product.findMany({
    where: { isDraft: false, isDeleted: false, orderStatus: "PENDING", ...whereCondition },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  // attach wishlist info
  const productsWithWishlist = products.map(product => ({
    ...product,
    isAdded: wishlistSet.has(product.id),
  }));

  const total = await prisma.product.count({
    where: { isDraft: false, isDeleted: false, orderStatus: "PENDING", ...whereCondition },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: productsWithWishlist,
  };
};

//Add To Wishlist
const addToWishlist = async (buyerId: string, productId: string) => {
  const user = await prisma.user.findUnique({ where: { id: buyerId } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.role !== 'BUYER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only buyers can add products to wishlist');
  }

  const alreadyAdded = await prisma.wishlist.findFirst({
    where: { buyerId, productId },
  });

  if (alreadyAdded) {
    throw new ApiError(httpStatus.CONFLICT, 'Already in wishlist');
  }

  const wishlist = await prisma.wishlist.create({
    data: { buyerId, productId },
  });

  return wishlist;
};

//Get All Wishlist
const getAllWishlist = async (buyerId: string) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { buyerId },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
        }
      }
    },
  });
  return wishlist;
}

//Remove from Wishlist
const removeFromWishlist = async (id: string) => {

  const wishlistItem = await prisma.wishlist.findFirst({
    where: { id },
  });

  if (!wishlistItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wished Product not found in wishlist');
  }

  await prisma.wishlist.delete({
    where: { id: wishlistItem.id },
  });

  return { message: 'Product removed from wishlist' };
};

//get Products By Seller Id
const getProductsBySeller = async (sellerId: string) => {
  const products = await prisma.product.findMany({
    where: { userId: sellerId, isDraft: false, isDeleted: false, orderStatus: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

//Delete Draft Product
const deleteDraftProduct = async (id: string) => {
  const product = await prisma.product.delete({
    where: { id, isDraft: true },
  });
  return product;
}

export const ProductService = {
  createProduct,
  saveProductAsDraft,
  getAllDraftProducts,
  publishDraftProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsUnder70,
  getSuggestedProducts,
  addToWishlist,
  getAllWishlist,
  removeFromWishlist,
  getProductsBySeller,
  deleteDraftProduct
}
