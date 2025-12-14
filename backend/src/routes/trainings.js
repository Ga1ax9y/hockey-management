import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        t.id, t.training_date, t.start_time, t.end_time,
        t.location, t.training_type, t.team_id, t.coach_id,
        tm.team_name,
        u.full_name AS coach_name
      FROM trainings t
      LEFT JOIN teams tm ON t.team_id = tm.id
      LEFT JOIN users u ON t.coach_id = u.id
      ORDER BY t.training_date DESC, t.start_time DESC;
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
      SELECT
        t.id, t.training_date, t.start_time, t.end_time,
        t.location, t.training_type, t.team_id, t.coach_id,
        tm.team_name,
        u.full_name AS coach_name
      FROM trainings t
      LEFT JOIN teams tm ON t.team_id = tm.id
      LEFT JOIN users u ON t.coach_id = u.id
      WHERE t.id = $1;
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Тренировка не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке тренировки:", err);
    res.status(500).json({ error: "Ошибка при загрузке тренировки" });
  }
});

router.post('/', async (req, res) => {
  const {
    training_date,
    start_time,
    end_time,
    location,
    training_type,
    team_id,
    coach_id
  } = req.body;

  if (!training_date || !start_time || !location || !training_type || !team_id) {
    return res.status(400).json({ error: "Обязательные поля: дата, время начала, место, тип, команда" });
  }

  try {
    const query = `
      INSERT INTO trainings (
        training_date, start_time, end_time, location,
        training_type, team_id, coach_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id, training_date, start_time, end_time, location,
        training_type, team_id, coach_id;
    `;
    const result = await db.query(query, [
      training_date,
      start_time,
      end_time || null,
      location.trim(),
      training_type.trim(),
      team_id,
      coach_id || null
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при создании тренировки:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Команда или тренер не существуют" });
    }
    res.status(500).json({ error: "Ошибка при создании тренировки" });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    training_date,
    start_time,
    end_time,
    location,
    training_type,
    team_id,
    coach_id
  } = req.body;

  if (!training_date || !start_time || !location || !training_type || !team_id) {
    return res.status(400).json({ error: "Обязательные поля: дата, время начала, место, тип, команда" });
  }

  try {
    const query = `
      UPDATE trainings
      SET
        training_date = $1,
        start_time = $2,
        end_time = $3,
        location = $4,
        training_type = $5,
        team_id = $6,
        coach_id = $7
      WHERE id = $8
      RETURNING
        id, training_date, start_time, end_time, location,
        training_type, team_id, coach_id;
    `;
    const result = await db.query(query, [
      training_date,
      start_time,
      end_time || null,
      location.trim(),
      training_type.trim(),
      team_id,
      coach_id || null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Тренировка не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при обновлении тренировки:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Команда или тренер не существуют" });
    }
    res.status(500).json({ error: "Ошибка при обновлении тренировки" });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const statsCheck = await db.query(
      'SELECT 1 FROM training_stats WHERE training_id = $1 LIMIT 1', [id]
    );
    if (statsCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить тренировку: существуют оценки игроков"
      });
    }

    const query = `DELETE FROM trainings WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Тренировка не найдена" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Ошибка при удалении тренировки:", err);
    res.status(500).json({ error: "Ошибка при удалении тренировки" });
  }
});

export default router;
