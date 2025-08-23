"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUploadedFile = exports.handleUploadError = void 0;
const fs_1 = __importDefault(require("fs"));
const handleUploadError = async (req, res, err) => {
    (0, exports.removeUploadedFile)(req);
    res.status(400).json({
        success: false,
        data: {},
        message: err.message || "File upload error",
    });
};
exports.handleUploadError = handleUploadError;
const removeUploadedFile = (req) => {
    if (req.file && req.file.path) {
        fs_1.default.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting uploaded file:", unlinkErr);
            }
        });
    }
};
exports.removeUploadedFile = removeUploadedFile;
