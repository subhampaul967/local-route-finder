"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const zod_1 = require("zod");
// 404 handler for unmatched routes.
const notFoundHandler = (_req, res) => {
    res.status(404).json({ error: "Not Found" });
};
exports.notFoundHandler = notFoundHandler;
// Central error handler to ensure consistent JSON error responses.
// It also unwraps Zod validation errors into a structured format.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "ValidationError",
            details: err.flatten(),
        });
    }
    if (err instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({
            error: "InternalServerError",
            message: err.message,
        });
    }
    return res.status(500).json({
        error: "UnknownError",
    });
};
exports.errorHandler = errorHandler;
