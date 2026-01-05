import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { authenticate, requireAdmin } from "../middleware/auth";

export const authRouter = Router();

// Admin login endpoint
authRouter.post("/admin/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔐 Admin login request received');
    console.log('🔍 Request body:', req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    console.log('🔍 Environment check:');
    console.log('🔍 ADMIN_USERNAME exists:', !!adminUsername);
    console.log('🔍 ADMIN_PASSWORD exists:', !!adminPassword);
    
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
    
    const response = {
      message: "Admin login successful",
      token,
      user: {
        id: 'admin',
        username: adminUsername,
        role: 'ADMIN',
      }
    };
    
    console.log('🔍 Sending response:', JSON.stringify(response, null, 2));
    
    return res.json(response);
  } catch (err: any) {
    console.error('❌ Admin login error:', err);
    console.error('❌ Error stack:', err.stack);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// Verify admin token endpoint
authRouter.get("/admin/verify", authenticate, requireAdmin, async (req: Request, res: Response) => {
  return res.json({
    message: "Admin token valid",
    user: req.user
  });
});
