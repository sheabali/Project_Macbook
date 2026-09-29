import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";
import userMessageToAdmin from "../../../shared/userMessageToAdmin";

const router = express.Router();

// *!register user
router.post(
  "/register",
  // validateRequest(UserValidation.CreateUserValidationSchema),
  fileUploader.uploadSingle,
  userController.createUser
);

// *!get all  user
router.get("/", userController.getUsers);

// *!get all  Sellers
router.get("/getAllSellers", auth(UserRole.ADMIN), userController.getAllSellersController);

// *!get Sellers Request
router.get("/getSellerRequests", auth(UserRole.ADMIN), userController.getSellerRequests);

// *!get single  user
router.get("/:id", userController.getSingleUserById);

// *!profile user
router.put(
  "/profile",
  // validateRequest(UserValidation.userUpdateSchema),
  auth(UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER, UserRole.USER),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// *!update  user
router.put("/:id", userController.updateUser);

// Support - USer message to admin
router.post("/support/message", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await userMessageToAdmin(
      email,
      `<p><b>Name:</b> ${name}</p><p><b>Name:</b> ${phone}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`,
      "New Support Message"
    );

    res.json({ success: true, message: "Message sent to admin" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/upload-photo", fileUploader.uploadSingle, auth(), userController.uploadPhoto);

export const userRoutes = router;
