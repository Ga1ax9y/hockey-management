type HttpCode = 200 | 300 | 404 | 500
export const commonErrorDict = {
    resourceNotFound: {
        name: "Resource not found",
        httpCode: 404 as HttpCode
    },
    unauthorized: {
        name: "Unauthorized",
        httpCode: 401 as HttpCode
    },
    badRequest: {
        name: "Bad request",
        httpCode: 400 as HttpCode
    },
    serverError: {
        name: "Server error",
        httpCode: 500 as HttpCode
    }
}

export class AppError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpCode;
    public readonly context?: string;

    constructor(name: string, httpCode: HttpCode, message: string, context?: string){
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)

        this.name = name
        this.httpCode = httpCode
        if (context) this.context = context

        Error.captureStackTrace(this)

    }
}
