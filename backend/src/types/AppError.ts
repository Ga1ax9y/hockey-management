type HttpCode = 200 | 300 | 404 | 500
export const commonErrorDict = {
    resourceNotFound: {
        name: "Resource not found",
        httpCode: 404 as HttpCode
    }
}

export class AppError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpCode;

    constructor(name: string, httpCode: HttpCode, message: string){
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)

        this.name = name
        this.httpCode = httpCode

        Error.captureStackTrace(this)

    }
}
