import { PrismaClient } from "@prisma/client";

// Single PrismaClient instance for the entire backend.
// In development we attach it to the global scope to avoid hot-reload issues.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
