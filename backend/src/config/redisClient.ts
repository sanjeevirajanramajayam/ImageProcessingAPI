import redis from "redis";

const redisUrl = process.env.REDIS_URL || (process.env.NODE_ENV === "docker" ? "redis://redis:6379" : "redis://localhost:6379");
const redisClient = redis.createClient({ url: redisUrl });
await redisClient.connect();

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log(`Redis connected to ${redisUrl}`));

export { redisClient };
