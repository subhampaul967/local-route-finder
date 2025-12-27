"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../validation/schemas");
const dtoMapper_1 = require("../utils/dtoMapper");
const placeNormalization_1 = require("../services/ai/placeNormalization");
const routeValidation_1 = require("../services/ai/routeValidation");
exports.routesRouter = (0, express_1.Router)();
// GET /routes?from=&to=
// Public search endpoint used by the frontend to find approved routes between
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
// Requires authentication. Creates a PENDING route tied to the submitting user.
exports.routesRouter.post("/", auth_1.authenticate, auth_1.requireAuth, async (req, res, next) => {
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
// Admin-only: view all pending routes.
exports.routesRouter.get("/pending", auth_1.authenticate, auth_1.requireAdmin, async (_req, res, next) => {
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
// Admin-only: approve a route.
exports.routesRouter.patch("/:id/approve", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
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
// Admin-only: reject a route.
exports.routesRouter.patch("/:id/reject", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
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
