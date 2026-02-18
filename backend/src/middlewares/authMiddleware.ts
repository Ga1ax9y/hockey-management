import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: {
            code: string;
            name: string;
        };
    };
}
export default async function authMiddleware (req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "Требуется авторизация" });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Требуется авторизация" });
    }
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
        console.error("JWT_SECRET не определен в .env");
        return res.status(500).json({ error: "Ошибка настройки сервера" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as {id: number};
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            include: {
                role: true
            }
        })
        if (!user || !user.isActive) {
            return res.status(401).json({ error: "Пользователь не найден или заблокирован" });
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(401).json({ error: "Неверный или просроченный токен" });
    }
}
