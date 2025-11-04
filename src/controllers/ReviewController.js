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
}

module.exports = ReviewController;
