import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { offerController } from './offer.controller';

const router = express.Router();

router.post('/acceptOfferByBuyer', auth(), offerController.acceptListedPrice);

router.post('/makeOfferbyBuyer', auth(), offerController.makeOffer);

router.patch("/acceptOfferBySeller/:offerId", auth(), offerController.sellerAcceptOffer);

router.patch("/sellerCounterOffer/:offerId", auth(), offerController.sellerCounterOffer);

router.patch("/sellerDeclinedOffer/:offerId", auth(), offerController.cancelOfferBySeller);

router.patch("/buyerCounterOffer/:offerId", auth(), offerController.buyerCounterOffer);

router.patch("/buyerAcceptCounterOffer/:offerId", auth(), offerController.buyerAcceptCounterOffer);

router.get('/getAllAcceptedOffers', auth(), offerController. getAllOffersForUser);

router.get('/getAllOffersForAProduct/:productId', auth(), offerController.getAllOfferForaProduct);

export const offerRoutes = router;