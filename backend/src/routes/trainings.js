import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, training_date, start_time, end_time, location, training_type, team_id, coach_id
      FROM trainings
      ORDER BY training_date DESC;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке тренировок:", err);
    res.status(500).json({ error: "Ошибка при загрузке тренировок" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, training_date, start_time, end_time, location, training_type, team_id, coach_id
      FROM trainings
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке тренировки:", err);
    res.status(500).json({ error: "Ошибка при загрузке тренировки" });
  }
});



export default router;
