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
const locationRoutes_1 = __importDefault(require("../routes/locationRoutes"));
const app = (0, express_1.default)();
exports.app = app;
// Basic security hardening
app.disable("x-powered-by");
app.use((0, helmet_1.default)());
// CORS configuration to allow the Next.js frontend origin
// In development, reflect the request origin to support multiple dev ports
// (Next.js may run on 3000/3001/3002). In production, use configured origin.
const corsOptions = env_1.env.nodeEnv === "development"
    ? { origin: true, credentials: true }
    : { origin: env_1.env.corsOrigin, credentials: true };
app.use((0, cors_1.default)(corsOptions));
// Logging
app.use((0, morgan_1.default)(env_1.env.nodeEnv === "development" ? "dev" : "combined"));
// Body parsing with sensible limits for a small JSON API
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
app.use(rateLimit_1.rateLimitMiddleware);
// Health check
app.get("/health", (req, res) => {
    console.log('🏥 Health check requested');
    try {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({ status: "error", message: "Health check failed" });
    }
});
// Test endpoint
app.get("/test", (req, res) => {
    console.log('🧪 Test endpoint requested');
    try {
        res.json({
            message: "Backend is working!",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: !!process.env.DATABASE_URL
        });
    }
    catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ message: "Test failed" });
    }
});
// Root route for debugging
app.get("/", (req, res) => {
    console.log('🏠 Root route requested');
    try {
        res.json({
            message: "Local Route Finder Backend API",
            status: "running",
            version: "1.0.1",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Root route error:', error);
        res.status(500).json({ message: "API error" });
    }
});
// API routes
app.use("/api/auth", authRoutes_1.authRouter);
app.use("/api/routes", routesRoutes_1.routesRouter);
app.use("/api/fares", faresRoutes_1.faresRouter);
app.use("/fares", faresRoutes_1.faresRouter);
app.use("/api/locations", locationRoutes_1.default);
// 404 + error handlers
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
