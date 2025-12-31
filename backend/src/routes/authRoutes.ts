import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { parseBody, loginSchema } from "../validation/schemas";
import { env } from "../config/env";

export const authRouter = Router();

// Mock OTP login endpoint.
// In production you would integrate with an SMS provider and verify the OTP.
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = parseBody(loginSchema, req.body);

    // Check if this is the admin phone number
    const isAdmin = phone === "1234567890";

    // Upsert user by phone number. New users are regular USERs by default.
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    // If this is the admin phone but user wasn't created as admin, update it
    if (isAdmin && user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      user.role = "ADMIN";
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
