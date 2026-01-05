"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const schemas_1 = require("../validation/schemas");
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
// Admin login endpoint
exports.authRouter.post("/admin/login", async (req, res, next) => {
    try {
        const { phone, password } = (0, schemas_1.parseBody)(schemas_1.loginSchema, req.body);
        // Check if user exists and is admin
        const user = await prisma_1.prisma.user.findUnique({
            where: { phone },
        });
        if (!user || user.role !== 'ADMIN') {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }
        // Simple password check (in production, use proper password hashing)
        // For now, using a simple admin password
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        if (password !== adminPassword) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            phone: user.phone,
            role: user.role
        }, env_1.env.jwtSecret, { expiresIn: '24h' });
        console.log(`✅ Admin login successful: ${phone}`);
        return res.json({
            message: "Admin login successful",
            token,
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
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
