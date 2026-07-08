import IORedis, { RedisOptions } from "ioredis";
import { config } from "./config";
import { logger } from "./logger";

const redisConfig: RedisOptions = {
  host: config.redis.host || "127.0.0.1",
  port: Number(config.redis.port) || 6379,

  ...(process.env.REDIS_PASSWORD && {
    password: process.env.REDIS_PASSWORD,
  }),

  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redisConnection = new IORedis(redisConfig);

redisConnection.on("connect", () => {
  logger.info("🟢 Redis Connected");
});

redisConnection.on("ready", () => {
  logger.info("🚀 Redis Ready");
});

redisConnection.on("error", (error) => {
  logger.error("🔴 Redis Error:", error);
});

redisConnection.on("close", () => {
  logger.warn("🟡 Redis Connection Closed");
});

export default redisConnection;
