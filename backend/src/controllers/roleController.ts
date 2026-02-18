import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllRoles = async (req: Request, res: Response) => {
    try{
        const roles = await prisma.role.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                createdAt: true,
                updatedAt: true

            }
        })
        res.json(roles)
    }
    catch(error: any){
        res.status(500).json({
            error: error.message,
            description: "Ошибка при получении ролей"
         });
    }
}

export const getRoleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const role = await prisma.role.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                createdAt: true,
                updatedAt: true

            }
        })
        res.json(role)
    }
    catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при получении роли по id"
         });

    }
}

export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, code, description} = req.body

        if (!name || !code){
            return res.status(400).json({
                error: "Поля name и code обязательные"
            })
        }
        const newRole = await prisma.role.create({
            data: {
                name,
                code: code.toUpperCase(),
                description
            }
        })
        res.status(201).json(newRole)

    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при создании новой роли"
         });
    }
}

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, code, description } = req.body
        const updatedRole = await prisma.role.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                code: code?.toUpperCase(),
                description
            }
        })
        res.json(updatedRole)
    }
    catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при обновлении роли"
        })
    }
}

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await prisma.role.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({
            message: `Роль с id ${id} успешно удалена`
        })
    } catch (error: any) {
        if (error.code === 'P2003') {
            return res.status(400).json({
                error: error.message,
                description: "Нельзя удалить роль, так как она назначена пользователям" });
        }
        else if (error.code === 'P2025') {
            return res.status(404).json({
                error: error.message,
                description: `Роль не найдена` });
        }
        res.status(500).json({
            error: error.message,
            description: "Ошибка при удалении роли"
        })
    }
}
