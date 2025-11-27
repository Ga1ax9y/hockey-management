import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import matchesRoutes from "./routes/matches.js"
import trainingsRoutes from "./routes/trainings.js"
import teamsRoutes from "./routes/teams.js"
import rolesRoutes from "./routes/roles.js"
import playersRoutes from "./routes/players.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/trainings", trainingsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/players", playersRoutes);


export default app;
