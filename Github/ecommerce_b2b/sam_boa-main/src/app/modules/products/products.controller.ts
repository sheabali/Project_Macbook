import { Request, Response } from "express"
import { ProductService } from "./products.service"
import sendResponse from "../../../shared/sendResponse"
import httpStatus from "http-status"
import catchAsync from "../../../shared/catchAsync"
import pick from "../../../shared/pick"
import { productFilterableFields } from "./products.constant"


const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Created successfully!",
    data: result,
  });
});

const saveProductAsDraft = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.saveProductAsDraft(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product saved as draft successfully",
    data: result,
  });
});

const getAllDraftProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllDraftProducts(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Draft products fetched successfully",
    data: result,
  });
});

const publishDraftProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await ProductService.publishDraftProduct(productId, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product published successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const result = await ProductService.updateProduct(req, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully!',
    data: result,
  });
});


const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const userId = req.user?.id ?? null
  const result = await ProductService.getAllProducts(filters, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully!',
    data: result.data,
  });
});

const getProductDetails = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const userId = req.user?.id ?? null
  const result = await ProductService.getProductById(productId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Details Retrieve successfully!",
    data: result,
  });
})

const getFeaturedProducts = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const userId = req.user?.id ?? null
  const result = await ProductService.getFeaturedProducts(options, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trending products fetched successfully',
    data: result,
  });
});

const getProductsUnder70 = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const userId = req.user?.id ?? null
  const result = await ProductService.getProductsUnder70(options, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products under $70 retrieved successfully',
    data: result,
  });
});

const getSuggestedProducts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await ProductService.getSuggestedProducts(userId, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Suggested products fetched successfully',
    data: result,
  });
})


const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const { id } = req.params;
  const result = await ProductService.addToWishlist(buyerId, id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Added To wishlist!",
    data: result,
  });
})

const getAllWishlist = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user.id;
  const result = await ProductService.getAllWishlist(buyerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wishlist fetched successfully!",
    data: result,
  });
})

 const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.removeFromWishlist(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result
  });
});

const getProductsBySeller = catchAsync(async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const result = await ProductService.getProductsBySeller(sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully!",
    data: result,
  });
})

const deleteDraftProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await ProductService.deleteDraftProduct(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully!",
    data: result,
  });
})

export const ProductController = {
  createProduct,
  saveProductAsDraft,
  getAllDraftProducts,
  publishDraftProduct,
  updateProduct,
  getAllProducts,
  getProductDetails,
  getFeaturedProducts,
  getProductsUnder70,
  getSuggestedProducts,
  addToWishlist,
  getAllWishlist,
  removeFromWishlist,
  getProductsBySeller,
  deleteDraftProduct
}
