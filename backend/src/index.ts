import { app } from "./server/app";
import { env } from "./config/env";

const PORT = env.port || 4000;

console.log('🚀 Starting Local Route Finder Backend...');
console.log(`📋 Port: ${PORT}`);
console.log(`📋 Environment: ${env.nodeEnv}`);
console.log(`📋 Database URL: ${env.databaseUrl ? 'SET' : 'NOT SET'}`);
console.log(`📋 JWT Secret: ${env.jwtSecret ? 'SET' : 'NOT SET'}`);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API base: http://localhost:${PORT}/api`);
});
