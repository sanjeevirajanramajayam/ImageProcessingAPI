import redis from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = redis.createClient({ url: redisUrl });
await redisClient.connect();

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log(`Redis connected to ${redisUrl}`));

export { redisClient };

