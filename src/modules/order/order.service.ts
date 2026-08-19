import { Order } from "../../models/order.model";
import { Product } from "../../models/product.model";
import { User } from "../../models/user.model";
import { OrderStatus, Roles } from "../../common/enum";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import crypto from "crypto";
import { Seller } from "../../models";

export interface CalculateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName?: string;
  youtubeChannelName: string;
  youtubeChannelUrl: string;
  notes?: string;
}

export const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
};

export const OrderService = {
  /**
   * Step 1: Calculate Order Breakdown & Totals before user details entry
   */
  async calculateOrder(payload: CalculateOrderPayload) {
    const { items } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "At least one product item is required.");
    }

    let overallTotal = 0;
    const calculatedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        throw new ApiError(400, "Invalid product or quantity.");
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(404, `Product not found for ID: ${productId}`);
      }

      const subtotal = product.price * quantity;
      overallTotal += subtotal;

      calculatedItems.push({
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          thumbnail: product.thumbnail,
          price: product.price,
        },
        price: product.price,
        quantity,
        subtotal,
      });
    }

    return new ApiResponse(
      200,
      {
        items: calculatedItems,
        totalItems: calculatedItems.length,
        totalAmount: overallTotal,
      },
      "Order calculation completed successfully.",
    );
  },

  /**
   * Step 2: Create Order after user fills details
   */
  async createOrder(userId: string, payload: CreateOrderPayload) {
    const { items, customerName, youtubeChannelName, youtubeChannelUrl, notes } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "At least one product item is required.");
    }

    if (!youtubeChannelName || !youtubeChannelUrl) {
      throw new ApiError(400, "YouTube Channel Name and Channel URL are required.");
    }

    // Fetch user details from DB
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // Auto-extract customer name from DB if not explicitly provided
    const finalCustomerName =
      customerName?.trim() ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email;

    let totalAmount = 0;
    const orderItems = [];
    let detectedSellerId: string | undefined = undefined;

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        throw new ApiError(400, "Invalid product or quantity.");
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(404, `Product not found for ID: ${productId}`);
      }

      // Extract seller ID from product's owner field if present
      if (!detectedSellerId && product.owner) {
        detectedSellerId = String(product.owner);
      }

      const subtotal = product.price * quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal,
      });

      // Increment product total sales count
      product.totalSales = (product.totalSales || 0) + quantity;
      await product.save();
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: userId,
      seller: detectedSellerId,
      items: orderItems,
      details: {
        customerName: finalCustomerName,
        youtubeChannelName: youtubeChannelName.trim(),
        youtubeChannelUrl: youtubeChannelUrl.trim(),
        notes: notes?.trim(),
      },
      totalAmount,
      status: OrderStatus.PENDING,
    });

    return new ApiResponse(201, order, "Order created successfully.");
  },

  /**
   * Get Order Statistics (Total, Completed, Pending, Refunded)
   * Supports ?type=seller or ?type=buyer query parameter
   */
  async getOrderStats(userId: string, role: string, query: any = {}) {
    const filter: any = {};
    const requestType = query.type?.toString().toLowerCase();

    if (role === Roles.ADMIN) {
      if (query.user) filter.user = query.user;
      if (query.seller) filter.seller = query.seller;
    } else if (requestType === "seller") {
      const seller = await Seller.findOne({ user: userId });
      if (!seller) {
        throw new ApiError(403, "You do not have an active seller profile.");
      }
      filter.seller = seller._id;
    } else {
      // Default to buyer perspective (orders placed by user)
      filter.user = userId;
    }

    const [total, completed, pending, refunded] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, status: OrderStatus.COMPLETED }),
      Order.countDocuments({ ...filter, status: OrderStatus.PENDING }),
      Order.countDocuments({ ...filter, status: OrderStatus.REFUNDED }),
    ]);

    return new ApiResponse(
      200,
      {
        total,
        completed,
        pending,
        refunded,
      },
      "Order statistics fetched successfully.",
    );
  },

  /**
   * Get Orders (Supports ?type=seller or ?type=buyer query parameter)
   */
  async getOrders(userId: string, role: string, query: any) {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const requestType = query.type?.toString().toLowerCase();

    const filter: any = {};

    if (role === Roles.ADMIN) {
      if (query.user) filter.user = query.user;
      if (query.seller) filter.seller = query.seller;
    } else if (requestType === "seller") {
      const seller = await Seller.findOne({ user: userId });
      if (!seller) {
        throw new ApiError(403, "You do not have an active seller profile.");
      }
      filter.seller = seller._id;
    } else {
      // Default to buyer perspective (orders placed by user)
      filter.user = userId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "firstName lastName email mobile avatar")
        .populate("seller", "displayName slug image")
        .populate("items.product", "name slug thumbnail price")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    return new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Orders fetched successfully.",
    );
  },

  /**
   * Get Order By ID
   */
  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await Order.findById(orderId)
      .populate("user", "firstName lastName email mobile avatar")
      .populate("items.product", "name slug thumbnail price");

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    if (role !== Roles.ADMIN && String(order.user._id) !== String(userId)) {
      throw new ApiError(403, "You are not authorized to view this order.");
    }

    return new ApiResponse(200, order, "Order fetched successfully.");
  },

  /**
   * Update Order Status (Admin Only)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new ApiError(400, "Invalid order status.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    order.status = status;
    await order.save();

    return new ApiResponse(200, order, "Order status updated successfully.");
  },

  /**
   * Cancel Order (User or Admin)
   */
  async cancelOrder(orderId: string, userId: string, role: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    if (role !== Roles.ADMIN && String(order.user) !== String(userId)) {
      throw new ApiError(403, "You are not authorized to cancel this order.");
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new ApiError(400, "Completed orders cannot be cancelled.");
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return new ApiResponse(200, order, "Order cancelled successfully.");
  },
};
