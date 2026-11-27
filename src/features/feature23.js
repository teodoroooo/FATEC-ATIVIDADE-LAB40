// Funcionalidade 23: Filtro de números ímpares.
// Objetivo: Retorna somente os números ímpares de uma lista.
// Exemplo de entrada: { valores: [1, 2, 3, 4] }
// Exemplo de saída:   { impares: [1, 3] }
const implemented = true;

// Math.abs cobre negativos: em JS, -3 % 2 === -1.
function isOdd(n) {
  return Math.abs(n % 2) === 1;
}

function execute(input) {
  const { valores } = input ?? {};
  if (!Array.isArray(valores) || !valores.every(Number.isInteger)) {
    throw new Error("Informe 'valores' como uma lista de números inteiros.");
  }
  // filter devolve um array novo: a entrada não é alterada.
  return { impares: valores.filter(isOdd) };
}

module.exports = {
  id: 23,
  name: "Filtro de números ímpares",
  description: "Retorna somente os números ímpares de uma lista.",
  implemented,
  execute
};
