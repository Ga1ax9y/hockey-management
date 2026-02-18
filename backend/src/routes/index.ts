import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes"
import roleRoutes from "./roleRoutes"
const apiRouter = Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/auth", authRoutes)
apiRouter.use("/roles", roleRoutes)

export default apiRouter;
