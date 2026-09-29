import express from 'express';
import { AdminController } from './Admin.controller';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpars/fileUploader';


const router = express.Router();

router.patch('/approve/:userId', auth(UserRole.ADMIN), AdminController.approveSeller);

router.patch('/decline/:userId', auth(UserRole.ADMIN), AdminController.declineSellerController);

router.get('/totalUsers', AdminController.getTotalUsersController);

router.get('/dashboard', auth(UserRole.ADMIN), AdminController.dashboardStatsController);

// Promo Routes
router.post("/promo", fileUploader.promoImage, AdminController.createPromo);

router.patch("/promo/:id", fileUploader.promoImage, AdminController.updatePromo);

router.get("/getAllPromo", AdminController.getPromos);

router.get("/getSinglePromo/:id", AdminController.getPromoById);

router.delete("/deletePromo/:id", AdminController.deletePromo);

//Banner Routes
router.post("/banner", fileUploader.bannerImage, AdminController.createBanner);

router.patch("/banner/:id", fileUploader.bannerImage, AdminController.updateBanner);

router.get("/getAllBanners", AdminController.getBanners);

router.get("/getSingleBanner/:id", AdminController.getBannerById);

router.delete("/deleteBanner/:id", AdminController.deleteBanner);

export const AdminRoutes = router;
