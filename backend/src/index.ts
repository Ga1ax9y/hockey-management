import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
const app = express();
const PORT = process.env.DATABASE_PORT || 4000;

app.use(cors())
app.use(express.json())
app.get('/', () => {
    console.log('Hello World!');
})
app.use('/api/v1/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
