import type { NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware";
import { AppError, commonErrorDict } from "../types/AppError";

export default async function requireOrganization (req: AuthRequest, res: Response, next: NextFunction)  {
  const orgId = req.user?.organization?.id;

  if (!orgId) {
    return next(new AppError(
      commonErrorDict.unauthorized.name,
      commonErrorDict.unauthorized.httpCode,
      "Доступ запрещен: требуется привязка к организации"
    ));
  }

  req.orgId = orgId;

  next();
};
