import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import apiRouter from "./routes/index.js";
const app = express();
const PORT = process.env.DATABASE_PORT || 4000;

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.json({message: "Welcome to the API"});
})
app.use('/api/v1', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
