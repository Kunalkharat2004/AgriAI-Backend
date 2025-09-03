import { config } from "./config/config";
import { app } from "./app";
import connectDB from "./config/db";
import http from "http";
import { setupSocketIO } from "./socket";

const main = async () => {
  const PORT = config.port || 3300;
  console.log("PORT is this->:", PORT);

  await connectDB();

  console.log(config.mongoURI);

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io server
  setupSocketIO(server);

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io server is ready for connections`);
  });
};

main();
