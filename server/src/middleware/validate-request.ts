import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateRequest(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next(); // Continue to the controller if validation passes
    } catch (error) {
      console.log({error})
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: {},
        //   empty errors for now cause of errors
        //   error.errors.map(err => ({
        //     field: err.path.join("."),
        //     message: err.message == "Required" ? `${err.path.join(".")} is required` : err.message,
        //   }))
        });
      } else {
        next(error); // Pass to the global error handler if it's another error
      }
    }
  };
}