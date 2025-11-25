import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, full_name, email, role_id, is_active
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

export default router;
