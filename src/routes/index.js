const express = require("express");
const router = express.Router();

const movies = require("./movies");
const actors = require("./actors");
const reviews = require("./reviews");

router.use("/movies", movies);
router.use("/actors", actors);
router.use("/reviews", reviews);

router.get("/", (req, res) => {
  res.send("🎬 API rodando com sucesso!");
});

module.exports = router;
