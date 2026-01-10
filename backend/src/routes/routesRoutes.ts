import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";
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

// Admin routes - require authentication
routesRouter.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 Admin routes request received');
      console.log('🔍 Database connected:', !!prisma);
      
      const routes = (await prisma.route.findMany({
        include: {
          fromLocation: true,
          toLocation: true,
          fares: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })) as RouteWithRelations[];

      console.log('📊 Found routes:', routes.length);
      console.log('📊 Routes data:', routes.map(r => ({ id: r.id, from: r.fromLocation.name, to: r.toLocation.name, status: r.status })));

      return res.json({ 
        routes: routes.map(mapRouteToDTO),
        totalRoutes: routes.length 
      });
    } catch (err: any) {
      console.error('❌ Admin routes error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack
      });
      return res.status(500).json({ 
        error: "Failed to load routes",
        details: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
      });
    }
  }
);

// GET /city - get all routes in selected city
routesRouter.get(
  "/city",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get city from query parameter (default to Kolkata if not provided)
      const city = (req.query.city as string) || "Kolkata";

      // Find locations in the selected city
      const cityLocations = await prisma.location.findMany({
        where: {
          name: {
            contains: city,
            mode: "insensitive",
          },
        },
      });

      if (!cityLocations.length) {
        return res.json({ routes: [], city, message: `No locations found for ${city}` });
      }

      const locationIds = cityLocations.map((l: any) => l.id);

      // Get all routes (both from and to locations in the city)
      const routes = (await prisma.route.findMany({
        where: {
          OR: [
            {
              fromLocationId: { in: locationIds },
            },
            {
              toLocationId: { in: locationIds },
            },
          ],
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

      return res.json({ 
        routes: routes.map(mapRouteToDTO), 
        city,
        totalRoutes: routes.length 
      });
    } catch (err) {
      return next(err);
    }
  }
);

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
// Create route - authentication removed for open access
routesRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 Route submission request received');
      console.log('🔍 Request body:', req.body);
      console.log('🔍 User info:', req.user);
      
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
          submissions: req.user?.id ? {
            create: {
              userId: req.user.id,
              status: "PENDING",
            },
          } : undefined,
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
    } catch (err: any) {
      console.error('❌ Route creation error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack
      });
      return res.status(500).json({ 
        error: "Failed to create route",
        details: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
      });
    }
  }
);

// View pending routes - require admin authentication
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

// Approve route - require admin authentication
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

// Delete route - require admin authentication
routesRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log('DELETE route request for ID:', id);
      console.log('User:', (req as any).user);

      // First check if route exists
      const route = await prisma.route.findUnique({
        where: { id },
        include: { 
          fares: true,
          fromLocation: true,
          toLocation: true,
        },
      });

      if (!route) {
        console.log('Route not found:', id);
        return res.status(404).json({ error: "Route not found" });
      }

      console.log('Found route to delete:', route.fromLocation.name, '→', route.toLocation.name);

      // Delete the route (fares will be deleted due to cascade)
      await prisma.route.delete({
        where: { id },
      });

      console.log('Route deleted successfully:', id);

      return res.json({ 
        message: "Route deleted successfully",
        deletedRoute: mapRouteToDTO(route as RouteWithRelations)
      });
    } catch (err) {
      console.error('Delete route error:', err);
      return next(err);
    }
  }
);

// Cleanup recent approved routes - require admin authentication
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

// Reject route - require admin authentication
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
