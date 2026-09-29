import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import prisma from "../../../shared/prisma";
import { startOfWeek, subMonths, startOfMonth } from "date-fns";
import { Request } from "express";

//Approve Seller
const approveSeller = async (userId: string) => {

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new Error('User not found');

  const profile = await prisma.seller.findUnique({ where: { userId: existingUser.id } });
  if (!profile) throw new Error('Security profile not found');

  return prisma.seller.update({
    where: { userId: existingUser.id },
    data:
    {
      approved: true,
      status: 'APPROVED',
    },
  });
}

//Decline Seller
const declineSeller = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new Error("User not found");

  const profile = await prisma.seller.findUnique({ where: { userId: existingUser.id } });
  if (!profile) throw new Error("Security profile not found");

  return prisma.seller.update({
    where: { userId: existingUser.id },
    data: {
      approved: false,
      status: "REJECTED",
    },
  });
};

//getTotalUsers
const getTotalUsers = async () => {
  const users = await prisma.user.findMany(
    {
      select: {
        id: true,
        profileImage: true,
      },
    }
  );

  const totalUsers = await prisma.user.count();

  return { totalUsers, users };
};

//getDashboardStats
const getDashboardStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
  const totalProducts = await prisma.product.count();

  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

  const totalSignupsThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfThisWeek,
      },
    },
  });

  const sixMonthsAgo = subMonths(new Date(), 6);

  const salesData = await prisma.order.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      progressStatus: {
        in: ["CONFIRMED", "IN_PROCESS", "SHIPPED", "IN_TRANSIT", "RECEIVED"],
      },
    },
    select: {
      createdAt: true,
      product: {
        select: {
          setPrice: true, // price per order
        },
      },
    },
  });

  // Month names for chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize monthly revenue for last 6 months
  const monthlyRevenue: { month: string; Sales: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const target = subMonths(new Date(), i);
    const monthKey = monthNames[target.getMonth()];
    monthlyRevenue.push({ month: monthKey, Sales: 0 });
  }

  // Aggregate sales into monthly buckets
  for (const sale of salesData) {
    const monthKey = monthNames[sale.createdAt.getMonth()];
    const amount = sale.product?.setPrice ?? 0;

    const bucket = monthlyRevenue.find((m) => m.month === monthKey);
    if (bucket) bucket.Sales += amount;
  }


  // Get all subscriptions with their planType and user role
  const subscriptions = await prisma.userSubscription.findMany({
    include: {
      subscriptionOffer: {
        select: {
          planName: true,
          planType: true,
        },
      },
      user: {
        select: {
          role: true,
        },
      },
    },
  });
  // Normalize keys to match exactly
  const subscriptionCounts: Record<string, number> = {
    BASIC: 0,
    STANDARD: 0,
    UNLIMITED: 0,
  };
  // Loop through and count
  for (const sub of subscriptions) {
    if (sub.user?.role === 'SELLER') {
      const type = sub.subscriptionOffer?.planName?.toUpperCase();
      if (type && subscriptionCounts.hasOwnProperty(type)) {
        subscriptionCounts[type]++;
      }
    }
  }
  return {
    totalUsers,
    totalSellers,
    totalProducts,
    totalSignupsThisWeek,
    monthlyRevenueLast6Months: monthlyRevenue,
    sellerSubscriptionBreakdown: subscriptionCounts,
  };
};

// Create Promo
const createPromo = async (req: any) => {
  const file = req.file;
  const stringData = req.body.data;
  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Promo data is required");
  }
  let data;
  try {
    data = JSON.parse(stringData);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data");
  }
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Promo image is required");
  }
  const uploadResult = await fileUploader.uploadToDigitalOcean(file);
  const imageUrl = uploadResult.Location;
  const promo = await prisma.promo.create({
    data: {
      name: data.name,
      link: data.link,
      promoImage: imageUrl,
      promoType: data.promoType,
    },
  });
  return promo;
};

const updatePromo = async (promoId: string, req: Request) => {
  const file = req.file;
  const stringData = req.body.data;
  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Promo data is required");
  }
  let data;
  try {
    data = JSON.parse(stringData);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON");
  }
  let updatedFields: any = {
    name: data.name,
    link: data.link,
  };
  if (file) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    updatedFields.promoImage = uploadResult.Location;
  }
  const updated = await prisma.promo.update({
    where: { id: promoId },
    data: updatedFields,
  });

  return updated;
};

const getPromos = async () => {
  return prisma.promo.findMany({ orderBy: { createdAt: "desc" } });
};

const getPromoById = async (promoId: string) => {
  return prisma.promo.findUnique({
    where: { id: promoId },
  });
};

const deletePromo = async (promoId: string) => {
  return prisma.promo.delete({
    where: { id: promoId },
  });
};

// Create Banner
const createBanner = async (req: Request) => {
  const file = req.file;
  const stringData = req.body.data;
  if (!stringData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Banner data is required");
  }
  let data;
  try {
    data = JSON.parse(stringData);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data");
  }
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Banner image is required");
  }
  const uploadResult = await fileUploader.uploadToDigitalOcean(file);
  const imageUrl = uploadResult.Location;
  const banner = await prisma.banner.create({
    data: {
      name: data.name,
      link: data.link,
      bannerImage: imageUrl,
      bannerType: data.bannerType,
    },
  });

  return banner;
};

// Update Banner Image Only
const updateBanner = async (bannerId: string, req: Request) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Banner image is required");
  }

  // Upload file to DigitalOcean (or your storage)
  const uploadResult = await fileUploader.uploadToDigitalOcean(file);

  // Update only the bannerImage field
  const updated = await prisma.banner.update({
    where: { id: bannerId },
    data: {
      bannerImage: uploadResult.Location,
    },
  });

  return updated;
};

// Get All Banners
const getBanners = async () => {
  return prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
};

const getBannerById = async (bannerId: string) => {
  return prisma.banner.findUnique({
    where: { id: bannerId },
  });
}

const deleteBanner = async (bannerId: string) => {
  return prisma.banner.delete({
    where: { id: bannerId },
  });
};


export const AdminService = {
  approveSeller,
  declineSeller,
  getTotalUsers,
  getDashboardStats,
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
