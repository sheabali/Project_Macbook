import express from 'express';
import auth from '../../middlewares/auth';
import { sellerController } from './seller.controller';
import { UserRole } from '@prisma/client';
import optionalAuth from '../../middlewares/optionalAuth';

const router = express.Router();

router.get('/getAllSellerProducts', auth(), sellerController.getAllSellerProducts);

router.get('/getAllSoldProducts', auth(), sellerController.getAllSoldProducts);

router.get('/getAllUnSoldProducts', auth(), sellerController.getAllUnsoldProducts);

router.patch('/softDelete/:productId', auth(), sellerController.softDeleteSoldProduct);

router.get('/getSellerProduct/:id', auth(), sellerController.getSellerProductById);

router.post("/confirm-product/:productId", auth(), sellerController.confirmProductAndCreateOrder);

router.post("/follow/:sellerId", auth(), sellerController.followSeller);

router.get("/followers", auth(), sellerController.getSellerFollowers);

router.get("/following", auth(), sellerController.getUserFollowing);

router.delete("/unfollow/:sellerId", auth(), sellerController.unfollowSeller);

router.get("/sellerProfile/:userName", optionalAuth(), sellerController.getSellerProfile);

router.get("/top-sellers", sellerController.getTopSellersOfWeek);

export const sellerRoutes = router;