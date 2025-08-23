import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../helper";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { IUser } from "../models/user-model";

export interface authRequest extends Request {
  user?: JwtPayload | IUser;
  authToken?: string;
}

export const auth = (role?: "admin" | "user") => {
  return async (req: authRequest, res: Response, next: NextFunction) => {
    try {
      const authData =
        req.cookies.validateUserToken || req.cookies.validateAdminToken; // Check both cookies
      if (!authData) {
        return errorResponse(res, "Access denied", {}, 401);
      } else {
        const token = JSON.parse(authData)?.authToken;
        const jwtSecret = process.env.JWT_SECRET || "";

        jwt.verify(
          token,
          jwtSecret,
          (err: VerifyErrors | null, decoded: any) => {
            if (err || !decoded)
              return errorResponse(res, "Invalid token", {}, 401);

            if (role === "user" && decoded.user) {
              req.user = decoded.user as IUser;
            } else {
              if (!role) {
                if (decoded.user) {
                  req.user = decoded.user as IUser;
                }
              } else {
                return errorResponse(
                  res,
                  "You do not have access for this action.",
                  {},
                  403
                );
              }
            }

            req.authToken = token; // Pass the token in the request
            next();
          }
        );
      }
    } catch (error) {
      errorResponse(res, "Error while validating user/admin", {});
    }
  };
};
