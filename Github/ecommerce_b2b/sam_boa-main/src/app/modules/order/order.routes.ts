import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { orderController } from './order.controller';

const router = express.Router();

router.patch("/update-status/:orderId", auth(UserRole.SELLER), orderController.updateOrderDetailsAndStatus);

router.get("/getAllSellerOrders", auth(), orderController.getAllSellerOrders);

router.get("/getAllBuyerOrders", auth(), orderController.getAllBuyerOrders);

router.get("/trackOrder/:orderId", auth(), orderController.trackOrderById);

export const orderRoutes = router;