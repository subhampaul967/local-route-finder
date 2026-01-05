"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const schemas_1 = require("../validation/schemas");
const dtoMapper_1 = require("../utils/dtoMapper");
const placeNormalization_1 = require("../services/ai/placeNormalization");
const routeValidation_1 = require("../services/ai/routeValidation");
exports.routesRouter = (0, express_1.Router)();
// Admin routes - authentication removed for open access
exports.routesRouter.get("/admin/all", async (_req, res, next) => {
    try {
        const routes = (await prisma_1.prisma.route.findMany({
            include: {
                fromLocation: true,
                toLocation: true,
                fares: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }));
        return res.json({
            routes: routes.map(dtoMapper_1.mapRouteToDTO),
            totalRoutes: routes.length
        });
    }
    catch (err) {
        return next(err);
    }
});
// GET /city - get all routes in selected city
exports.routesRouter.get("/city", async (req, res, next) => {
    try {
        // Get city from query parameter (default to Kolkata if not provided)
        const city = req.query.city || "Kolkata";
        // Find locations in the selected city
        const cityLocations = await prisma_1.prisma.location.findMany({
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
        const locationIds = cityLocations.map((l) => l.id);
        // Get all routes (both from and to locations in the city)
        const routes = (await prisma_1.prisma.route.findMany({
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
        }));
        return res.json({
            routes: routes.map(dtoMapper_1.mapRouteToDTO),
            city,
            totalRoutes: routes.length
        });
    }
    catch (err) {
        return next(err);
    }
});
// GET /search - dedicated search endpoint for frontend
exports.routesRouter.get("/search", async (req, res, next) => {
    try {
        const { from, to } = (0, schemas_1.parseQuery)(schemas_1.routeSearchSchema, req.query);
        const [fromNorm, toNorm] = await Promise.all([
            (0, placeNormalization_1.normalizePlaceName)(from),
            (0, placeNormalization_1.normalizePlaceName)(to),
        ]);
        const [fromLocations, toLocations] = await Promise.all([
            prisma_1.prisma.location.findMany({
                where: {
                    name: {
                        contains: fromNorm.normalized,
                        mode: "insensitive",
                    },
                },
            }),
            prisma_1.prisma.location.findMany({
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
        const fromIds = fromLocations.map((l) => l.id);
        const toIds = toLocations.map((l) => l.id);
        const routes = (await prisma_1.prisma.route.findMany({
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
        }));
        return res.json({ routes: routes.map(dtoMapper_1.mapRouteToDTO) });
    }
    catch (err) {
        return next(err);
    }
});
// GET /routes?from=&to=
// Public search endpoint used by frontend to find approved routes between
// two locations. It performs a simple name-based search and returns route DTOs.
exports.routesRouter.get("/", async (req, res, next) => {
    try {
        const { from, to } = (0, schemas_1.parseQuery)(schemas_1.routeSearchSchema, req.query);
        const [fromNorm, toNorm] = await Promise.all([
            (0, placeNormalization_1.normalizePlaceName)(from),
            (0, placeNormalization_1.normalizePlaceName)(to),
        ]);
        const [fromLocations, toLocations] = await Promise.all([
            prisma_1.prisma.location.findMany({
                where: {
                    name: {
                        contains: fromNorm.normalized,
                        mode: "insensitive",
                    },
                },
            }),
            prisma_1.prisma.location.findMany({
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
        const fromIds = fromLocations.map((l) => l.id);
        const toIds = toLocations.map((l) => l.id);
        const routes = (await prisma_1.prisma.route.findMany({
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
        }));
        return res.json({ routes: routes.map(dtoMapper_1.mapRouteToDTO) });
    }
    catch (err) {
        return next(err);
    }
});
// POST /routes - user submission for a new route.
// Create route - authentication removed for open access
exports.routesRouter.post("/", async (req, res, next) => {
    try {
        const body = (0, schemas_1.parseBody)(schemas_1.createRouteSchema, req.body);
        // Resolve or create locations from either IDs or human-friendly names.
        const resolveLocation = async (id, name) => {
            if (id) {
                const existing = await prisma_1.prisma.location.findUnique({ where: { id } });
                if (!existing) {
                    throw new Error("InvalidLocationId");
                }
                return existing;
            }
            if (name) {
                const normalized = await (0, placeNormalization_1.normalizePlaceName)(name);
                return prisma_1.prisma.location.upsert({
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
        const validation = await (0, routeValidation_1.validateRouteCandidate)({
            fromLocationId: fromLocation.id,
            toLocationId: toLocation.id,
            vehicleType: body.vehicleType,
            autoColor: body.autoColor,
        });
        const route = (await prisma_1.prisma.route.create({
            data: {
                fromLocationId: fromLocation.id,
                toLocationId: toLocation.id,
                vehicleType: body.vehicleType,
                autoColor: body.autoColor,
                via: body.via ?? [],
                status: "PENDING",
                fares: body.minFare !== undefined && body.maxFare !== undefined
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
                        userId: req.user.id,
                        status: "PENDING",
                    },
                },
            },
            include: {
                fromLocation: true,
                toLocation: true,
                fares: true,
            },
        }));
        return res.status(201).json({
            route: (0, dtoMapper_1.mapRouteToDTO)(route),
            ai: {
                routeValidation: validation,
            },
        });
    }
    catch (err) {
        return next(err);
    }
});
// View pending routes - authentication removed
exports.routesRouter.get("/pending", async (_req, res, next) => {
    try {
        const routes = (await prisma_1.prisma.route.findMany({
            where: { status: "PENDING" },
            include: {
                fromLocation: true,
                toLocation: true,
                fares: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        }));
        return res.json({ routes: routes.map(dtoMapper_1.mapRouteToDTO) });
    }
    catch (err) {
        return next(err);
    }
});
// Approve route - authentication removed
exports.routesRouter.patch("/:id/approve", async (req, res, next) => {
    try {
        const { id } = req.params;
        const route = await prisma_1.prisma.route.update({
            where: { id },
            data: { status: "APPROVED" },
            include: {
                fromLocation: true,
                toLocation: true,
                fares: true,
            },
        });
        await prisma_1.prisma.submission.updateMany({
            where: { routeId: id },
            data: { status: "APPROVED" },
        });
        return res.json({ route: (0, dtoMapper_1.mapRouteToDTO)(route) });
    }
    catch (err) {
        return next(err);
    }
});
// Delete route - authentication removed
exports.routesRouter.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('DELETE route request for ID:', id);
        console.log('User:', req.user);
        // First check if route exists
        const route = await prisma_1.prisma.route.findUnique({
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
        await prisma_1.prisma.route.delete({
            where: { id },
        });
        console.log('Route deleted successfully:', id);
        return res.json({
            message: "Route deleted successfully",
            deletedRoute: (0, dtoMapper_1.mapRouteToDTO)(route)
        });
    }
    catch (err) {
        console.error('Delete route error:', err);
        return next(err);
    }
});
// Cleanup recent approved routes - authentication removed
exports.routesRouter.delete("/cleanup/recent-approved", async (_req, res, next) => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const result = await prisma_1.prisma.route.deleteMany({
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
    }
    catch (err) {
        return next(err);
    }
});
// Reject route - authentication removed
exports.routesRouter.patch("/:id/reject", async (req, res, next) => {
    try {
        const { id } = req.params;
        const route = await prisma_1.prisma.route.update({
            where: { id },
            data: { status: "REJECTED" },
            include: {
                fromLocation: true,
                toLocation: true,
                fares: true,
            },
        });
        await prisma_1.prisma.submission.updateMany({
            where: { routeId: id },
            data: { status: "REJECTED" },
        });
        return res.json({ route: (0, dtoMapper_1.mapRouteToDTO)(route) });
    }
    catch (err) {
        return next(err);
    }
});
