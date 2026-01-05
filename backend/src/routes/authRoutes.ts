import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { parseBody, loginSchema, sendOTPSchema, verifyOTPSchema } from "../validation/schemas";
import { env } from "../config/env";
import { otpService } from "../services/otpService";

export const authRouter = Router();

// Send OTP endpoint
authRouter.post("/send-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📨 Received send-otp request');
    const { phone } = parseBody(sendOTPSchema, req.body);
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
    const otp = otpService.generateOTP();
    console.log(`🔢 Generated OTP: ${otp}`);
    
    console.log('📤 Sending OTP...');
    const sent = await otpService.sendOTP(phone, otp);
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
    const user = await prisma.user.upsert({
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
      await prisma.user.update({
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
  } catch (err: any) {
    console.error('❌ Send OTP error:', err);
    console.error('❌ Error stack:', err.stack);
    return next(err);
  }
});

// Verify OTP and login endpoint
authRouter.post("/verify-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = parseBody(verifyOTPSchema, req.body);

    // Verify OTP
    const isValid = otpService.verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(400).json({ 
        error: "Invalid or expired OTP. Please try again." 
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ 
        error: "User not found. Please request a new OTP." 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Legacy login endpoint for backward compatibility
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = parseBody(loginSchema, req.body);

    // For backward compatibility, auto-login with OTP "1234"
    const isValid = otpService.verifyOTP(phone, "1234");
    
    if (!isValid) {
      // Send OTP and ask user to verify
      const otp = otpService.generateOTP();
      await otpService.sendOTP(phone, otp);
      
      return res.status(400).json({ 
        error: "OTP verification required. Please use the new OTP flow.",
        requiresOTP: true,
        phone: phone,
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    }

    // Get or create user
    const isAdmin = phone === "1234567890";
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    if (isAdmin && user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    return next(err);
  }
});
