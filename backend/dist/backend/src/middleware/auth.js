"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// Extracts and verifies a JWT from the Authorization header.
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "MissingAuthorization" });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = {
            id: decoded.sub,
            phone: decoded.phone,
            role: decoded.role,
        };
        return next();
    }
    catch {
        return res.status(401).json({ error: "InvalidToken" });
    }
};
exports.authenticate = authenticate;
// Ensures the user is authenticated.
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthenticated" });
    }
    return next();
};
exports.requireAuth = requireAuth;
// Restricts access to ADMIN users only.
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthenticated" });
    }
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
    }
    return next();
};
exports.requireAdmin = requireAdmin;
