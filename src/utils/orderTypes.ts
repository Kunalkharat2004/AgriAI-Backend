import { Document } from "mongoose";

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
}

export interface IOrder extends Document {
  user: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: "cod" | "upi" | "card";
  shippingMethod: ShippingMethod;
  subTotal: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequestBody {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  shippingMethod: ShippingMethod;
  subTotal: number;
  total: number;
  status: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}
