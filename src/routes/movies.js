const express = require("express");
const router = express.Router();

const db = require("../dataBase");

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Lista todos os filmes
 *     description: Retorna todos os filmes ativos (sem deleted_at)
 *     tags: [Filmes]
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   ano:
 *                     type: integer
 *       500:
 *         description: Erro ao buscar filmes
 */

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM filmes WHERE deleted_at IS NULL"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
