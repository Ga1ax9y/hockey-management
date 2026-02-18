import type { Response, NextFunction } from "express";
export const checkRole = (allowedCodes: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({ error: "Не авторизован" });
        }

        const hasRole = allowedCodes.includes(user.role?.code)

        if (!hasRole){
            return res.status(403).json({
                error: "Доступ запрещен",
                description: "У вас недостаточно прав для выполнения этого действия"
            })
        }
        next()
    }
}
