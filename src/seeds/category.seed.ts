import { Mongoose } from "../config/database";
import { Category } from "../models/category.model";
import Admin from "../models/admin.model";
import { CommonStatus } from "../common/enum";

const seedCategories = async () => {
  try {
    console.log("⏳ Connecting to Database...");
    await Mongoose.connect()

    // Find system admin for category seeding
    let systemAdmin = await Admin.findOne({ email: "info@animark.in" });
    if (!systemAdmin) {
      console.log("ℹ️ No admin found. Aborting category seeding.");
      process.exit(1);
    }

    const categoriesToSeed = [
      {
        name: "Characters",
        slug: "characters",
        description: "Anime, cartoon, and 3D character assets",
        status: CommonStatus.ACTIVE,
        createdBy: systemAdmin._id,
      },
      {
        name: "Backgrounds",
        slug: "backgrounds",
        description: "Environments, landscapes, and background scenery",
        status: CommonStatus.ACTIVE,
        createdBy: systemAdmin._id,
      },
      {
        name: "Animations",
        slug: "animations",
        description: "2D and 3D animation clips, motion graphics, and rigs",
        status: CommonStatus.ACTIVE,
        createdBy: systemAdmin._id,
      },
    ];

    console.log("🌱 Seeding Categories...");

    for (const cat of categoriesToSeed) {
      const existingCategory = await Category.findOne({
        $or: [{ name: cat.name }, { slug: cat.slug }],
      });

      if (existingCategory) {
        console.log(`ℹ️ Category "${cat.name}" already exists. Skipping...`);
      } else {
        await Category.create(cat);
        console.log(`✅ Category "${cat.name}" created successfully.`);
      }
    }

    console.log("🎉 Category seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during category seeding:", error);
    process.exit(1);
  }
};

seedCategories();
