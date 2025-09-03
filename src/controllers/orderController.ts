import { NextFunction, Request, Response } from "express";
import { CreateOrderRequestBody } from "../utils/orderTypes";
import Order from "../models/orderModel";
import { CustomError } from "../utils/error";
import { AuthRequest } from "../middlewares/authentication";
import { emitOrderUpdate, emitNewOrder } from "../socket";
import mongoose from "mongoose";

// Interface for Order document with proper typing
interface IOrderDocument extends mongoose.Document {
  status: string;
  _id: mongoose.Types.ObjectId;
  user: string;
  // Add other properties as needed
}

// Generate a unique order number
const generateOrderNumber = (): string => {
  const prefix = "AGR";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Received order request:", JSON.stringify(req.body, null, 2));
    console.log("User in request:", (req as AuthRequest).user);

    // Extract the data from the request body with flexible structure
    const {
      items,
      customerInfo,
      totalAmount,
      shippingInfo,
      paymentMethod,
      shippingMethod,
      subTotal,
      total,
    } = req.body;

    // Validate request body with support for both formats
    if (
      !items ||
      items.length === 0 ||
      (!customerInfo && !shippingInfo) ||
      (!totalAmount && !total && !subTotal)
    ) {
      throw new CustomError(
        "Please provide all required fields: items, shipping information, and total amount",
        400
      );
    }

    // Normalize shipping info format
    const shippingAddress = customerInfo || shippingInfo;

    // Check if shipping address has all required fields
    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      throw new CustomError(
        "Shipping address must include name, phone, address, city, state, and pincode",
        400
      );
    }

    // Normalize order items format
    const orderItems = items.map((item: any) => {
      // Create base order item without product field
      const orderItem: any = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image:
          item.image ||
          "https://via.placeholder.com/300x180?text=Product+Image",
      };

      // Only add product field if it's a valid MongoDB ObjectId string
      if (
        item.productId &&
        typeof item.productId === "string" &&
        mongoose.Types.ObjectId.isValid(item.productId)
      ) {
        orderItem.product = new mongoose.Types.ObjectId(item.productId);
      }
      // Don't include product field if it's a number or invalid ObjectId

      return orderItem;
    });

    console.log("Processed order items:", JSON.stringify(orderItems, null, 2));

    // Create the order object
    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      user: (req as AuthRequest).user.id,
      orderItems: orderItems,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod || "cod",
      shippingPrice: shippingMethod?.price || 60,
      totalPrice: totalAmount || total || subTotal,
      status: "pending",
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();
    console.log("Created new order:", JSON.stringify(savedOrder, null, 2));

    // Emit socket event for new order if available
    try {
      emitNewOrder(savedOrder);
    } catch (error) {
      console.log("Socket emission error (non-critical):", error);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
  }
};

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user.id;
    const userOrders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: userOrders.length,
      orders: userOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    console.log(`[getOrderById] Request for order ID: ${orderId}`);
    console.log(`[getOrderById] Auth headers:`, req.headers.authorization ? "Present" : "Missing");
    
    // Get user info from request
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id || authReq.user?._id;
    const userRole = authReq.user?.role;
    
    console.log(`[getOrderById] User ID: ${userId}, Role: ${userRole}`);
    
    if (!userId) {
      console.log(`[getOrderById] No user ID found in request`);
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    // Find the order in the database
    console.log(`[getOrderById] Finding order with ID: ${orderId}`);
    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`[getOrderById] Order not found with ID: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Convert order user ID to string for comparison
    const orderUserId = order.user.toString();
    console.log(`[getOrderById] Order user ID: ${orderUserId}, Request user ID: ${userId}`);

    // Check if the order belongs to the authenticated user or user is admin
    if (orderUserId !== userId && userRole !== "admin") {
      console.log(`[getOrderById] Access denied: User ${userId} tried to access order for user ${orderUserId}`);
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    console.log(`[getOrderById] Access granted, returning order`);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error(`[getOrderById] Error:`, error);
    next(error);
  }
};

/**
 * Get orders for the current user
 * @route GET /api/orders/user
 * @access Private
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    // Log request for debugging
    console.log("[getUserOrders] Request received");
    console.log("[getUserOrders] Auth header:", req.headers.authorization);
    
    // Get the authenticated user info
    const authReq = req as AuthRequest;
    console.log("[getUserOrders] Auth user:", JSON.stringify(authReq.user, null, 2));
    
    // Check if user exists in request
    if (!authReq.user) {
      console.log("[getUserOrders] No user found in request");
      return res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
    }
    
    // Get user ID from different possible locations
    const userId = authReq.user._id || authReq.user.id || authReq.user.userId;
    console.log("[getUserOrders] Extracted userId:", userId);

    if (!userId) {
      console.log("[getUserOrders] No valid user ID found");
      return res.status(401).json({
        status: "error",
        message: "User not authenticated - No user ID found",
      });
    }

    // Default pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log(`[getUserOrders] Query params: page=${page}, limit=${limit}, skip=${skip}`);
    console.log(`[getUserOrders] Looking for orders with user ID: ${userId}`);

    // Get orders for the user with pagination
    const totalItems = await Order.countDocuments({ user: userId });
    console.log(`[getUserOrders] Total orders found: ${totalItems}`);
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email name")
      .lean();

    console.log(`[getUserOrders] Orders retrieved: ${orders.length}`);

    // Add formatted orderNumber to each order if it doesn't exist
    const formattedOrders = orders.map((order: any) => {
      // If orderNumber already exists, use it, otherwise generate
      if (order.orderNumber) {
        return order;
      }
      return {
        ...order,
        orderNumber: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      };
    });

    return res.status(200).json({
      status: "success",
      data: formattedOrders,
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Cancel an order
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const authReq = req as AuthRequest;
    const userId = authReq.user._id;

    const order = (await Order.findOne({
      _id: orderId,
      user: userId,
    })) as IOrderDocument;

    if (!order) {
      throw new CustomError("Order not found", 404);
    }

    // Check if order can be cancelled
    if (order.status === "shipped" || order.status === "delivered") {
      throw new CustomError(
        "Cannot cancel an order that has already been shipped or delivered",
        400
      );
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    // Emit order update for admin dashboard - use a string version of the ID
    const orderIdString = order._id.toString();
    emitOrderUpdate(orderIdString, {
      status: "cancelled",
      orderId: orderIdString,
      userId: order.user,
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// Get admin order dashboard (for admins only)
export const getOrdersDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This should be protected by an admin middleware
    const pendingCount = await Order.countDocuments({ status: "pending" });
    const processingCount = await Order.countDocuments({
      status: "processing",
    });
    const shippedCount = await Order.countDocuments({ status: "shipped" });
    const deliveredCount = await Order.countDocuments({ status: "delivered" });
    const cancelledCount = await Order.countDocuments({ status: "cancelled" });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "email");

    res.status(200).json({
      status: "success",
      data: {
        counts: {
          pending: pendingCount,
          processing: processingCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          total:
            pendingCount +
            processingCount +
            shippedCount +
            deliveredCount +
            cancelledCount,
        },
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all orders with pagination and filtering (for admins only)
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email");

    res.status(200).json({
      status: "success",
      results: orders.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalItems: totalOrders,
        itemsPerPage: limit,
      },
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT/PATCH /api/orders/:id/status or /api/orders/admin/:id/status
// @access  Private (Admin only for admin route)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    console.log(`[updateOrderStatus] Request received - orderId: ${orderId}, status: ${status}`);
    console.log(`[updateOrderStatus] Request path: ${req.path}`);
    console.log(`[updateOrderStatus] Request method: ${req.method}`);

    if (!status) {
      console.log(`[updateOrderStatus] Error: No status provided in request body`);
      return res.status(400).json({
        success: false,
        message: "Please provide a status"
      });
    }

    // Find the order in the database
    console.log(`[updateOrderStatus] Finding order with ID: ${orderId}`);
    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`[updateOrderStatus] Error: Order not found with ID: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if the status is valid
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      console.log(`[updateOrderStatus] Error: Invalid status provided: ${status}`);
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
      });
    }

    // Check if there's any change
    if (order.status === status) {
      console.log(`[updateOrderStatus] No change in status, already: ${status}`);
      return res.status(200).json({
        success: true,
        message: "Order status unchanged",
        order: order
      });
    }

    // Update order status
    console.log(`[updateOrderStatus] Updating status from ${order.status} to ${status}`);
    order.status = status;
    
    // For delivered status, set deliveredAt
    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
      order.isDelivered = true;
    }
    
    // For cancelled status, set relevant fields
    if (status === "cancelled") {
      // Add any cancellation-specific logic here
    }

    // Save the updated order
    const updatedOrder = await order.save();
    console.log(`[updateOrderStatus] Order status updated successfully`);

    // Emit socket event for order update if available
    try {
      console.log(`[updateOrderStatus] Emitting socket event for order update`);
      emitOrderUpdate(orderId, {
        status: status,
        orderId: orderId,
        userId: order.user.toString(),
      });
    } catch (error) {
      console.log("Socket emission error (non-critical):", error);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error(`[updateOrderStatus] Error:`, error);
    next(error);
  }
};

