import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

// Extracts and verifies a JWT from the Authorization header.
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "MissingAuthorization" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      sub: string;
      phone: string;
      role: UserRole;
    };

    req.user = {
      id: decoded.sub,
      phone: decoded.phone,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "InvalidToken" });
  }
};

// Ensures the user is authenticated.
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  return next();
};

// Restricts access to ADMIN users only.
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};
