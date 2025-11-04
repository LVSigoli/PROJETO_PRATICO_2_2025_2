const express = require("express");
const router = express.Router();

const db = require("../dataBase");

/**
 * @swagger
 * /actors:
 *   get:
 *     summary: Lista todos os atores
 *     description: Retorna todos os atores ativos (sem deleted_at)
 *     tags: [Atores]
 *     responses:
 *       200:
 *         description: Lista de atores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *       500:
 *         description: Erro ao buscar atores
 */

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM atores WHERE deleted_at IS NULL"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
