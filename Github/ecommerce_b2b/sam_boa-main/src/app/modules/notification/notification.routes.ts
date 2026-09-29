// Notification.routes: Module file for the Notification.routes functionality.
import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/send-noti', NotificationController.sendNotificationToUser);

// Get all notifications
router.get('/all-noti', auth(), NotificationController.getAllNotificationsController);

// Get notifications by user ID
router.get('/get-noti', auth(), NotificationController.getNotificationByUserIdController);

// Mark notifications as read by user ID
router.patch('/read-noti', auth(), NotificationController.readNotificationByUserIdController);
export const NotificationRoutes = router;

// Send group notification
router.post('/send-group-noti', auth(UserRole.ADMIN), NotificationController.sendNotificationToUserGroup);