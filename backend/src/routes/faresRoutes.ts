import { Router, type NextFunction, type Request, type Response } from "express";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";
import { detectFareAnomaly } from "../services/ai/fareAnomaly";
import { parseBody, upsertFareSchema } from "../validation/schemas";

export const faresRouter = Router();

// POST /fares - admin-only endpoint to create or update fare values.
// This powers the "Edit fare values" feature in the admin panel.
faresRouter.post(
  "/",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = parseBody(upsertFareSchema, req.body);

      const route = await prisma.route.findUnique({ where: { id: body.routeId } });
      if (!route) {
        return res.status(400).json({ error: "InvalidRoute" });
      }

      const anomaly = await detectFareAnomaly({
        routeId: body.routeId,
        minFare: body.minFare,
        maxFare: body.maxFare,
      });

      const fare = body.id
        ? await prisma.fare.update({
            where: { id: body.id },
            data: {
              minFare: body.minFare,
              maxFare: body.maxFare,
              notes: body.notes,
            },
          })
        : await prisma.fare.create({
            data: {
              routeId: body.routeId,
              minFare: body.minFare,
              maxFare: body.maxFare,
              notes: body.notes,
            },
          });

      return res.status(body.id ? 200 : 201).json({
        fare,
        ai: {
          fareAnomaly: anomaly,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);
