import express from 'express';
import auth from '../../middlewares/auth';
import { userSubscriptionController } from './userSubscription.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/createSubscribtion', auth(UserRole.SELLER), userSubscriptionController.createUserSubscription);

router.get('/getMySubscription', auth(UserRole.SELLER), userSubscriptionController.getUserSubscriptionList);

router.get('/getSubscriptionByAdmin', auth(), userSubscriptionController.getUserSubscriptionListByAdmin);

router.get('/getSubscription/:id', auth(), userSubscriptionController.getUserSubscriptionById);

router.delete('/:id', auth(), userSubscriptionController.deleteUserSubscription);

export const userSubscriptionRoutes = router;