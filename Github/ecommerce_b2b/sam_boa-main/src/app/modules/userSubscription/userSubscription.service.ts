import prisma from "../../../shared/prisma";
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';

// Safely add N months (handles Feb, leap years, 30/31 days)
const addMonths = (date: Date, months: number): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const target = new Date(year, month + months, day);
  if (target.getMonth() !== (month + months) % 12) {
    return new Date(year, month + months + 1, 0);
  }
  return target;
};

// Users can create a userSubscription
const createUserSubscriptionIntoDb = async (userId: string, data: any) => {
  const subscriptionOffer = await prisma.subscriptionOffer.findUnique({
    where: { id: data.subscriptionOfferId },
  });

  if (!subscriptionOffer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription offer not found");
  }

  // 🛑 Check if user already has an active subscription
  const existingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      endDate: { gte: new Date() }, // still active
    },
  });

  if (existingSubscription) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have an active subscription. Please wait until it expires."
    );
  }

  let monthsToAdd = 1;

  // ✅ Create new subscription
  const startDate = new Date();
  const endDate = addMonths(startDate, monthsToAdd);
  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const result = await prisma.userSubscription.create({
    data: {
      userId,
      subscriptionOfferId: subscriptionOffer.id,
      paymentId: data.paymentId,
      paymentStatus: data.paymentStatus,
      status: data.status,
      startDate,
      endDate,
      duration,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User subscription not created");
  }

  // 💳 Create a payment record
  await prisma.payment.create({
    data: {
      paymentId: data.paymentId,
      paymentAmount: subscriptionOffer.price,
      subscriptionId: result.id,
      receiverId: userId,
      status: PaymentStatus.PAID,
    },
  });

  // 🔄 Update user with active subscription
  await prisma.seller.update({
    where: { id: userId },
    data: { subscriptionId: result.id },
  });

  return result;
};

//Get userSubscription
const getUserSubscriptionListFromDb = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await prisma.userSubscription.findMany({
    where: {
      userId: userId,
    },
    include: {
      subscriptionOffer: { select: { id: true, planName: true, planType: true, facilities: true, price: true, duration: true, status: true } }
    }
  });
  return result;
}

//Get all userSubscription
const getUserSubscriptionListByAdminFromDb = async () => {
  const result = await prisma.userSubscription.findMany({
    include: {
      subscriptionOffer: true,
      user: { select: { id: true, firstName: true, lastName: true, userName: true, email: true, role: true, profileImage: true } },
    }
  });
  return result;
};

//Get single userSubscription
const getUserSubscriptionByIdFromDb = async (userSubscriptionId: string) => {
  const result = await prisma.userSubscription.findUnique({
    where: {
      id: userSubscriptionId,
    },
    include: {
      subscriptionOffer: true,
      user: { select: { id: true, firstName: true, lastName: true, userName: true, email: true, role: true, profileImage: true } },
    }
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'userSubscription not found');
  }
  return result;
};

//Delete userSubscription
const deleteUserSubscriptionItemFromDb = async (userSubscriptionId: string) => {
  const deletedItem = await prisma.userSubscription.delete({
    where: {
      id: userSubscriptionId
    },
  });
  if (!deletedItem) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'userSubscriptionId, not deleted');
  }
  await prisma.payment.deleteMany({
    where: {
      receiverId: deletedItem.userId
    },
  });
  await prisma.seller.update({
    where: { userId: deletedItem.userId },
    data: {
      subscriptionId: null,
    },
  })
  return deletedItem;
};

export const userSubscriptionService = {
  createUserSubscriptionIntoDb,
  getUserSubscriptionListFromDb,
  getUserSubscriptionListByAdminFromDb,
  getUserSubscriptionByIdFromDb,
  deleteUserSubscriptionItemFromDb
};