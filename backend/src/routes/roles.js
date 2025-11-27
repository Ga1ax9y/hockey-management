import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, role_name, description
      FROM roles
      ORDER BY id DESC;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке ролей:", err);
    res.status(500).json({ error: "Ошибка при загрузке ролей" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, role_name, description
      FROM roles
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке роли:", err);
    res.status(500).json({ error: "Ошибка при загрузке роли" });
  }
});



export default router;
