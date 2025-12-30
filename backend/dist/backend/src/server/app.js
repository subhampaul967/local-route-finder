"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
const rateLimit_1 = require("../middleware/rateLimit");
const errorHandler_1 = require("../middleware/errorHandler");
const authRoutes_1 = require("../routes/authRoutes");
const routesRoutes_1 = require("../routes/routesRoutes");
const faresRoutes_1 = require("../routes/faresRoutes");
exports.app = (0, express_1.default)();
// Basic security hardening
exports.app.disable("x-powered-by");
exports.app.use((0, helmet_1.default)());
// CORS configuration to allow the Next.js frontend origin
// In development, reflect the request origin to support multiple dev ports
// (Next.js may run on 3000/3001/3002). In production, use configured origin.
const corsOptions = env_1.env.nodeEnv === "development"
    ? { origin: true, credentials: true }
    : { origin: env_1.env.corsOrigin, credentials: true };
exports.app.use((0, cors_1.default)(corsOptions));
// Logging
exports.app.use((0, morgan_1.default)(env_1.env.nodeEnv === "development" ? "dev" : "combined"));
// Body parsing with sensible limits for a small JSON API
exports.app.use(express_1.default.json({ limit: "1mb" }));
// Rate limiting
exports.app.use(rateLimit_1.generalLimiter);
exports.app.use("/auth/login", rateLimit_1.authLimiter);
// Health check
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// API routes
exports.app.use("/auth", authRoutes_1.authRouter);
exports.app.use("/routes", routesRoutes_1.routesRouter);
exports.app.use("/fares", faresRoutes_1.faresRouter);
// 404 + error handlers
exports.app.use(errorHandler_1.notFoundHandler);
exports.app.use(errorHandler_1.errorHandler);
