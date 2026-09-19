import { NextFunction, Request, Response } from "express";

export const appErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    console.log(err);

    if (res.headersSent) {
        return next(err);
    }

    // Known AppError with a valid numeric statusCode
    if (err && typeof err.statusCode === "number") {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return;
    }

    // Mongoose invalid ObjectId
    if (err && err.name === "CastError") {
        res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
        return;
    }

    // MongoDB duplicate key
    if (err && (err.code === 11000 || err.code === "11000")) {
        res.status(409).json({
            success: false,
            message: "Resource already exists"
        });
        return;
    }

    // Mongoose validation error
    if (err && err.name === "ValidationError") {
        res.status(400).json({
            success: false,
            message: err.message || "Validation failed"
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}