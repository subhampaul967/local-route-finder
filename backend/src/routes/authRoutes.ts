import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { parseBody, loginSchema } from "../validation/schemas";
import { env } from "../config/env";

export const authRouter = Router();

export { authRouter };

// Mock OTP login endpoint.
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
