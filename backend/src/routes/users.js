import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, full_name, email, role_id, is_active, password_hash, created_at
      FROM users
      ORDER BY full_name;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке игроков:", err);
    res.status(500).json({ error: "Ошибка при загрузке игроков" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, full_name, email, role_id, is_active, password_hash
      FROM users
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке игрока:", err);
    res.status(500).json({ error: "Ошибка при загрузке игрока" });
  }
});



export default router;
