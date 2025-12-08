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

router.post('/', async (req, res) => {
  const { role_name, description } = req.body;

  if (!role_name || typeof role_name !== 'string' || role_name.trim() === '') {
    return res.status(400).json({ error: "Название роли обязательно и должно быть строкой" });
  }

  try {
    const query = `
      INSERT INTO roles (role_name, description)
      VALUES ($1, $2)
      RETURNING id, role_name, description;
    `;
    const result = await db.query(query, [role_name.trim(), description || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'roles_role_name_key') {
      return res.status(409).json({ error: "Роль с таким названием уже существует" });
    }
    console.error("Ошибка при создании роли:", err);
    res.status(500).json({ error: "Ошибка при создании роли" });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { role_name, description } = req.body;

  if (!role_name || typeof role_name !== 'string' || role_name.trim() === '') {
    return res.status(400).json({ error: "Название роли обязательно и должно быть строкой" });
  }

  try {
    const query = `
      UPDATE roles
      SET role_name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, role_name, description;
    `;
    const result = await db.query(query, [role_name.trim(), description || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Роль не найдена" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'roles_role_name_key') {
      return res.status(409).json({ error: "Роль с таким названием уже существует" });
    }
    console.error("Ошибка при обновлении роли:", err);
    res.status(500).json({ error: "Ошибка при обновлении роли" });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usedCheck = await db.query('SELECT 1 FROM users WHERE role_id = $1 LIMIT 1', [id]);
    if (usedCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить роль: она назначена одному или нескольким пользователям"
      });
    }

    const query = `DELETE FROM roles WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Роль не найдена" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Ошибка при удалении роли:", err);
    res.status(500).json({ error: "Ошибка при удалении роли" });
  }
});



export default router;
