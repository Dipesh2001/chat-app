"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const upload = (folderName, allowedTypes) => {
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            const dir = path_1.default.join("uploads", folderName);
            fs_1.default.mkdirSync(dir, { recursive: true }); // Create folder if not exists
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueName + path_1.default.extname(file.originalname));
        },
    });
    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`));
        }
    };
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
        fileFilter,
    });
};
exports.upload = upload;
