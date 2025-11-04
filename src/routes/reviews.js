// External Libraries
const express = require("express");

// Controllers
const { ReviewController } = require("../controllers");

// Utils
const db = require("../dataBase");

const router = express.Router();
const reviewController = new ReviewController(db);

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
 *                     example: 1
 *                   comentario:
 *                     type: string
 *                     example: "Ótimo filme!"
 *                   nota:
 *                     type: number
 *                     example: 9
 *       500:
 *         description: Erro ao buscar reviews
 */
router.get("/", reviewController.getAll.bind(reviewController));

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Retorna uma review específica
 *     description: Busca uma avaliação pelo ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review
 *     responses:
 *       200:
 *         description: Review encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 comentario:
 *                   type: string
 *                   example: "Ótimo filme!"
 *                 nota:
 *                   type: number
 *                   example: 9
 *       404:
 *         description: Review não encontrada
 *       500:
 *         description: Erro ao buscar review
 */
router.get("/:id", reviewController.getOne.bind(reviewController));

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Remove uma review específica
 *     description: Marca a review como deletada (soft delete)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review a ser removida
 *     responses:
 *       204:
 *         description: Review removida com sucesso
 *       400:
 *         description: ID não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ID é obrigatório"
 *       404:
 *         description: Review não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review não encontrada"
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao remover review"
 */
router.delete("/:id", reviewController.delete.bind(reviewController));

module.exports = router;
