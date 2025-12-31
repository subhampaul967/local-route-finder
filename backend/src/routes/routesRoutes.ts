import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin, requireAuth } from "../middleware/auth";
import {
  createRouteSchema,
  parseBody,
  parseQuery,
  routeSearchSchema,
} from "../validation/schemas";
import { mapRouteToDTO, type RouteWithRelations } from "../utils/dtoMapper";
import { normalizePlaceName } from "../services/ai/placeNormalization";
import { validateRouteCandidate } from "../services/ai/routeValidation";

export const routesRouter = Router();

// GET /search - dedicated search endpoint for frontend
routesRouter.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = parseQuery(routeSearchSchema, req.query);

      const [fromNorm, toNorm] = await Promise.all([
        normalizePlaceName(from),
        normalizePlaceName(to),
      ]);

      const [fromLocations, toLocations] = await Promise.all([
        prisma.location.findMany({
          where: {
            name: {
              contains: fromNorm.normalized,
              mode: "insensitive",
            },
          },
        }),
        prisma.location.findMany({
          where: {
            name: {
              contains: toNorm.normalized,
              mode: "insensitive",
            },
          },
        }),
      ]);

      if (!fromLocations.length || !toLocations.length) {
        return res.json({ routes: [] });
      }

      const fromIds = fromLocations.map((l: any) => l.id);
      const toIds = toLocations.map((l: any) => l.id);

      const routes = (await prisma.route.findMany({
        where: {
          fromLocationId: { in: fromIds },
          toLocationId: { in: toIds },
          status: "APPROVED",
        },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })) as RouteWithRelations[];

      return res.json({ routes: routes.map(mapRouteToDTO) });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /routes?from=&to=
// Public search endpoint used by frontend to find approved routes between
// two locations. It performs a simple name-based search and returns route DTOs.
routesRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = parseQuery(routeSearchSchema, req.query);

      const [fromNorm, toNorm] = await Promise.all([
        normalizePlaceName(from),
        normalizePlaceName(to),
      ]);

      const [fromLocations, toLocations] = await Promise.all([
        prisma.location.findMany({
          where: {
            name: {
              contains: fromNorm.normalized,
              mode: "insensitive",
            },
          },
        }),
        prisma.location.findMany({
          where: {
            name: {
              contains: toNorm.normalized,
              mode: "insensitive",
            },
          },
        }),
      ]);

      if (!fromLocations.length || !toLocations.length) {
        return res.json({ routes: [] });
      }

      const fromIds = fromLocations.map((l: any) => l.id);
      const toIds = toLocations.map((l: any) => l.id);

      const routes = (await prisma.route.findMany({
        where: {
          fromLocationId: { in: fromIds },
          toLocationId: { in: toIds },
          status: "APPROVED",
        },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })) as RouteWithRelations[];

      return res.json({ routes: routes.map(mapRouteToDTO) });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /routes - user submission for a new route.
// Requires authentication. Creates a PENDING route tied to the submitting user.
routesRouter.post(
  "/",
  authenticate,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = parseBody(createRouteSchema, req.body);

      // Resolve or create locations from either IDs or human-friendly names.
      const resolveLocation = async (
        id: string | undefined,
        name: string | undefined
      ) => {
        if (id) {
          const existing = await prisma.location.findUnique({ where: { id } });
          if (!existing) {
            throw new Error("InvalidLocationId");
          }
          return existing;
        }

        if (name) {
          const normalized = await normalizePlaceName(name);
          return prisma.location.upsert({
            where: { name: normalized.normalized },
            update: {},
            create: {
              name: normalized.normalized,
              type: "LANDMARK",
            },
          });
        }

        throw new Error("MissingLocation");
      };

      const [fromLocation, toLocation] = await Promise.all([
        resolveLocation(body.fromLocationId, body.fromName),
        resolveLocation(body.toLocationId, body.toName),
      ]);

      const validation = await validateRouteCandidate({
        fromLocationId: fromLocation.id,
        toLocationId: toLocation.id,
        vehicleType: body.vehicleType,
        autoColor: body.autoColor,
      });

      const route = (await prisma.route.create({
        data: {
          fromLocationId: fromLocation.id,
          toLocationId: toLocation.id,
          vehicleType: body.vehicleType,
          autoColor: body.autoColor,
          via: body.via ?? [],
          status: "PENDING",
          fares:
            body.minFare !== undefined && body.maxFare !== undefined
              ? {
                  create: {
                    minFare: body.minFare,
                    maxFare: body.maxFare,
                    notes: body.notes,
                  },
                }
              : undefined,
          submissions: {
            create: {
              userId: req.user!.id,
              status: "PENDING",
            },
          },
        },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
      })) as RouteWithRelations;

      return res.status(201).json({
        route: mapRouteToDTO(route),
        ai: {
          routeValidation: validation,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

// Admin-only: view all pending routes.
routesRouter.get(
  "/pending",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const routes = (await prisma.route.findMany({
        where: { status: "PENDING" },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      })) as RouteWithRelations[];

      return res.json({ routes: routes.map(mapRouteToDTO) });
    } catch (err) {
      return next(err);
    }
  }
);

// Admin-only: approve a route.
routesRouter.patch(
  "/:id/approve",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const route = await prisma.route.update({
        where: { id },
        data: { status: "APPROVED" },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
      });

      await prisma.submission.updateMany({
        where: { routeId: id },
        data: { status: "APPROVED" },
      });

      return res.json({ route: mapRouteToDTO(route as RouteWithRelations) });
    } catch (err) {
      return next(err);
    }
  }
);

// Admin-only: delete routes approved in last 24 hours (TEMPORARY CLEANUP)
routesRouter.delete(
  "/cleanup/recent-approved",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const result = await prisma.route.deleteMany({
        where: {
          status: "APPROVED",
          updatedAt: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      return res.json({ 
        message: `Deleted ${result.count} routes approved in the last 24 hours`,
        deletedCount: result.count 
      });
    } catch (err) {
      return next(err);
    }
  }
);

// Admin-only: reject a route.
routesRouter.patch(
  "/:id/reject",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const route = await prisma.route.update({
        where: { id },
        data: { status: "REJECTED" },
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
      });

      await prisma.submission.updateMany({
        where: { routeId: id },
        data: { status: "REJECTED" },
      });

      return res.json({ route: mapRouteToDTO(route as RouteWithRelations) });
    } catch (err) {
      return next(err);
    }
  }
);