/**
 * Get sales data for charts (last 7-30 days)
 * @route GET /api/orders/admin/sales
 * @access Admin only
 */
export const getSalesData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse query params (default to 7 days)
    const days = parseInt(req.query.days as string) || 7;
    
    // Calculate date range (last N days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Query orders in date range that are completed (delivered)
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["delivered", "shipped", "processing"] } // Include orders that contribute to revenue
    }).select('createdAt totalPrice');
    
    // Create a map of daily totals
    const dailyMap = new Map();
    const dailyCountMap = new Map();
    
    // Initialize all days in the range to 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyMap.set(dateString, 0);
      dailyCountMap.set(dateString, 0);
    }
    
    // Sum orders by day
    orders.forEach(order => {
      const dateString = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(dateString)) {
        dailyMap.set(dateString, dailyMap.get(dateString) + order.totalPrice);
        dailyCountMap.set(dateString, dailyCountMap.get(dateString) + 1);
      }
    });
    
    // Convert to arrays for response
    const labels = Array.from(dailyMap.keys());
    const sales = Array.from(dailyMap.values());
    const orderCounts = Array.from(dailyCountMap.values());
    
    res.status(200).json({
      status: 'success',
      data: {
        labels,
        sales,
        orders: orderCounts
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get product category distribution for the admin dashboard
 * @route GET /api/orders/admin/categories
 * @access Admin only
 */
export const getProductCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically aggregate order items by product category
    // For simplicity, we'll create mock data until this is fully implemented
    
    const categories = [
      { name: 'Vegetables', value: 45 },
      { name: 'Fruits', value: 30 },
      { name: 'Seeds', value: 15 },
      { name: 'Tools', value: 7 },
      { name: 'Other', value: 3 },
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (err) {
    next(err);
  }
};
