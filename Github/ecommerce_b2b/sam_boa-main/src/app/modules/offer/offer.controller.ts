import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { offerService } from "./offer.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";

//Buyer accepts the listed price (no negotiation)
const acceptListedPrice = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { productId } = req.body;
  const result = await offerService.acceptListedPrice(buyerId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listed price accepted",
    data: result,
  });
})

//Buyer makes an offer
const makeOffer = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { productId, offerPrice } = req.body;
  const result = await offerService.makeOffer(buyerId, productId, offerPrice);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offer submitted successfully",
    data: result,
  });
});

//Seller Accept an offer
const sellerAcceptOffer = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const { offerId } = req.params;
  const result = await offerService.sellerAcceptOffer(sellerId, offerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offer accepted by seller",
    data: result,
  });
})

const sellerCounterOffer = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const { offerId } = req.params;
  const { counterPrice } = req.body;
  const result = await offerService.sellerCounterOffer(sellerId, offerId, counterPrice);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Counter offer sent",
    data: result,
  });
})

const cancelOfferBySeller = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const { offerId } = req.params;
  const result = await offerService.cancelOfferBySeller(sellerId, offerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offer cancelled successfully",
    data: result,
  });
});

const buyerCounterOffer = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { offerId } = req.params;
  const { counterPrice } = req.body;
  const result = await offerService.buyerCounterOffer(buyerId, offerId, counterPrice);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Counter offer sent",
    data: result,
  });
})

const buyerAcceptCounterOffer = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { offerId } = req.params;
  const result = await offerService.buyerAcceptCounterOffer(buyerId, offerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Buyer accepted counter-offer",
    data: result,
  });
})

const getAllOffersForUser = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await offerService.getAllOffersForUser(sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Accepted offers retrieved successfully',
    data: result,
  });
});

const getAllOfferForaProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await offerService.getAllOfferForaProduct(productId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offers for the product retrieved successfully',
    data: result,
  });
});

export const offerController = {
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