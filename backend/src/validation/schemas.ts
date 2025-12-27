import { z } from "zod";
import { VehicleType } from "@prisma/client";

// Login schema: mock OTP flow, validates phone format.
export const loginSchema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9]{10,15}$/g, "Invalid phone number"),
  otp: z.string().optional(), // For now we accept any OTP and do not verify.
});

// Route search schema used for query parameters.
export const routeSearchSchema = z.object({
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
});

const viaPointSchema = z.object({
  name: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Schema for creating a new route submission.
// Frontend can either send explicit location IDs or human-friendly names.
export const createRouteSchema = z
  .object({
    fromLocationId: z.string().min(1).optional(),
    toLocationId: z.string().min(1).optional(),
    fromName: z.string().min(1).optional(),
    toName: z.string().min(1).optional(),
    vehicleType: z.nativeEnum(VehicleType),
    autoColor: z.string().min(1).max(50).optional(),
    via: z.array(viaPointSchema).optional(),
    // Optional initial fare range to help the community.
    minFare: z.number().int().nonnegative().optional(),
    maxFare: z.number().int().nonnegative().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data: any) =>
      (data.fromLocationId && data.toLocationId) ||
      (data.fromName && data.toName),
    {
      message:
        "Provide either location IDs or names for both 'from' and 'to' locations.",
      path: ["fromLocationId"],
    }
  );

// Schema for creating or updating fare information.
export const upsertFareSchema = z.object({
  id: z.string().optional(),
  routeId: z.string().min(1),
  minFare: z.number().int().nonnegative(),
  maxFare: z.number().int().nonnegative(),
  notes: z.string().max(500).optional(),
});

// Helper for parsing and validating query params with Zod.
export const parseQuery = <T extends z.ZodTypeAny>(
  schema: T,
  query: unknown
): z.infer<T> => {
  return schema.parse(query);
};

// Helper for parsing and validating bodies with Zod.
export const parseBody = <T extends z.ZodTypeAny>(schema: T, body: unknown) => {
  return schema.parse(body);
};
