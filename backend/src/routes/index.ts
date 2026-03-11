import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes"
import roleRoutes from "./roleRoutes"
import playerRoutes from "./playerRoutes"
import teamRoutes from "./teamRoutes"
import trainingRoutes from "./trainingRoutes"
import medicalRoutes from "./medicalRoutes"

const apiRouter = Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/auth", authRoutes)
apiRouter.use("/roles", roleRoutes)
apiRouter.use("/players", playerRoutes)
apiRouter.use("/teams", teamRoutes )
apiRouter.use("/trainings", trainingRoutes )
apiRouter.use("/medical", medicalRoutes )

export default apiRouter;
