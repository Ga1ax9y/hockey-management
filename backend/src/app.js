import express from "express";
import cors from "cors";
import usersRoutes from "./routes/players.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", usersRoutes);

export default app;
