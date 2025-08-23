import { Response } from "express";

export const successResponse = (
  res: Response,
  message: string,
  data: any = {},
  statusCode: number = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error Response
export const errorResponse = (
  res: Response,
  message: string,
  errors: any = {},
  statusCode: number = 500,
) => {
   res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const formatImagePath = (relativePath: string | undefined | null): string => {
  if (!relativePath) return "";
  const baseUrl = process.env.BASE_URL || "http://localhost:8000";
  const cleanedPath = relativePath.replace(/^.*uploads/, "/uploads").replace(/\\/g, "/");
  return `${baseUrl}${cleanedPath}`;
};
