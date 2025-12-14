import { Router } from "express";
import db from "../config/db.js";


const router = Router();

router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    let query, params;

    if (teamId) {
      query = `
        SELECT
          id, last_name, first_name, middle_name, birth_date,
          position, height, weight, contract_expiry, current_team_id
        FROM players
        WHERE current_team_id = $1
        ORDER BY last_name, first_name;
      `;
      params = [teamId];
    } else {
      query = `
        SELECT
          id, last_name, first_name, middle_name, birth_date,
          position, height, weight, contract_expiry, current_team_id
        FROM players
        ORDER BY last_name, first_name;
      `;
      params = [];
    }

    const result = await db.query(query, params);
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

router.get('/:id/career', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        pch.id,
        pch.transfer_date,
        pch.transfer_type,
        from_team.team_name AS from_team,
        to_team.team_name AS to_team
      FROM player_career_history pch
      LEFT JOIN teams from_team ON pch.from_team_id = from_team.id
      LEFT JOIN teams to_team ON pch.to_team_id = to_team.id
      WHERE pch.player_id = $1
      ORDER BY pch.transfer_date DESC;
    `;
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке карьеры:", err);
    res.status(500).json({ error: "Ошибка при загрузке карьеры" });
  }
});

router.get('/:id/medical', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        id, injury_date, recovery_date, diagnosis, status
      FROM medical_history
      WHERE player_id = $1
      ORDER BY injury_date DESC;
    `;
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке медданных:", err);
    res.status(500).json({ error: "Ошибка при загрузке медданных" });
  }
});

router.get('/:id/match-stats', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        ms.goals, ms.assists, ms.shots, ms.hits, ms.penalty_minutes, ms.plus_minus, ms.faceoff_wins,
        m.match_date, m.home_team_id, m.away_team_id,
        home.team_name AS home_team, away.team_name AS away_team
      FROM match_stats ms
      JOIN matches m ON ms.match_id = m.id
      LEFT JOIN teams home ON m.home_team_id = home.id
      LEFT JOIN teams away ON m.away_team_id = away.id
      WHERE ms.player_id = $1
      ORDER BY m.match_date DESC
      LIMIT 10;
    `;
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке матч-статистики:", err);
    res.status(500).json({ error: "Ошибка при загрузке статистики" });
  }
});

router.get('/:id/training-stats', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        ts.coach_rating, ts.description,
        t.training_date, t.training_type, t.location,
        u.full_name AS coach_name
      FROM training_stats ts
      JOIN trainings t ON ts.training_id = t.id
      LEFT JOIN users u ON t.coach_id = u.id
      WHERE ts.player_id = $1
      ORDER BY t.training_date DESC
      LIMIT 5;
    `;
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке тренировочной статистики:", err);
    res.status(500).json({ error: "Ошибка при загрузке тренировок" });
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
