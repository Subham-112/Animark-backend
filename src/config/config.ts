import path from "path";
import dotenv from "dotenv";

dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "../../.env"),
});

const toBool = (value: string | undefined): boolean => value === "true";

export const config = {
  env: process.env.NODE_ENV || "production",
  port: Number(process.env.PORT) || 8080,

  cors: {
    enabled: toBool(process.env.CORS_ENABLED),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
  },

  db: {
    url: process.env.DB_URL!,
    name: process.env.DB_NAME!,
  },

  jwt: {
    accessMaxAge: Number(process.env.ACCESS_MAX_AGE!) || 7,
    refreshMaxAge: Number(process.env.REFRESH_MAX_AGE!) || 30,
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "30d",
  },

  security: {
    ips: process.env.BLOCKED_IPS?.split(",") || [],
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 60), // 60 req/min per session
    rateLimitEnabled: toBool(process.env.RATE_LIMIT_ENABLED),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000), // 1 minute window
  },

  resend: {
    api: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "",
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },

  client: {
    url: process.env.CLIENT_URL
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};
