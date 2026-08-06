import { Category } from "../../models/category.model";
import { CommonStatus } from "../../common/enum";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { IImage } from "../../common/image.schema";
import cloudinaryService from "../../services/cloudinary/cloudinary.service";

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  status?: CommonStatus;
}

export const generateUniqueCategorySlug = async (name: string) => {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let count = 1;

  while (await Category.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};

export const CategoryService = {
  /**
   * Create Category (Admin Only)
   */
  async createCategory(
    adminId: string,
    payload: CreateCategoryPayload,
    image?: IImage,
  ) {
    const { name, description } = payload;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      throw new ApiError(409, "Category with this name already exists.");
    }

    const slug = await generateUniqueCategorySlug(name);

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim(),
      image,
      createdBy: adminId,
      status: CommonStatus.ACTIVE,
    });

    return new ApiResponse(201, category, "Category created successfully.");
  },

  /**
   * Get All Categories (Authenticated Users/Admins)
   */
  async getAllCategories(query: any) {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate("createdBy", "username email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Category.countDocuments(filter),
    ]);

    return new ApiResponse(
      200,
      {
        categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Categories fetched successfully.",
    );
  },

  /**
   * Get Category By ID or Slug (Authenticated Users/Admins)
   */
  async getCategoryById(idOrSlug: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const category = await Category.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() },
    ).populate("createdBy", "username email");

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    return new ApiResponse(200, category, "Category fetched successfully.");
  },

  /**
   * Update Category (Admin Only)
   */
  async updateCategory(
    id: string,
    payload: UpdateCategoryPayload,
    newImage?: IImage,
  ) {
    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    if (payload.name && payload.name.trim() !== category.name) {
      const existingName = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${payload.name.trim()}$`, "i") },
      });

      if (existingName) {
        throw new ApiError(409, "Category with this name already exists.");
      }

      category.name = payload.name.trim();
      category.slug = await generateUniqueCategorySlug(payload.name);
    }

    if (payload.description !== undefined) {
      category.description = payload.description.trim();
    }

    if (payload.status !== undefined) {
      category.status = payload.status;
    }

    if (newImage) {
      if (category.image?.publicId) {
        await cloudinaryService.deleteImage(category.image.publicId);
      }
      category.image = newImage;
    }

    await category.save();

    return new ApiResponse(200, category, "Category updated successfully.");
  },

  /**
   * Toggle Category Status Active/Inactive (Admin Only)
   */
  async toggleCategoryStatus(id: string) {
    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    category.status =
      category.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await category.save();

    return new ApiResponse(
      200,
      category,
      `Category status updated to ${category.status}.`,
    );
  },

  /**
   * Delete Category Soft Delete (Admin Only)
   */
  async deleteCategory(id: string, adminId: string) {
    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    await category.delete(adminId);

    return new ApiResponse(200, null, "Category soft deleted successfully.");
  },
};
