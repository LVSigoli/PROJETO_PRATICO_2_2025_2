const express = require("express");
const router = express.Router();

const db = require("../dataBase");

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Lista todos os filmes
 *     description: Retorna todos os filmes ativos (sem deleted_at)
 *     tags: [Movies]
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

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Retorna um filme específico
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme
 *     responses:
 *       200:
 *         description: Filme encontrado
 *       400:
 *        description: parametro Id é obrigatório
 *       404:
 *         description: Filme não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "id é obrigatório" });

    const result = await db.query(
      "SELECT * FROM filmes WHERE id=$1 AND deleted_at IS NULL",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Filme não encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Remove um filme específico
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme
 *     responses:
 *       200:
 *         description: Filme removido com sucesso
 *       404:
 *         description: Filme não encontrado
 *       500:
 *         description: Erro no servidor
 */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Id é obrigatório" });

    const result = await db.query(
      "UPDATE deleted_at = NOW() FROM filmes WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Filme não encontrado" });

    res.status(200).json({ message: "Filme removido", movie: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
