"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const helper_1 = require("../helper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (role) => {
    return async (req, res, next) => {
        try {
            const authData = req.cookies.validateUserToken || req.cookies.validateAdminToken; // Check both cookies
            if (!authData) {
                return (0, helper_1.errorResponse)(res, "Access denied", {}, 401);
            }
            else {
                const token = JSON.parse(authData)?.authToken;
                const jwtSecret = process.env.JWT_SECRET || "";
                jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
                    if (err || !decoded)
                        return (0, helper_1.errorResponse)(res, "Invalid token", {}, 401);
                    if (role === "user" && decoded.user) {
                        req.user = decoded.user;
                    }
                    else {
                        if (!role) {
                            if (decoded.user) {
                                req.user = decoded.user;
                            }
                        }
                        else {
                            return (0, helper_1.errorResponse)(res, "You do not have access for this action.", {}, 403);
                        }
                    }
                    req.authToken = token; // Pass the token in the request
                    next();
                });
            }
        }
        catch (error) {
            (0, helper_1.errorResponse)(res, "Error while validating user/admin", {});
        }
    };
};
exports.auth = auth;
