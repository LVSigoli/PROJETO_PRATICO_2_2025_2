// const express = require("express");
// const cors = require("cors");
// const { swaggerUi, specs } = require("./swagger");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());
// app.use(cors());

// app.use(
//   "/api",
//   swaggerUi.serve,
//   swaggerUi.setup(specs, {
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "Documentação da API de exemplo",
//   })
// );

// const routes = require("./routes/rota");
// app.use("/", routes);

// app.listen(port, () => {
//   console.log(`Servidor executando em http://localhost:${port}`);
// });

const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Documentação da API de Filmes 🎥",
  })
);

app.use("/", routes);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📘 Documentação: http://localhost:${port}/api-docs`);
});
