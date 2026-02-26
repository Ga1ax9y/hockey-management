import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes"
import roleRoutes from "./roleRoutes"
import playerRoutes from "./playerRoutes"
import teamRoutes from "./teamRoutes"
const apiRouter = Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/auth", authRoutes)
apiRouter.use("/roles", roleRoutes)
apiRouter.use("/players", playerRoutes)
apiRouter.use("/teams", teamRoutes )

export default apiRouter;
