import { CorsOptions } from "cors";
import { config } from "../config/config";

export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, Postman, curl, payment gateway callbacks)
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`[CORS BLOCKED] Origin: ${origin}`);
      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed.`)
      );
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 204,
};
