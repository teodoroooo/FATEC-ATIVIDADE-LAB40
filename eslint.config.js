// Análise estática: regras recomendadas do ESLint.
// Backend e testes rodam em Node (CommonJS); public/ roda no navegador.
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["node_modules/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: globals.node
    }
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser
    }
  }
];
