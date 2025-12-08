import { Router } from "express";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, role_id } = req.body;

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insert = await db.query(
    `INSERT INTO users (email, password_hash, full_name, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role_id`,
    [email, passwordHash, full_name, role_id]
    );

    res.json(insert.rows[0]);
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ error: "Ошибка регистрации" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.query(
      "SELECT id, email, password_hash, role_id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Ошибка логина:", err);
    res.status(500).json({ error: "Ошибка входа" });
  }
});

export default router;
