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
const routes = require("./routes"); // Importa o arquivo de rotas

// 1. CRIAÇÃO DA APLICAÇÃO (A Instância 'app')
const app = express();

app.use(express.json());
app.use(cors());

// Configuração da Documentação Swagger
app.use(
  "/api-docs", // Mudei o path para /api-docs, que é mais comum
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// Conexão das Rotas
app.use("/", routes);

// 2. EXPORTAÇÃO (ESSENCIAL PARA OS TESTES)
module.exports = app;

// 3. INICIALIZAÇÃO DO SERVIDOR (Só se for executado diretamente)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📘 Documentação: http://localhost:${port}/api-docs`);
  });
}