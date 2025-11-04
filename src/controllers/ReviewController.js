const message = require("../utils/constants");

class ReviewController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query(
        "SELECT * FROM avaliacoes WHERE deleted_at IS NULL"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: message.messages.review.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        "SELECT * FROM avaliacoes WHERE id=$1 AND deleted_at IS NULL",
        [id]
      );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({ message: message.messages.review.errors.ERRORS.not_Found });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({ message: message.messages.review.errors.ERRORS.default });
    }
  }

  async createReview(req, res) {
    try {
      const { filme_id, nome_avaliador, nota, comentario, recomendado } =
        req.body;

      const result = await this.db.query(
        `INSERT INTO avaliacoes (filme_id, nome_avaliador, nota, comentario, recomendado)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [filme_id, nome_avaliador, nota, comentario, recomendado || false]
      );

      res.status(201).json({
        message: "Review criada com sucesso",
        review: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        message: message.messages.review.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const updatedReview = req.body;

      if (!Object.keys(updatedReview).length) {
        return res
          .status(400)
          .json({ message: "Nenhum campo enviado para atualização." });
      }

      const setClause = Object.keys(updatedReview)
        .map((field, i) => `${field} = $${i + 1}`)
        .join(", ");

      const values = Object.values(updatedReview);

      const result = await this.db.query(
        `UPDATE avaliacoes
         SET ${setClause}, criado_em = NOW()
         WHERE id = $${values.length + 1}
         RETURNING *`,
        [...values, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Review não encontrada" });
      }

      res.status(200).json({
        message: "Review atualizada com sucesso",
        review: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: message.messages.review.errors.ERRORS.default,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id)
        return res
          .status(400)
          .json({ message: message.messages.review.errors.ERRORS.missingId });

      await this.db.transaction(async (client) => {
        const check = await client.query(
          "SELECT * FROM avaliacoes WHERE id = $1 AND deleted_at IS NULL",
          [id]
        );

        if (!check.rows.length) {
          throw {
            status: 404,
            message: message.messages.review.errors.ERRORS.not_Found,
          };
        }

        await client.query(
          "UPDATE avaliacoes SET deleted_at = NOW() WHERE id = $1",
          [id]
        );

        res.status(204).json({ message: "Recurso removido com sucesso" });
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || message.messages.review.errors.ERRORS.default,
      });
    }
  }
}

module.exports = ReviewController;
