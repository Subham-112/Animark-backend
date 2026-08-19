import mongoose, { Schema, Document, Types } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import { OrderStatus } from "../common/enum";
import {
  ISoftDeleteDocument,
  ISoftDeleteModel,
} from "../types/softDelete.types";
import "./product.model";
import "./seller.model";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderDetails {
  customerName: string;
  youtubeChannelName: string;
  youtubeChannelUrl: string;
  notes?: string;
}

export interface IOrder extends Document, ISoftDeleteDocument {
  orderNumber: string;
  user: Types.ObjectId;
  seller?: Types.ObjectId;
  items: IOrderItem[];
  details: IOrderDetails;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderDetailsSchema = new Schema<IOrderDetails>(
  {
    customerName: { type: String, required: true, trim: true },
    youtubeChannelName: { type: String, required: true, trim: true },
    youtubeChannelUrl: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    details: {
      type: OrderDetailsSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
  },
  { timestamps: true },
);

OrderSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

export type OrderModel = ISoftDeleteModel<IOrder>;
export const Order = mongoose.model<IOrder, OrderModel>("Order", OrderSchema);
