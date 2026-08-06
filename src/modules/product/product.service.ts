import { Product } from "../../models/product.model";
import { Seller } from "../../models/seller.model";
import { Category } from "../../models/category.model";
import { CommonStatus, ProductOwnerType, Roles } from "../../common/enum";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { IImage } from "../../common/image.schema";
import cloudinaryService from "../../services/cloudinary/cloudinary.service";

export interface CreateProductPayload {
  name: string;
  description?: string;
  category: string;
  price: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  status?: CommonStatus;
  tags?: string[];
  metadata?: Record<string, any>;
}

export const generateUniqueProductSlug = async (name: string) => {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let count = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};

export const ProductService = {
  /**
   * Create Product
   */
  async createProduct(
    userId: string,
    role: string,
    payload: CreateProductPayload,
    thumbnail?: IImage,
    gallery: IImage[] = [],
  ) {
    const { name, description, category, price, tags, metadata } = payload;

    let ownerType: ProductOwnerType = ProductOwnerType.SYSTEM;
    let ownerId: string | undefined = undefined;

    if (role === Roles.ADMIN) {
      ownerType = ProductOwnerType.SYSTEM;
    } else {
      ownerType = ProductOwnerType.OWNER;
      const seller = await Seller.findOne({ user: userId });
      if (!seller) {
        throw new ApiError(404, "Seller profile not found for this user.");
      }
      ownerId = String(seller._id);
    }

    const slug = await generateUniqueProductSlug(name);

    console.log(
      `⏳ [Product Service] Creating product in MongoDB... Time: ${new Date().toISOString()}`,
    );

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description?.trim(),
      category,
      owner: ownerId,
      ownerType,
      price,
      thumbnail,
      gallery,
      tags: tags || [],
      metadata: metadata || {},
      status: CommonStatus.ACTIVE,
    });

    console.log(
      `✅ [Product Service] Product created in MongoDB! ID: ${product._id} | Time: ${new Date().toISOString()}`,
    );

    return new ApiResponse(201, product, "Product created successfully.");
  },

  /**
   * Get All Products
   */
  async getAllProducts(query: any) {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.category) filter.category = query.category;
    if (query.owner) filter.owner = query.owner;
    if (query.ownerType) filter.ownerType = query.ownerType;
    if (query.status) filter.status = query.status;

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { tags: { $in: [new RegExp(query.search, "i")] } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("owner", "displayName slug image")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    return new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products fetched successfully.",
    );
  },

  /**
   * Get Product By ID
   */
  async getProductById(id: string) {
    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("owner", "displayName slug image");

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return new ApiResponse(200, product, "Product fetched successfully.");
  },

  /**
   * Update Product
   */
  async updateProduct(
    id: string,
    userId: string,
    role: string,
    payload: UpdateProductPayload,
    newThumbnail?: IImage,
    newGallery: IImage[] = [],
  ) {
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (role !== Roles.ADMIN) {
      const seller = await Seller.findOne({ user: userId });
      if (!seller || String(product.owner) !== String(seller._id)) {
        throw new ApiError(403, "You are not authorized to update this product.");
      }
    }

    if (payload.name && payload.name.trim() !== product.name) {
      product.name = payload.name.trim();
      product.slug = await generateUniqueProductSlug(payload.name);
    }

    if (payload.description !== undefined) product.description = payload.description.trim();
    if (payload.category !== undefined) product.category = payload.category as any;
    if (payload.price !== undefined) product.price = payload.price;
    if (payload.status !== undefined) product.status = payload.status;
    if (payload.tags !== undefined) product.tags = payload.tags;
    if (payload.metadata !== undefined) product.metadata = payload.metadata;

    if (newThumbnail) {
      if (product.thumbnail?.publicId) {
        await cloudinaryService.deleteImage(product.thumbnail.publicId);
      }
      product.thumbnail = newThumbnail;
    }

    if (newGallery.length > 0) {
      product.gallery = [...product.gallery, ...newGallery];
    }

    await product.save();

    return new ApiResponse(200, product, "Product updated successfully.");
  },

  /**
   * Toggle Product Status (Active / Inactive)
   */
  async toggleProductStatus(id: string, userId: string, role: string) {
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (role !== Roles.ADMIN) {
      const seller = await Seller.findOne({ user: userId });
      if (!seller || String(product.owner) !== String(seller._id)) {
        throw new ApiError(403, "You are not authorized to modify this product status.");
      }
    }

    product.status =
      product.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await product.save();

    return new ApiResponse(
      200,
      product,
      `Product status updated to ${product.status}.`,
    );
  },

  /**
   * Delete Product
   */
  async deleteProduct(id: string, userId: string, role: string) {
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (role !== Roles.ADMIN) {
      const seller = await Seller.findOne({ user: userId });
      if (!seller || String(product.owner) !== String(seller._id)) {
        throw new ApiError(403, "You are not authorized to delete this product.");
      }
    }

    await product.delete();

    return new ApiResponse(200, null, "Product deleted successfully.");
  },
};
