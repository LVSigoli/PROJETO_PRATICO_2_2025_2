const express = require("express");
const router = express.Router();

const db = require("../dataBase");

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Lista todas as reviews
 *     description: Retorna todas as avaliações ativas (sem deleted_at)
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lista de reviews retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   comentario:
 *                     type: string
 *                   nota:
 *                     type: number
 *       500:
 *         description: Erro ao buscar reviews
 */

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM avaliacoes WHERE deleted_at IS NULL"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
