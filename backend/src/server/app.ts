import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../config/env";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler";
import { authRouter } from '../routes/authRoutes';
import { routesRouter } from '../routes/routesRoutes';
import { faresRouter } from '../routes/faresRoutes';
import locationRoutes from '../routes/locationRoutes';

const app = express();

// Basic security hardening
app.disable("x-powered-by");
app.use(helmet());

// CORS configuration to allow the Next.js frontend origin
// In development, reflect the request origin to support multiple dev ports
// (Next.js may run on 3000/3001/3002). In production, use configured origin.
const corsOptions =
  env.nodeEnv === "development"
    ? { origin: true, credentials: true }
    : { 
        origin: [
          "https://local-route-finder-frontend-fq6x.vercel.app",
          "https://local-route-finder-frontend-subhampaul967s-projects.vercel.app"
        ], 
        credentials: true 
      };

app.use(cors(corsOptions));

// Logging
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Body parsing with sensible limits for a small JSON API
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health check
app.get("/health", (req: Request, res: Response) => {
  console.log('🏥 Health check requested');
  try {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

// Test endpoint
app.get("/test", (req: Request, res: Response) => {
  console.log('🧪 Test endpoint requested');
  try {
    res.json({ 
      message: "Backend is working!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: !!process.env.DATABASE_URL
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ message: "Test failed" });
  }
});

// Root route for debugging
app.get("/", (req: Request, res: Response) => {
  console.log('🏠 Root route requested');
  try {
    res.json({ 
      message: "Local Route Finder Backend API",
      status: "running",
      version: "1.0.1",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Root route error:', error);
    res.status(500).json({ message: "API error" });
  }
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/routes", routesRouter);
app.use("/api/fares", faresRouter);
app.use("/fares", faresRouter);
app.use("/api/locations", locationRoutes);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
