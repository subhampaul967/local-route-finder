"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Centralised environment configuration with sane defaults for development.
const getEnv = (key, defaultValue) => {
    const value = process.env[key] ?? defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required env var ${key}`);
    }
    return value;
};
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: parseInt(process.env.PORT ?? "4000", 10),
    jwtSecret: getEnv("JWT_SECRET", "dev_secret_change_me"),
    databaseUrl: getEnv("DATABASE_URL"),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
