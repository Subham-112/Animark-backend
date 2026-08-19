import { Router } from "express";
import { authenticateToken, authorize } from "../../middleware/authMiddleware";
import {
  calculateOrder,
  cancelOrder,
  createOrder,
  getOrderById,
  getOrders,
  getOrderStats,
  updateOrderStatus,
} from "./order.controller";

const router = Router();

const userAccess = [ authenticateToken, authorize("user", "admin") ];
const adminAccess = [ authenticateToken, authorize("admin") ];

// Step 1: Calculate order total (Public / Authenticated)
router.post("/calculate", calculateOrder);

// Order Statistics Endpoint
router.get("/stats", authenticateToken, getOrderStats);

// Step 2: Create order with customer details
router.post("/", ...userAccess, createOrder);

// Order List & Details
router.get("/", ...userAccess, getOrders);
router.get("/:id", ...userAccess, getOrderById);

// Order Status & Actions
router.patch("/:id/status", ...adminAccess, updateOrderStatus);
router.patch("/:id/cancel", ...userAccess, cancelOrder);

export default router;
