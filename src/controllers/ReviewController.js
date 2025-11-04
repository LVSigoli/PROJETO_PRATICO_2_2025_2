const message = require("../utils/cosntants");

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

        const result = await client.query(
          "UPDATE avaliacoes SET deleted_at = NOW() WHERE id = $1 RETURNING *",
          [id]
        );

        res.status(204);
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || message.messages.review.errors.ERRORS.default,
      });
    }
  }

  async createReview(req, res) {}

  async updateReview(req, res) {}
}

module.exports = ReviewController;
