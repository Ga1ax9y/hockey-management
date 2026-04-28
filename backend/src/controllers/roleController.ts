import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { RoleService } from "../services/roleService";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";

export const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = getPagination(req.query)

        const {roles, total} = await RoleService.findAll(pagination)

        res.json(paginatedResponse(roles, total, pagination.page, pagination.limit ))
    }
    catch(error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении ролей"
        ))
    }
}

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const role = await RoleService.findById(id as string)

        res.json({
            data: role
        })
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении роли по id"
        ))

    }
}

// export const createRole = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, code, description} = req.body

//         if (!name || !code){
//             return next(new AppError(
//                 commonErrorDict.badRequest.name,
//                 commonErrorDict.badRequest.httpCode,
//                 "Поля name, code обязательны",
//                 "Ошибка при создании роли"
//             ))
//         }
//         const newRole = await prisma.role.create({
//             data: {
//                 name,
//                 code: code.toUpperCase(),
//                 description
//             }
//         })
//         res.status(201).json(newRole)

//     } catch (error: any) {
//         next(new AppError(
//             commonErrorDict.serverError.name,
//             commonErrorDict.serverError.httpCode,
//             error.message,
//             "Ошибка при создании роли"
//         ))
//     }
// }

// export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { id } = req.params
//         const { name, code, description } = req.body
//         const updatedRole = await prisma.role.update({
//             where: {
//                 id: Number(id)
//             },
//             data: {
//                 name,
//                 code: code?.toUpperCase(),
//                 description
//             }
//         })
//         res.json(updatedRole)
//     }
//     catch (error: any) {
//         next(new AppError(
//             commonErrorDict.serverError.name,
//             commonErrorDict.serverError.httpCode,
//             error.message,
//             "Ошибка при обновлении роли"
//         ))
//     }
// }

// export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { id } = req.params
//         await prisma.role.delete({
//             where: {
//                 id: Number(id)
//             }
//         })
//         res.json({
//             message: `Роль с id ${id} успешно удалена`
//         })
//     } catch (error: any) {
//         next(new AppError(
//             commonErrorDict.serverError.name,
//             commonErrorDict.serverError.httpCode,
//             error.message,
//             "Ошибка при удалении роли"
//         ))
//     }
// }
