"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user-controller");
const user_validation_1 = require("../validations/user-validation");
const auth_1 = require("../middleware/auth");
const validate_request_1 = require("../middleware/validate-request");
const handleUploadError_1 = require("../middleware/handleUploadError");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.post("/register", (0, validate_request_1.validateRequest)(user_validation_1.registerUserSchema), user_controller_1.createUser);
router.post("/login", (0, validate_request_1.validateRequest)(user_validation_1.loginUserSchema), user_controller_1.loginUser);
router.put("/update/:id", (req, res, next) => {
    (0, upload_1.upload)("profile_images", ["image/jpg", "image/jpeg", "image/png"]).single("image")(req, res, function (err) {
        if (err) {
            return (0, handleUploadError_1.handleUploadError)(req, res, err);
        }
        next();
    });
}, (0, auth_1.auth)("user"), user_controller_1.updateUser);
router.get("/fetch", (0, auth_1.auth)("user"), user_controller_1.fetchUsers);
router.get("/logout", (0, auth_1.auth)("user"), user_controller_1.logoutUser);
router.get("/validate-auth", (0, auth_1.auth)("user"), user_controller_1.validateUserToken);
exports.default = router;
