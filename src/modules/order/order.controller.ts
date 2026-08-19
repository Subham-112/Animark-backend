import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { OrderService } from "./order.service";
import { getAuthUser } from "../../utils/AuthUser";
import ApiError from "../../utils/ApiError";

/**
 * Step 1: Calculate Order totals
 */
export const calculateOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Items array is required.");
    }

    const response = await OrderService.calculateOrder(req.body);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Step 2: Create Order
 */
export const createOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { items, youtubeChannelName, youtubeChannelUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Items array is required.");
    }

    if (!youtubeChannelName || !youtubeChannelUrl) {
      throw new ApiError(
        400,
        "YouTube channel name and channel URL are required.",
      );
    }

    const response = await OrderService.createOrder(authUser._id, req.body);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get Order Statistics
 */
export const getOrderStats = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const response = await OrderService.getOrderStats(
      authUser._id,
      authUser.role,
      req.query,
    );
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get Orders (My Orders for User, All Orders for Admin)
 */
export const getOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const response = await OrderService.getOrders(
      authUser._id,
      authUser.role,
      req.query,
    );
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get Order By ID
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    const response = await OrderService.getOrderById(
      id as string,
      authUser._id,
      authUser.role,
    );
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Update Order Status (Admin Only)
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError(400, "Status is required.");
    }

    const response = await OrderService.updateOrderStatus(id as string, status);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Cancel Order
 */
export const cancelOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    const response = await OrderService.cancelOrder(
      id as string,
      authUser._id,
      authUser.role,
    );
    return res.status(response.statusCode).json(response);
  },
);
