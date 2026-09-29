// Notification.service: Module file for the Notification.service functionality.
import admin from "../../../shared/firebase";
import prisma from "../../../shared/prisma";

const sendNotification = async (
  title: string,
  body: string,
  userId: string,
  productId: string,
  toMessageId: string,
  deviceToken?: string,
) => {
  let message;
  if (deviceToken) {
    message = {
      notification: { title, body },
      token: deviceToken,
    };
    console.log(message);
  }

  try {
    if (message) {
      const test = await admin.messaging().send(message);
      console.log(test);
    }

    await prisma.notification.create({
      data: {
        title,
        body,
        userId,
        productId: productId ?? null,
        toMessageId: toMessageId ?? null,
      },
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Get all notifications
const getAllNotifications = async () => {
  const notifications = await prisma.notification.findMany({
    select: {
      id: true,
      userId: true,
      toMessageId: true,
      productId: true,
      title: true,
      body: true,
      read: true,
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
          offeredPrice: true,
          Order: {
            where: { progressStatus: "CONFIRMED" },
            select: {
              id: true,
              buyerId: true,
              progressStatus: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              Seller: {
                select: {
                  mobileMoneyNumber: true,
                  serviceProvider: true,
                  registerdNameFormobileMoneyNumber: true,
                },
              },
            },
          },
          createdAt: true,
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications;
};

// Get all notifications for a specific user
const getNotificationByUserId = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      toMessageId: true,
      productId: true,
      title: true,
      body: true,
      read: true,
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          setPrice: true,
          offeredPrice: true,
          Order: {
            where: { progressStatus: { not: "CANCELLED" } },
            select: {
              id: true,
              buyerId: true,
              progressStatus: true,
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              Seller: {
                select: {
                  mobileMoneyNumber: true,
                  serviceProvider: true,
                  registerdNameFormobileMoneyNumber: true,
                },
              }
            }
          },
          createdAt: true,
        }
      },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return notifications;
};

// Mark all notifications as read for a specific user
const readNotificationByUserId = async (userId: string) => {
  try {
    const notifications = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return notifications;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

// Send notification to a group of users and save in DB
const sendNotificationToGroupIntoDb = async (notificationData: {
  title: string,
  body: string,
  users: string[]
}) => {
  const { title, body, users } = notificationData;

  const notifications = users.map(async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      const message = {
        notification: { title, body },
        token: user.fcmToken,
      };

      await admin.messaging().send(message);
    }

    return prisma.notification.create({
      data: {
        title,
        body,
        userId,
      },
    });
  });

  await Promise.all(notifications);
  return { message: "Notifications sent successfully" };
};

export const notificationService = {
  sendNotification,
  getAllNotifications,
  getNotificationByUserId,
  readNotificationByUserId,
  sendNotificationToGroupIntoDb,
};
