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
const otpService_1 = require("../services/otpService");
exports.authRouter = (0, express_1.Router)();
// Send OTP endpoint
exports.authRouter.post("/send-otp", async (req, res, next) => {
    try {
        console.log('📨 Received send-otp request');
        const { phone } = (0, schemas_1.parseBody)(schemas_1.sendOTPSchema, req.body);
        console.log(`📱 Processing OTP request for phone: ${phone}`);
        // Validate phone number (basic validation for Indian mobile numbers)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            console.log(`❌ Invalid phone number format: ${phone}`);
            return res.status(400).json({
                error: "Invalid phone number. Please enter a valid 10-digit Indian mobile number."
            });
        }
        // Generate and send OTP
        console.log('🔢 Generating OTP...');
        const otp = otpService_1.otpService.generateOTP();
        console.log(`🔢 Generated OTP: ${otp}`);
        console.log('📤 Sending OTP...');
        const sent = await otpService_1.otpService.sendOTP(phone, otp);
        console.log(`📤 OTP send result: ${sent}`);
        if (!sent) {
            console.log('❌ OTP send failed');
            return res.status(500).json({
                error: "Failed to send OTP. Please try again."
            });
        }
        console.log('✅ OTP sent successfully, creating/updating user...');
        // Create or update user
        const isAdmin = phone === "1234567890"; // Keep admin phone for testing
        const user = await prisma_1.prisma.user.upsert({
            where: { phone },
            update: {},
            create: {
                phone,
                role: isAdmin ? "ADMIN" : "USER",
            },
        });
        console.log(`✅ User created/updated: ${user.id}, role: ${user.role}`);
        // Ensure admin role for admin phone
        if (isAdmin && user.role !== "ADMIN") {
            console.log('👑 Updating user to admin role...');
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
            });
            console.log('✅ Admin role updated');
        }
        console.log('✅ Send OTP process completed successfully');
        return res.json({
            message: "OTP sent successfully",
            phone: phone,
            // In development, include OTP for testing
            otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
            development: process.env.NODE_ENV !== 'production'
        });
    }
    catch (err) {
        console.error('❌ Send OTP error:', err);
        console.error('❌ Error stack:', err.stack);
        return next(err);
    }
});
// Verify OTP and login endpoint
exports.authRouter.post("/verify-otp", async (req, res, next) => {
    try {
        const { phone, otp } = (0, schemas_1.parseBody)(schemas_1.verifyOTPSchema, req.body);
        // Verify OTP
        const isValid = otpService_1.otpService.verifyOTP(phone, otp);
        if (!isValid) {
            return res.status(400).json({
                error: "Invalid or expired OTP. Please try again."
            });
        }
        // Get user
        const user = await prisma_1.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            return res.status(404).json({
                error: "User not found. Please request a new OTP."
            });
        }
        // Generate JWT token
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
// Legacy login endpoint for backward compatibility
exports.authRouter.post("/login", async (req, res, next) => {
    try {
        const { phone } = (0, schemas_1.parseBody)(schemas_1.loginSchema, req.body);
        // For backward compatibility, auto-login with OTP "1234"
        const isValid = otpService_1.otpService.verifyOTP(phone, "1234");
        if (!isValid) {
            // Send OTP and ask user to verify
            const otp = otpService_1.otpService.generateOTP();
            await otpService_1.otpService.sendOTP(phone, otp);
            return res.status(400).json({
                error: "OTP verification required. Please use the new OTP flow.",
                requiresOTP: true,
                phone: phone,
                ...(process.env.NODE_ENV !== 'production' && { otp })
            });
        }
        // Get or create user
        const isAdmin = phone === "1234567890";
        const user = await prisma_1.prisma.user.upsert({
            where: { phone },
            update: {},
            create: {
                phone,
                role: isAdmin ? "ADMIN" : "USER",
            },
        });
        if (isAdmin && user.role !== "ADMIN") {
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
            });
        }
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
