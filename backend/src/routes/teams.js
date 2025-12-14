import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, team_name, league, level, season
      FROM teams
      ORDER BY team_name;
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
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Команда не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке команды:", err);
    res.status(500).json({ error: "Ошибка при загрузке команды" });
  }
});

router.post('/', async (req, res) => {
  const { team_name, league, level, season } = req.body;

  if (!team_name || typeof team_name !== 'string' || team_name.trim() === '') {
    return res.status(400).json({ error: "Название команды обязательно" });
  }
  if (level == null || isNaN(level)) {
    return res.status(400).json({ error: "Уровень должен быть числом" });
  }
  if (!season || !/^\d{4}\/\d{2}$/.test(season)) {
    return res.status(400).json({ error: "Сезон должен быть в формате ГГГГ/ГГ (например, 2025/26)" });
  }

  try {
    const query = `
      INSERT INTO teams (team_name, league, level, season)
      VALUES ($1, $2, $3, $4)
      RETURNING id, team_name, league, level, season;
    `;
    const result = await db.query(query, [
      team_name.trim(),
      league || null,
      parseInt(level, 10),
      season
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Команда с такими параметрами уже существует" });
    }
    console.error("Ошибка при создании команды:", err);
    res.status(500).json({ error: "Ошибка при создании команды" });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { team_name, league, level, season } = req.body;

  if (!team_name || typeof team_name !== 'string' || team_name.trim() === '') {
    return res.status(400).json({ error: "Название команды обязательно" });
  }
  if (level == null || isNaN(level)) {
    return res.status(400).json({ error: "Уровень должен быть числом" });
  }
  if (!season || !/^\d{4}\/\d{2}$/.test(season)) {
    return res.status(400).json({ error: "Сезон должен быть в формате ГГГГ/ГГ" });
  }

  try {
    const query = `
      UPDATE teams
      SET team_name = $1, league = $2, level = $3, season = $4
      WHERE id = $5
      RETURNING id, team_name, league, level, season;
    `;
    const result = await db.query(query, [
      team_name.trim(),
      league || null,
      parseInt(level, 10),
      season,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Команда не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Команда с такими параметрами уже существует" });
    }
    console.error("Ошибка при обновлении команды:", err);
    res.status(500).json({ error: "Ошибка при обновлении команды" });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userCheck = await db.query('SELECT 1 FROM user_teams WHERE team_id = $1 LIMIT 1', [id]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить команду: к ней привязаны пользователи"
      });
    }

    const playerCheck = await db.query('SELECT 1 FROM players WHERE current_team_id = $1 LIMIT 1', [id]);
    if (playerCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить команду: в ней есть игроки"
      });
    }

    const query = `DELETE FROM teams WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Команда не найдена" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Ошибка при удалении команды:", err);
    res.status(500).json({ error: "Ошибка при удалении команды" });
  }
});


router.post('/:teamId/users', async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Требуется корректный ID пользователя" });
  }

  try {
    const teamExists = await db.query('SELECT 1 FROM teams WHERE id = $1', [teamId]);
    if (teamExists.rows.length === 0) {
      return res.status(404).json({ error: "Команда не найдена" });
    }

    const userExists = await db.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const query = `
      INSERT INTO user_teams (user_id, team_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, team_id) DO NOTHING
      RETURNING id;
    `;
    const result = await db.query(query, [userId, teamId]);

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Пользователь уже привязан к этой команде" });
    }

    res.status(201).json({ message: "Пользователь успешно привязан к команде" });
  } catch (err) {
    console.error("Ошибка при привязке пользователя к команде:", err);
    res.status(500).json({ error: "Ошибка при привязке пользователя" });
  }
});

router.delete('/:teamId/users/:userId', async (req, res) => {
  const { teamId, userId } = req.params;

  try {
    const query = `
      DELETE FROM user_teams
      WHERE team_id = $1 AND user_id = $2
      RETURNING id;
    `;
    const result = await db.query(query, [teamId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Привязка не найдена" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Ошибка при отвязке пользователя от команды:", err);
    res.status(500).json({ error: "Ошибка при отвязке пользователя" });
  }
});

router.get('/:teamId/users', async (req, res) => {
  try {
    const { teamId } = req.params;

    const query = `
      SELECT u.id, u.email, u.full_name, r.role_name, u.role_id
      FROM user_teams ut
      JOIN users u ON ut.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE ut.team_id = $1
      ORDER BY u.full_name;
    `;
    const result = await db.query(query, [teamId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке пользователей команды:", err);
    res.status(500).json({ error: "Ошибка при загрузке пользователей команды" });
  }
});

export default router;
