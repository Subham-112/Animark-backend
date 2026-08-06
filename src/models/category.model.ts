import mongoose, { Schema, Document, Types } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import { CommonStatus } from "../common/enum";
import { IImage, ImageSchema } from "../common/image.schema";
import {
  ISoftDeleteDocument,
  ISoftDeleteModel,
} from "../types/softDelete.types";

export interface ICategory extends Document, ISoftDeleteDocument {
  name: string;
  slug: string;
  description?: string;
  image?: IImage;
  status: CommonStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
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
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: ImageSchema,
    },
    status: {
      type: String,
      enum: Object.values(CommonStatus),
      default: CommonStatus.ACTIVE,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

CategorySchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $ne: true } },
  },
);

CategorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

export type CategoryModel = ISoftDeleteModel<ICategory>;
export const Category = mongoose.model<ICategory, CategoryModel>(
  "Category",
  CategorySchema,
);
