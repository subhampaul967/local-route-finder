"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
// Admin login endpoint
exports.authRouter.post("/admin/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }
        // Check admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminUsername || !adminPassword) {
            console.error('❌ Admin credentials not configured in environment');
            return res.status(500).json({ error: "Admin authentication not configured" });
        }
        // Validate credentials
        if (username !== adminUsername || password !== adminPassword) {
            console.log(`❌ Invalid admin login attempt: username=${username}`);
            return res.status(401).json({ error: "Invalid admin credentials" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            sub: 'admin',
            username: adminUsername,
            role: 'ADMIN'
        }, env_1.env.jwtSecret, { expiresIn: '24h' });
        console.log(`✅ Admin login successful: ${username}`);
        return res.json({
            message: "Admin login successful",
            token,
            user: {
                id: 'admin',
                username: adminUsername,
                role: 'ADMIN',
            }
        });
    }
    catch (err) {
        console.error('❌ Admin login error:', err);
        return next(err);
    }
});
// Verify admin token endpoint
exports.authRouter.get("/admin/verify", auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    return res.json({
        message: "Admin token valid",
        user: req.user
    });
});
