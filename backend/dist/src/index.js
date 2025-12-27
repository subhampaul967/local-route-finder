"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./server/app");
const env_1 = require("./config/env");
// Node HTTP server wrapping the Express app. This makes it easy to plug in
// WebSockets or other protocols later if needed.
const server = (0, http_1.createServer)(app_1.app);
server.listen(env_1.env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend API running on http://localhost:${env_1.env.port}`);
});
