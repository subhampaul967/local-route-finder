import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { authenticate, requireAdmin } from "../middleware/auth";

export const authRouter = Router();

// Admin login endpoint
authRouter.post("/admin/login", async (req: Request, res: Response, next: NextFunction) => {
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
    const token = jwt.sign(
      { 
        sub: 'admin', 
        username: adminUsername, 
        role: 'ADMIN' 
      },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

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
