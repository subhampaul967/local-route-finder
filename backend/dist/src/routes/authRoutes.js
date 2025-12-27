"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const schemas_1 = require("../validation/schemas");
const env_1 = require("../config/env");
exports.authRouter = (0, express_1.Router)();
// Mock OTP login endpoint.
// In production you would integrate with an SMS provider and verify the OTP.
exports.authRouter.post("/login", async (req, res, next) => {
    try {
        const { phone } = (0, schemas_1.parseBody)(schemas_1.loginSchema, req.body);
        // Upsert user by phone number. New users are regular USERs by default.
        const user = await prisma_1.prisma.user.upsert({
            where: { phone },
            update: {},
            create: {
                phone,
                role: "USER",
            },
        });
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            phone: user.phone,
            role: user.role,
        }, env_1.env.jwtSecret, { expiresIn: "7d" });
        return res.json({
            token,
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
                name: user.name,
            },
        });
    }
    catch (err) {
        return next(err);
    }
});
