"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = exports.parseQuery = exports.upsertFareSchema = exports.createRouteSchema = exports.routeSearchSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Login schema: mock OTP flow, validates phone format.
exports.loginSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .min(10)
        .max(15)
        .regex(/^[0-9]{10,15}$/g, "Invalid phone number"),
    otp: zod_1.z.string().optional(), // For now we accept any OTP and do not verify.
});
// Route search schema used for query parameters.
exports.routeSearchSchema = zod_1.z.object({
    from: zod_1.z.string().min(1, "From is required"),
    to: zod_1.z.string().min(1, "To is required"),
});
const viaPointSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
});
// Schema for creating a new route submission.
// Frontend can either send explicit location IDs or human-friendly names.
exports.createRouteSchema = zod_1.z
    .object({
    fromLocationId: zod_1.z.string().min(1).optional(),
    toLocationId: zod_1.z.string().min(1).optional(),
    fromName: zod_1.z.string().min(1).optional(),
    toName: zod_1.z.string().min(1).optional(),
    vehicleType: zod_1.z.nativeEnum(client_1.VehicleType),
    autoColor: zod_1.z.string().min(1).max(50).optional(),
    via: zod_1.z.array(viaPointSchema).optional(),
    // Optional initial fare range to help the community.
    minFare: zod_1.z.number().int().nonnegative().optional(),
    maxFare: zod_1.z.number().int().nonnegative().optional(),
    notes: zod_1.z.string().max(500).optional(),
})
    .refine((data) => (data.fromLocationId && data.toLocationId) ||
    (data.fromName && data.toName), {
    message: "Provide either location IDs or names for both 'from' and 'to' locations.",
    path: ["fromLocationId"],
});
// Schema for creating or updating fare information.
exports.upsertFareSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    routeId: zod_1.z.string().min(1),
    minFare: zod_1.z.number().int().nonnegative(),
    maxFare: zod_1.z.number().int().nonnegative(),
    notes: zod_1.z.string().max(500).optional(),
});
// Helper for parsing and validating query params with Zod.
const parseQuery = (schema, query) => {
    return schema.parse(query);
};
exports.parseQuery = parseQuery;
// Helper for parsing and validating bodies with Zod.
const parseBody = (schema, body) => {
    return schema.parse(body);
};
exports.parseBody = parseBody;
