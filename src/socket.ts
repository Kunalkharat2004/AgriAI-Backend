import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

// Types for socket events
interface SensorData {
  deviceId: string;
  moisture: number;
  temperature: number;
  timestamp: string;
}

interface MoistureAlert {
  deviceId: string;
  level: number;
  status: string;
  timestamp: string;
}

// Socket event types
interface ServerToClientEvents {
  deviceData: (data: any) => void;
  sensorAlert: (data: any) => void;
  order_updated: (data: any) => void;
  user_order_updated: (data: any) => void;
  new_order: (data: any) => void;
}

// Define valid event names type
type ValidEventName = keyof ServerToClientEvents;

interface ClientToServerEvents {
  subscribe: (deviceId: string) => void;
  unsubscribe: (deviceId: string) => void;
  updateSensor: (data: any) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents>;
let socketUtils: {
  emitOrderUpdate: (orderId: string, data: any, event?: ValidEventName) => void;
  emitUserOrderUpdate: (orderId: string, data: any) => void;
  emitNewOrder: (orderData: any) => void;
};

export const setupSocketIO = (server: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track connected clients
  const connectedClients: Map<string, Socket> = new Map();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Store the client connection
    connectedClients.set(socket.id, socket);

    // Handle device subscription
    socket.on("subscribe", (deviceId) => {
      console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
      socket.join(deviceId);
    });

    // Handle device unsubscription
    socket.on("unsubscribe", (deviceId) => {
      console.log(`Client ${socket.id} unsubscribed from device ${deviceId}`);
      socket.leave(deviceId);
    });

    // Handle sensor data updates
    socket.on("updateSensor", (data) => {
      console.log(`Received sensor update: ${JSON.stringify(data)}`);

      // If data includes a deviceId, emit to all clients subscribed to that device
      if (data.deviceId) {
        io.to(data.deviceId).emit("deviceData", data);

        // Check for alert conditions
        if (data.moisture !== undefined && data.moisture < 20) {
          io.to(data.deviceId).emit("sensorAlert", {
            type: "low_moisture",
            message: "Low soil moisture detected!",
            level: "warning",
            data: data,
          });
        }
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });
  });

  console.log("Socket.io server initialized");

  // Utility function to emit order updates to admins
  const emitOrderUpdate = (
    orderId: string,
    data: any,
    event: ValidEventName = "order_updated"
  ) => {
    io.to("admin_room").emit(event, data);
  };

  // Utility function to emit order updates to specific user and admins
  const emitUserOrderUpdate = (orderId: string, data: any) => {
    // Emit to admin
    io.to("admin_room").emit("order_updated", { orderId, ...data });

    // Emit to specific user if userId is provided
    if (data.userId) {
      io.to(`user_orders_${data.userId}`).emit("user_order_updated", {
        orderId,
        ...data,
      });
    }
  };

  // Utility function to emit new order notification
  const emitNewOrder = (orderData: any) => {
    io.to("admin_room").emit("new_order", orderData);
  };

  socketUtils = {
    emitOrderUpdate,
    emitUserOrderUpdate,
    emitNewOrder,
  };

  return {
    io,
    ...socketUtils,
  };
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error("Socket.io server not initialized");
  }
  return io;
};

// Emit event to all admin clients
export const emitAdminEvent = (event: ValidEventName, data: any) => {
  if (io) {
    io.to("admin_room").emit(event, data);
  }
};

// Re-export utility functions for direct import
export const emitOrderUpdate = (
  orderId: string,
  data: any,
  event: ValidEventName = "order_updated"
) => {
  if (!socketUtils) {
    console.error("Socket utilities not initialized");
    return;
  }
  socketUtils.emitOrderUpdate(orderId, data, event);
};

export const emitNewOrder = (orderData: any) => {
  if (!socketUtils) {
    console.error("Socket utilities not initialized");
    return;
  }
  socketUtils.emitNewOrder(orderData);
};

export const emitUserOrderUpdate = (orderId: string, data: any) => {
  if (!socketUtils) {
    console.error("Socket utilities not initialized");
    return;
  }
  socketUtils.emitUserOrderUpdate(orderId, data);
};
