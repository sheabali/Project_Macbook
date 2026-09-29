import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { progressStatus } from "@prisma/client";

//update Order Details and status
const updateOrderDetailsAndStatus = async (
  orderId: string,
  data: {
    buyerId?: string;
    estimatedDate?: Date;
    estimatedTime?: string;
    progressStatus?: string;
  }
) => {

  const validStatuses = [
    "CONFIRMED",
    "IN_PROCESS",
    "SHIPPED",
    "IN_TRANSIT",
    "RECEIVED",
    "CANCELLED",
  ];

  if (data.progressStatus && !validStatuses.includes(data.progressStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid progress status");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");


  // Normal update
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      buyerId: data.buyerId,
      estimatedDate: data.estimatedDate,
      estimatedTime: data.estimatedTime,
      progressStatus: data.progressStatus as progressStatus,
    },
  });

  //If order is marked as RECEIVED, mark product as SOLD
  if (data.progressStatus === "RECEIVED") {
    await prisma.product.update({
      where: { id: updated.productId },
      data: { orderStatus: "SOLD" },
    });
  }

  //If order is cancelled manually, revert product
  if (data.progressStatus === "CANCELLED") {
    await prisma.product.update({
      where: { id: updated.productId },
      data: { orderStatus: "PENDING" },
    });
  }

  return updated;
};

// Get all orders for a specific seller
const getAllSellerOrders = async (sellerId: string) => {
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) {
    throw new ApiError(httpStatus.FORBIDDEN, "Seller Not Found");
  }

  // 2️⃣ Find orders stuck in CONFIRMED > 24 hours
  const expiredOrders = await prisma.order.findMany({
    where: {
      sellerId,
      progressStatus: "CONFIRMED",
      createdAt: {
        lte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const order of expiredOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { progressStatus: "CANCELLED" },
    });

    await prisma.product.update({
      where: { id: order.productId },
      data: { orderStatus: "PENDING" },
    });
  }

  // 4️⃣ Fetch updated orders
  const orders = await prisma.order.findMany({
    where: { sellerId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
          offeredPrice: true,
          orderStatus: true,
        },
      },
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // 5️⃣ Custom sort
  const sortedOrders = orders.sort((a, b) => {
    const statusOrder = (status: string) => {
      if (status === "CONFIRMED") return 1; // top
      if (status === "CANCELLED") return 3; // bottom
      return 2; // middle
    };

    const orderA = statusOrder(a.progressStatus);
    const orderB = statusOrder(b.progressStatus);

    if (orderA !== orderB) {
      return orderA - orderB; // first by custom status order
    }

    // If both statuses fall in the same group, sort by date
    if (a.progressStatus === "CONFIRMED") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // ASC
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // DESC
    }
  });

  return sortedOrders;
};


//Get all orders for a specific buyer
const getAllBuyerOrders = async (buyerId: string) => {
  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  if (!buyer) {
    throw new ApiError(httpStatus.FORBIDDEN, "Buyer not found");
  }
  const orders = await prisma.order.findMany({
    where: {
      buyerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
          offeredPrice: true,
          orderStatus: true,
        },
      },
    },
  });
  return orders;
};

////Get order Details for a specific buyer
const trackOrderById = async (buyerId: string, orderId: string) => {
  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  if (!buyer) {
    throw new ApiError(httpStatus.FORBIDDEN, "Buyer not found");
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
          offeredPrice: true,
          orderStatus: true,
        },
      },
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          profileImage: true,
        },
      },
      seller: {
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
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  return order;
};

export const orderService = {
  updateOrderDetailsAndStatus,
  getAllSellerOrders,
  getAllBuyerOrders,
  trackOrderById
};