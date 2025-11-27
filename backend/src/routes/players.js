import { Router } from "express";
import db from "../config/db.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, last_name, first_name, middle_name, birth_date, position, height, weight, contract_expiry, current_team_id
      FROM players
      ORDER BY id DESC;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке матчей:", err);
    res.status(500).json({ error: "Ошибка при загрузке матчей" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, last_name, first_name, middle_name, birth_date, position, height, weight, contract_expiry, current_team_id
      FROM players
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при загрузке матча:", err);
    res.status(500).json({ error: "Ошибка при загрузке матча" });
  }
});



export default router;
