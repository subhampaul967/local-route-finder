import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { parseBody, loginSchema } from "../validation/schemas";
import { env } from "../config/env";

export const authRouter = Router();

// Temporary endpoint to create admin user (REMOVE IN PRODUCTION)
authRouter.post("/create-admin", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone is required" });
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: "ADMIN" },
      create: {
        phone,
        role: "ADMIN",
      },
    });

    return res.json({ message: "Admin user created", user });
  } catch (err) {
    return next(err);
  }
});

// Mock OTP login endpoint.
// In production you would integrate with an SMS provider and verify the OTP.
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = parseBody(loginSchema, req.body);

    // Upsert user by phone number. New users are regular USERs by default.
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        role: "USER",
      },
    });

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
