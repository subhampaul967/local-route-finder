"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faresRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const fareAnomaly_1 = require("../services/ai/fareAnomaly");
const schemas_1 = require("../validation/schemas");
exports.faresRouter = (0, express_1.Router)();
// POST /fares - admin-only endpoint to create or update fare values.
// This powers the "Edit fare values" feature in the admin panel.
exports.faresRouter.post("/", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const body = (0, schemas_1.parseBody)(schemas_1.upsertFareSchema, req.body);
        const route = await prisma_1.prisma.route.findUnique({ where: { id: body.routeId } });
        if (!route) {
            return res.status(400).json({ error: "InvalidRoute" });
        }
        const anomaly = await (0, fareAnomaly_1.detectFareAnomaly)({
            routeId: body.routeId,
            minFare: body.minFare,
            maxFare: body.maxFare,
        });
        const fare = body.id
            ? await prisma_1.prisma.fare.update({
                where: { id: body.id },
                data: {
                    minFare: body.minFare,
                    maxFare: body.maxFare,
                    notes: body.notes,
                },
            })
            : await prisma_1.prisma.fare.create({
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
    }
    catch (err) {
        return next(err);
    }
});
