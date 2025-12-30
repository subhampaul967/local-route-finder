import dotenv from "dotenv";

dotenv.config();

// Centralised environment configuration with sane defaults for development.

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: getEnv("JWT_SECRET", "dev_secret_change_me"),
  databaseUrl: getEnv("DATABASE_URL"),
  // Allow any origin during local development to avoid CORS issues
  // when frontend runs on different dev ports (3000, 3001, 3002...).
  // For development, allow the request origin to be reflected so credentials
  // and varying frontend dev ports (3000/3001/3002) work correctly.
  // `true` tells the `cors` middleware to reflect the request origin.
  corsOrigin:
    process.env.CORS_ORIGIN ?? (process.env.NODE_ENV === "development" ? true : "http://localhost:3000"),
};
