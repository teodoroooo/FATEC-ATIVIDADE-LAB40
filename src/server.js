// Importa a aplicação HTTP.
const { createServer } = require("node:http");
const app = require("./app");

// Usa a porta do ambiente ou 3000 no desenvolvimento.
const PORT = Number(process.env.PORT) || 3000;

// Cria e inicia o servidor HTTP.
const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`LAB40 disponível na porta ${PORT}`);
});
