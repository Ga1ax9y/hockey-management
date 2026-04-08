import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { AppError } from "../types/AppError";

export const errorHandler  = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError){
        logger.warn({
            name: err.name,
            httpCode: err.httpCode,
            message: err.message,
            url: req.originalUrl,
            method: req.method
        })

        return res.status(err.httpCode).json({
            error: err.name,
            message: err.message,
            context: err.context || null
        })
    }

    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    return res.status(500).json({
        error: "Неизвестная ошибка сервера",
    });
}
