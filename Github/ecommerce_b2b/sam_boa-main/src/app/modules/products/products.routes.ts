import express from "express"
import { ProductController } from "./products.controller"
import auth from "../../middlewares/auth"
import { fileUploader } from "../../../helpars/fileUploader"
import { UserRole } from "@prisma/client"
import optionalAuth from "../../middlewares/optionalAuth"

const router = express.Router()

router.post("/createProduct", auth(UserRole.SELLER), fileUploader.updateProduct, ProductController.createProduct)

router.post("/saveDraft", auth(UserRole.SELLER), fileUploader.updateProduct, ProductController.saveProductAsDraft)

router.get("/getAllDraft", auth(UserRole.SELLER), fileUploader.updateProduct, ProductController.getAllDraftProducts)

router.post("/publishedDraft/:productId", auth(UserRole.SELLER), fileUploader.updateProduct, ProductController.publishDraftProduct)

router.patch("/updateProduct/:id", auth(UserRole.SELLER), fileUploader.updateProduct, ProductController.updateProduct)

router.get("/getProducts", optionalAuth(), ProductController.getAllProducts)

router.get("/getSingleProduct/:id", optionalAuth(), ProductController.getProductDetails)

router.get('/featured', optionalAuth(), ProductController.getFeaturedProducts);

router.get('/under70', optionalAuth(), ProductController.getProductsUnder70);

router.get('/suggested', auth(), ProductController.getSuggestedProducts);

router.post("/:id/wishlist", auth(UserRole.BUYER), ProductController.addToWishlist);

router.get("/getAll/wishlist", auth(UserRole.BUYER), ProductController.getAllWishlist);

router.delete("/:id/wishlist", auth(UserRole.BUYER), ProductController.removeFromWishlist);

router.get("/getProductsBySeller/:sellerId", optionalAuth(), ProductController.getProductsBySeller);

router.delete("/deleteDraftProduct/:productId", auth(UserRole.SELLER), ProductController.deleteDraftProduct);

export const ProductRoutes = router