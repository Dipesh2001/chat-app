import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  validateUserToken,
  fetchUsers,
  updateUser,
} from "../controllers/user-controller";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validations/user-validation";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import { handleUploadError } from "../middleware/handleUploadError";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/register", validateRequest(registerUserSchema), createUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);
router.put(
  "/update/:id",
  (req, res, next) => {
    upload("profile_images", ["image/jpg", "image/jpeg", "image/png"]).single(
      "image"
    )(req, res, function (err) {
      if (err) {
        return handleUploadError(req, res, err);
      }
      next();
    });
  },
  auth("user"),
  updateUser
);
router.get("/fetch", auth("user"), fetchUsers);
router.get("/logout", auth("user"), logoutUser);
router.get("/validate-auth", auth("user"), validateUserToken);

export default router;
