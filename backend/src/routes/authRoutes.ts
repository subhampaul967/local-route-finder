import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../config/prisma";
import { parseBody, loginSchema } from "../validation/schemas";
import { env } from "../config/env";
import jwt from "jsonwebtoken";
import { authenticate, requireAdmin } from "../middleware/auth";

export const authRouter = Router();

// Admin login endpoint
authRouter.post("/admin/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = parseBody(loginSchema, req.body);
    
    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
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
    const token = jwt.sign(
      { 
        sub: user.id, 
        phone: user.phone, 
        role: user.role 
      },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

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
  } catch (err: any) {
    console.error('❌ Admin login error:', err);
    return next(err);
  }
});

// Verify admin token endpoint
authRouter.get("/admin/verify", authenticate, requireAdmin, async (req: Request, res: Response) => {
  return res.json({
    message: "Admin token valid",
    user: req.user
  });
});
