import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { OrderStatus } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";

//Buyer accepts the listed price (no negotiation)
const acceptListedPrice = async (buyerId: string, productId: string) => {

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });

  if (!buyer) {
    throw new ApiError(httpStatus.FORBIDDEN, "Buyer not found");
  }

  if (buyerId == product.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot buy your own product");
  }

  const order = await prisma.order.create({
    data: {
      buyerId,
      productId,
      sellerId: product.userId,
      progressStatus: "CONFIRMED",
    },
  });

  await prisma.offer.updateMany({
    where: { productId, status: "PENDING" },
    data: {
      status: "ACCEPTED",
      buyerAccepted: true,
      sellerAccepted: true,
    },
  });

  if (product.discoutedPrice) {
    await prisma.product.update({
      where: { id: productId },
      data: { orderStatus: OrderStatus.CONFIRMED, offeredPrice: product.discoutedPrice },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { orderStatus: OrderStatus.CONFIRMED, offeredPrice: product.setPrice },
    });
  }


  return {
    message: "Offer accepted and order created successfully",
    order,
  };
};

//Buyer proposes a new price
const makeOffer = async (buyerId: string, productId: string, offerPrice: number) => {

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });

  if (!buyer) {
    throw new ApiError(httpStatus.FORBIDDEN, "Buyer not found");
  }

  if (buyerId == product.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot buy your own product");
  }

  const existingOffer = await prisma.offer.findFirst({
    where: { senderId: buyerId, productId, status: "PENDING" },
  });

  if (existingOffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You already have a pending offer for this post");
  }

  const offer = await prisma.offer.create({
    data: {
      senderId: buyerId,
      receverId: product.userId,
      productId,
      offerPrice,
      status: "PENDING",
    },
  });
  return offer;
};

//Seller accepts buyer's proposed offer
const sellerAcceptOffer = async (sellerId: string, offerId: string) => {

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer || offer.receverId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to accept this offer");
  }

  if (offer.lastCounterBy == "SELLER") {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot accept your own counter-offer. Wait for buyer's response.");
  }

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      sellerAccepted: true,
      buyerAccepted: true,
      status: "ACCEPTED",
    },
  });

  await prisma.offer.updateMany({
    where: { productId: updated.productId, id: { not: offerId }, status: "PENDING" },
    data: {
      status: "DECLINED",
    },
  })

  // ✅ Check if both parties accepted → create order
  if (updated.sellerAccepted && updated.buyerAccepted) {
    await prisma.order.create({
      data: {
        buyerId: offer.senderId,
        productId: offer.productId,
        sellerId: offer.receverId,
        progressStatus: "CONFIRMED",
      },
    });
  }

  await prisma.product.update({
    where: { id: updated.productId },
    data: { orderStatus: OrderStatus.CONFIRMED, offeredPrice: updated.offerPrice },
  });

  return updated;
};

//Seller sends counter-offer
const sellerCounterOffer = async (sellerId: string, offerId: string, counterPrice: number) => {

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer || offer.receverId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to counter this offer");
  }
  if (offer.sellerCounterCount >= 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Seller has already countered 2 times");
  }
  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      senderId: sellerId,
      receverId: offer.senderId,
      offerPrice: counterPrice,
      sellerAccepted: false,
      buyerAccepted: false,
      status: "PENDING",
      sellerCounterCount: { increment: 1 },
      lastCounterBy: "SELLER",
    },
  });
  return updated;
};

//Seller Declined offer
const cancelOfferBySeller = async (sellerId: string, offerId: string) => {
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Offer not found");
  }

  if (offer.receverId !== sellerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to cancel this offer");
  }

  if (offer.status === "ACCEPTED" || offer.status === "DECLINED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot cancel an accepted or already cancelled offer");
  }

  const cancelled = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: "DECLINED",
    },
  });

  await prisma.product.update({
    where: { id: offer.productId },
    data: { orderStatus: OrderStatus.PENDING },
  });

  return cancelled;
};

//Buyer sends counter-offer
const buyerCounterOffer = async (buyerId: string, offerId: string, counterPrice: number) => {

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer || offer.receverId !== buyerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to counter this offer");
  }
  if (offer.buyerCounterCount >= 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Buyer has already countered 1 times");
  }
  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      senderId: buyerId,
      receverId: offer.senderId,
      offerPrice: counterPrice,
      sellerAccepted: false,
      buyerAccepted: false,
      status: "PENDING",
      buyerCounterCount: { increment: 1 },
      lastCounterBy: "BUYER",
    },
  });
  return updated;
};

//Buyer accepts seller's counter-offer
const buyerAcceptCounterOffer = async (buyerId: string, offerId: string) => {

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer || offer.receverId !== buyerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to accept this offer");
  }

  if (offer.lastCounterBy == "BUYER") {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot accept your own counter-offer. Wait for Seller's response.");
  }

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      buyerAccepted: true,
      sellerAccepted: true,
      status: "ACCEPTED",
    },
  });

  await prisma.offer.updateMany({
    where: { productId: offer.productId, id: { not: offerId }, status: "PENDING" },
    data: {
      status: "DECLINED",
    },
  })

  // ✅ Check if both parties accepted → create order
  if (updated.buyerAccepted && updated.sellerAccepted) {
    await prisma.order.create({
      data: {
        buyerId: offer.receverId,
        productId: offer.productId,
        sellerId: offer.senderId,
        progressStatus: "CONFIRMED",
      },
    });
  }

  await prisma.product.update({
    where: { id: updated.productId },
    data: { orderStatus: OrderStatus.CONFIRMED, offeredPrice: updated.offerPrice },
  });

  return updated;
};

// Get all accepted offers for a seller
const getAllOffersForUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const acceptedOffers = await prisma.offer.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receverId: userId },
      ],
      status: { in: ["PENDING", "ACCEPTED"] },
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
          profileImage: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return acceptedOffers;
};

// Get all offers for a product
const getAllOfferForaProduct = async (productId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const results = await prisma.offer.findMany({
    skip,
    take: limit,
    where: {
      productId,
      status: "PENDING",
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
          profileImage: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const total = results.length;
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: results,
  };
}

export const offerService = {
  acceptListedPrice,
  makeOffer,
  sellerAcceptOffer,
  sellerCounterOffer,
  cancelOfferBySeller,
  buyerCounterOffer,
  buyerAcceptCounterOffer,
  getAllOffersForUser,
  getAllOfferForaProduct,
};