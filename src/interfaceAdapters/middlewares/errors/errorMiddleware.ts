import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/errors/AppError.js";
import { RepositoryError } from "../../../shared/errors/RepositoryError.js";
import { Logger } from "../../../shared/logger/Logger.js";
export const errorMiddleware = (logger:Logger)=>(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {

  //Expected application errors
  if (err instanceof AppError) {
    logger.warn("Application Error",{
         
        message: err.message,
        statusCode: err.statusCode,
        isOperational: err.isOperational,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  //  Repository errors
  if (err instanceof RepositoryError) {
    logger.error("RepositoryError leaked to middleware", {
         
        originalError: err.originalError,
    });

    console.error("RepositoryError leaked to middleware", {
      originalError: err.originalError,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  // Unknown / programming errors
  console.error("Unhandled error:", err);
  logger.error("Unhandled error", {
       
      error: err,
    });


  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
