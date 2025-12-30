import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../config/env";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler";
import { authRouter } from "../routes/authRoutes";
import { routesRouter } from "../routes/routesRoutes";
import { faresRouter } from "../routes/faresRoutes";

const app = express();

// Basic security hardening
app.disable("x-powered-by");
app.use(helmet());

// CORS configuration to allow the Next.js frontend origin
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

// Logging
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Body parsing with sensible limits for a small JSON API
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/routes", routesRouter);
app.use("/api/fares", faresRouter);
app.use("/fares", faresRouter);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);
