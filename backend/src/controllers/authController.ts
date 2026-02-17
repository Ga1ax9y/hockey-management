import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { AuthRequest } from "../middlewares/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register  = async (req: Request, res: Response) => {
    try {
        const {email, password, fullName, roleId} = req.body
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser){
            return res.status(400).json({ error: "email уже занят"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                email,
                fullName,
                passwordHash: hashedPassword,
                roleId: Number(roleId)
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                roleId: true,
                createdAt: true
            }
        })

        res.status(201).json(newUser)
    } catch (error: any) {
        console.error("Ошибка при регистрации:", error);
        res.status(500).json({ error: "Не удалось создать пользователя" });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({
            where: {email},
            include: {role: true}
        });

        if (!user) {
            return res.status(401).json({ error: "Неверный почтовый адрес или пароль"})
        }

        const isPasswordValid = bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Неверный почтовый адрес или пароль"})
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                roleId: user.roleId
            },
            JWT_SECRET,
            {expiresIn: "7d"}

        );

        res.json({
            message: "Вход выполнен успешно",
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name
            }
        })
    }
    catch (error: any){
        console.error("Ошибка авторизации:", error);
        res.status(500).json({ error: "Ошибка сервера при входе" });
    }
}

export const getMe = async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.user?.id

        if (!userId){
        return res.status(401).json({error: "Пользователь не авторизован"})
        }
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!user){
            return res.status(404).json({error: "Пользователь не найден"})
        }
        res.json(user)
    }
    catch(error: any){
        res.status(500).json({ error: "Ошибка сервера" });
    }
}
