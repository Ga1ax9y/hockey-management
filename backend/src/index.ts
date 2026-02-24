import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { AppError } from "./types/AppError.js";
import { httpLogger } from "./config/httpLogger.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { logger } from "./config/logger.js";
const app = express();
const PORT = process.env.DATABASE_PORT || 4000;

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
    process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
    logger.error("Unhandled Rejection", { reason });
    process.exit(1);
});

app.use(cors())
app.use(express.json())
app.use(httpLogger)
app.get('/', (req, res) => {
    res.json({message: "Welcome to the API"});
})
app.use('/api/v1', apiRouter);

app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
