const express = require("express");
const router = express.Router();

const db = require("../dataBase");
const { movieValidator } = require("../utils/validators");

movieValidator.createMovie;

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
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Id é obrigatório" });

  try {
    await db.transaction(async (client) => {
      const check = await client.query(
        "SELECT * FROM filmes WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );

      if (!check.rows.length) {
        throw { status: 404, message: "Filme não encontrado" };
      }

      await client.query("DELETE FROM filmes_atores WHERE filme_id = $1", [id]);

      const result = await client.query(
        "UPDATE filmes SET deleted_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );

      res.status(200).json({
        message: "Filme e relações removidos com sucesso",
        movie: result.rows[0],
      });
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Erro ao remover filme" });
  }
});

router.post(
  "/movies",
  movieValidator.createMovieValidator,
  async (req, res) => {
    try {
      const { titulo, genero, duracao_min, lancamento, em_cartaz } = req.body;

      const result = await db.query(
        `INSERT INTO filmes (titulo, genero, duracao_min, lancamento, em_cartaz)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [titulo, genero, duracao_min, lancamento, em_cartaz]
      );

      res.status(201).json({
        message: "Filme criado com sucesso",
        filme: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao criar filme" });
    }
  }
);

module.exports = router;
