import express from 'express';
import auth from '../../middlewares/auth';
import { subscriptionOfferController } from './subscriptionOffer.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post('/create-subscriptionOffer', auth(UserRole.ADMIN), subscriptionOfferController.createSubscriptionOffer);

router.get('/', auth(), subscriptionOfferController.getSubscriptionOfferList);

router.get('/:id', auth(), subscriptionOfferController.getSubscriptionOfferById);

router.put('/:id', auth(UserRole.ADMIN), subscriptionOfferController.updateSubscriptionOffer);

router.delete('/:id', auth(UserRole.ADMIN), subscriptionOfferController.deleteSubscriptionOffer);

export const subscriptionOfferRoutes = router;