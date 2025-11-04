const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Documentação da API de exemplo",
  })
);

const routes = require("./routes/rota");
app.use("/", routes);

app.listen(port, () => {
  console.log(`Servidor executando em http://localhost:${port}`);
});
