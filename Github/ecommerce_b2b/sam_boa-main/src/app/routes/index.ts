import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { sellerRoutes } from "../modules/seller/seller.routes";
import { AdminRoutes } from "../modules/Admin/Admin.routes";
import { subscriptionOfferRoutes } from "../modules/subscriptionOffer/subscriptionOffer.routes";
import { ProductRoutes } from "../modules/products/products.routes";
import { offerRoutes } from "../modules/offer/offer.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { ReportRoutes } from "../modules/report/report.routes";
import { userSubscriptionRoutes } from "../modules/userSubscription/userSubscription.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes
  },
  {
    path: "/subscription",
    route: subscriptionOfferRoutes
  },
  {
    path: "/userSubscription",
    route: userSubscriptionRoutes
  },
  {
    path: "/products",
    route: ProductRoutes
  },
  {
    path: "/offers",
    route: offerRoutes
  },
  {
    path: "/notification",
    route: NotificationRoutes
  },
  {
    path: "/sellers",
    route: sellerRoutes
  },
  {
    path: "/orders",
    route: orderRoutes
  },
  {
    path: "/reviews",
    route: reviewRoutes
  },
  {
    path: "/reports",
    route: ReportRoutes
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
