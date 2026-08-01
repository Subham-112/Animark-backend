import mongoose, { Schema, Document, Types } from "mongoose";
import { ProductOwnerType, CommonStatus } from "../common/enum";
import { IImage, ImageSchema } from "../common/image.schema";
import {
  ISoftDeleteDocument,
  ISoftDeleteModel,
} from "../types/softDelete.types";
import MongooseDelete from "mongoose-delete";

interface IRating {
  avgRating: number;
  totalReviews: number;
}

interface IProduct extends Document, ISoftDeleteDocument {
  name: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  owner: Types.ObjectId;
  ownerType: ProductOwnerType;
  price: number;
  status: CommonStatus;
  thumbnail: IImage;
  gallery: IImage[];
  rating: IRating;
  totalSales: number;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>({
  avgRating: { type: Number },
  totalReviews: { type: Number },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: { type: String },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: false,
      index: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(ProductOwnerType),
      required: true,
      default: ProductOwnerType.SYSTEM,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(CommonStatus),
      default: CommonStatus.ACTIVE,
      index: true,
    },

    thumbnail: { type: ImageSchema },
    gallery: { type: [ImageSchema], default: [] },

    rating: { type: RatingSchema, default: () => ({}) },
    totalSales: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

/**
 * Indexes
 */
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ owner: 1 });
ProductSchema.index({ ownerType: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ tags: 1 });

ProductSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

export type ProductModel = ISoftDeleteModel<IProduct>;
export const Product = mongoose.model<IProduct, ProductModel>(
  "Product",
  ProductSchema,
);
