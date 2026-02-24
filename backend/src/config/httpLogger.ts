import morgan from "morgan";
import { logger } from "./logger";

const stream = {
    write: (message: string) => {
        logger.info(message.trim())
    }
}

export const httpLogger =  morgan("combined", { stream})
