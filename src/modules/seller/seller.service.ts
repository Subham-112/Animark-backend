import mongoose, { ClientSession } from "mongoose";
import { SellerStatus } from "../../common/enum";
import { Seller } from "../../models/seller.model";
import { User } from "../../models/user.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import {
  SellerApplyPayload,
  UpdateSellerProfilePayload,
} from "../../types/auth.type";

export const generateUniqueSellerSlug = async (
  displayName: string,
  session: ClientSession,
) => {
  const baseSlug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let count = 1;

  while (await Seller.findOne({ slug }).session(session)) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};

export const SellerService = {
  async apply(userId: string, payload: SellerApplyPayload) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { displayName, bio, socialLinks } = payload;

      const existingSeller = await Seller.findOne({
        user: userId,
      }).session(session);

      if (existingSeller) {
        throw new ApiError(
          409,
          "You have already submitted a seller application.",
        );
      }

      const user = await User.findById(userId).session(session);

      if (!user) {
        throw new ApiError(404, "User not found.");
      }

      if (!user.isEmailVerified) {
        throw new ApiError(
          403,
          "Please verify your email before applying as a seller.",
        );
      }

      const slug = await generateUniqueSellerSlug(displayName, session);

      const seller = await Seller.create(
        [
          {
            user: user._id,
            displayName: displayName.trim(),
            slug,
            bio: bio?.trim() || "",
            socialLinks,
            status: SellerStatus.PENDING,
          },
        ],
        { session },
      );

      user.isSeller = true;
      await user.save({ session });

      await session.commitTransaction();

      return new ApiResponse(
        201,
        seller[0],
        "Seller application submitted successfully. Please wait for admin approval.",
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async currentUser(userId: string) {
    const seller = await Seller.findOne({ user: userId })
      .populate({
        path: "user",
        select: "firstName lastName email mobile avatar",
      })
      .lean();

    if (!seller) {
      return new ApiResponse(
        200,
        {
          isSeller: false,
        },
        "Seller profile not found.",
      );
    }

    return new ApiResponse(
      200,
      {
        isSeller: true,
        seller: {
          id: seller._id,
          displayName: seller.displayName,
          slug: seller.slug,
          bio: seller.bio,
          image: seller.image,
          socialLinks: seller.socialLinks,
          status: seller.status,
          user: seller.user,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
        },
      },
      "Seller profile fetched successfully.",
    );
  },

  async updateProfile(userId: string, payload: UpdateSellerProfilePayload) {
    const seller = await Seller.findOne({ user: userId });

    if (!seller) {
      throw new ApiError(404, "Seller profile not found.");
    }

    if (payload.displayName) {
      seller.displayName = payload.displayName.trim();
    }

    if (payload.bio !== undefined) {
      seller.bio = payload.bio.trim();
    }

    if (payload.image !== undefined) {
      seller.image = payload.image;
    }

    if (payload.socialLinks) {
      seller.socialLinks = {
        ...seller.socialLinks,
        ...payload.socialLinks,
      };
    }

    await seller.save();

    return new ApiResponse(200, seller, "Seller profile updated successfully.");
  },

  async getPublicProfile(slug: string) {
    const seller = await Seller.findOne({
      slug: slug.toLowerCase(),
      status: SellerStatus.ACTIVE,
    })
      .populate({
        path: "user",
        select: "firstName lastName avatar",
      })
      .lean();

    if (!seller) {
      throw new ApiError(404, "Seller not found.");
    }

    return new ApiResponse(
      200,
      {
        seller,
      },
      "Seller profile fetched successfully.",
    );
  },
};
