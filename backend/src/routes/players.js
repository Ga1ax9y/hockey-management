import { Router } from "express";
import db from "../config/db.js";


const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        id, last_name, first_name, middle_name, birth_date,
        position, height, weight, contract_expiry, current_team_id
      FROM players
      ORDER BY last_name, first_name;
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
      SELECT
        id, last_name, first_name, middle_name, birth_date,
        position, height, weight, contract_expiry, current_team_id
      FROM players
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Игрок не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке игрока:", err);
    res.status(500).json({ error: "Ошибка при загрузке игрока" });
  }
});

router.post('/', async (req, res) => {
  const {
    last_name,
    first_name,
    middle_name,
    birth_date,
    position,
    height,
    weight,
    contract_expiry,
    current_team_id
  } = req.body;

  if (!last_name || !first_name || !birth_date) {
    return res.status(400).json({
      error: "Фамилия, имя и дата рождения обязательны"
    });
  }

  const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
  if (!dateRegex.test(birth_date) || !dateRegex.test(contract_expiry)) {
    return res.status(400).json({
      error: "Даты должны быть в формате ДД.ММ.ГГГГ"
    });
  }

  try {
    const query = `
      INSERT INTO players (
        last_name, first_name, middle_name, birth_date,
        position, height, weight, contract_expiry, current_team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id, last_name, first_name, middle_name, birth_date,
        position, height, weight, contract_expiry, current_team_id;
    `;
    const result = await db.query(query, [
      last_name.trim(),
      first_name.trim(),
      middle_name?.trim() || null,
      birth_date,
      position || null,
      height ? parseInt(height, 10) : null,
      weight ? parseInt(weight, 10) : null,
      contract_expiry,
      current_team_id ? parseInt(current_team_id, 10) : null
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при создании игрока:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Команда с указанным ID не существует" });
    }
    res.status(500).json({ error: "Ошибка при создании игрока" });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    last_name,
    first_name,
    middle_name,
    birth_date,
    position,
    height,
    weight,
    contract_expiry,
    current_team_id
  } = req.body;

  if (!last_name || !first_name || !birth_date) {
    return res.status(400).json({
      error: "Фамилия, имя и дата рождения обязательны"
    });
  }

  const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
  if (!dateRegex.test(birth_date) || (contract_expiry && !dateRegex.test(contract_expiry))) {
    return res.status(400).json({
      error: "Даты должны быть в формате ДД.ММ.ГГГГ"
    });
  }

  try {
    const query = `
      UPDATE players
      SET
        last_name = $1,
        first_name = $2,
        middle_name = $3,
        birth_date = $4,
        position = $5,
        height = $6,
        weight = $7,
        contract_expiry = $8,
        current_team_id = $9
      WHERE id = $10
      RETURNING
        id, last_name, first_name, middle_name, birth_date,
        position, height, weight, contract_expiry, current_team_id;
    `;
    const result = await db.query(query, [
      last_name.trim(),
      first_name.trim(),
      middle_name?.trim() || null,
      birth_date,
      position || null,
      height ? parseInt(height, 10) : null,
      weight ? parseInt(weight, 10) : null,
      contract_expiry || null,
      current_team_id ? parseInt(current_team_id, 10) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Игрок не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при обновлении игрока:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Команда с указанным ID не существует" });
    }
    res.status(500).json({ error: "Ошибка при обновлении игрока" });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const matchStatsCheck = await db.query(
      'SELECT 1 FROM match_stats WHERE player_id = $1 LIMIT 1', [id]
    );
    if (matchStatsCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить игрока: существуют записи статистики матчей"
      });
    }

    const trainingStatsCheck = await db.query(
      'SELECT 1 FROM training_stats WHERE player_id = $1 LIMIT 1', [id]
    );
    if (trainingStatsCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить игрока: существуют записи тренировочной статистики"
      });
    }

    const query = `DELETE FROM players WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Игрок не найден" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Ошибка при удалении игрока:", err);
    res.status(500).json({ error: "Ошибка при удалении игрока" });
  }
});

export default router;
