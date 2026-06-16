import { redisClient } from "./config/redisClient";
import { logError } from "./utils/errorHandler";
import app from "./app";

const PORT = parseInt(process.env.PORT || "4000", 10);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  logError("Server startup", err);
  process.exit(1);
});
