import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, team_name, league, level, season
      FROM teams
      ORDER BY team_name DESC;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке команд:", err);
    res.status(500).json({ error: "Ошибка при загрузке команд" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, team_name, league, level, season
      FROM teams
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке команд:", err);
    res.status(500).json({ error: "Ошибка при загрузке команд" });
  }
});



export default router;
