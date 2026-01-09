"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./server/app");
const env_1 = require("./config/env");
const PORT = env_1.env.port || 4000;
console.log('🚀 Starting Local Route Finder Backend...');
console.log(`📋 Port: ${PORT}`);
console.log(`📋 Environment: ${env_1.env.nodeEnv}`);
console.log(`📋 Database URL: ${env_1.env.databaseUrl ? 'SET' : 'NOT SET'}`);
console.log(`📋 JWT Secret: ${env_1.env.jwtSecret ? 'SET' : 'NOT SET'}`);
app_1.app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API base: http://localhost:${PORT}/api`);
});
