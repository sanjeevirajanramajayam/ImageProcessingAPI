import redis from "redis";

const redisClient = redis.createClient({ url: "redis://redis:6379" });
await redisClient.connect();

export { redisClient };
