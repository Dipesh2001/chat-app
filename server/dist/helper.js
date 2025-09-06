"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatImagePath = exports.toNumber = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
// Error Response
const errorResponse = (res, message, errors = {}, statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.errorResponse = errorResponse;
const toNumber = (value, defaultValue) => typeof value === "string" ? parseInt(value, 10) : defaultValue;
exports.toNumber = toNumber;
const formatImagePath = (relativePath) => {
    if (!relativePath)
        return "";
    const baseUrl = process.env.BASE_URL || "http://localhost:8000";
    const cleanedPath = relativePath
        .replace(/^.*uploads/, "/uploads")
        .replace(/\\/g, "/");
    return `${baseUrl}${cleanedPath}`;
};
exports.formatImagePath = formatImagePath;
