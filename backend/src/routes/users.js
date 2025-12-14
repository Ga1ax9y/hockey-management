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

router.get('/me', async (req, res) => {
  try {
    const { id } = req.user;

    const query = `
      SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, r.role_name, r.description, u.role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке профиля:", err);
    res.status(500).json({ error: "Ошибка при загрузке профиля" });
  }
});

router.get('/me/teams', async (req, res) => {
  try {
    const { id } = req.user;

    const query = `
      SELECT t.id, t.team_name, t.league, t.level, t.season
      FROM user_teams ut
      JOIN teams t ON ut.team_id = t.id
      WHERE ut.user_id = $1;
    `;

    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке команд пользователя:", err);
    res.status(500).json({ error: "Ошибка при загрузке команд" });
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
