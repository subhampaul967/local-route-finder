import { createServer } from "http";
import { app } from "./server/app";
import { env } from "./config/env";

// Node HTTP server wrapping the Express app. This makes it easy to plug in
// WebSockets or other protocols later if needed.

const server = createServer(app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API running on http://localhost:${env.port}`);
});
