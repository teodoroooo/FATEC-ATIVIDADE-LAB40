// Testes unitários da funcionalidade 23 (filtro de números ímpares).
const test = require("node:test");
const assert = require("node:assert/strict");
const feature = require("../src/features/feature23");

test("mantém o contrato do módulo e está habilitado", () => {
  assert.equal(feature.id, 23);
  assert.equal(feature.name, "Filtro de números ímpares");
  assert.equal(feature.implemented, true);
  assert.equal(typeof feature.execute, "function");
});

test("filtra números ímpares (caso típico)", () => {
  assert.deepEqual(feature.execute({ valores: [1, 2, 3, 4] }), { impares: [1, 3] });
});

test("considera ímpares negativos e descarta o zero", () => {
  assert.deepEqual(feature.execute({ valores: [-3, -2, 0, 5] }).impares, [-3, 5]);
});

test("aceita lista vazia e lista sem ímpares", () => {
  assert.deepEqual(feature.execute({ valores: [] }).impares, []);
  assert.deepEqual(feature.execute({ valores: [0, 2, -4] }).impares, []);
});

test("preserva a ordem e as repetições", () => {
  assert.deepEqual(feature.execute({ valores: [7, 7, 2, 1, 9] }).impares, [7, 7, 1, 9]);
});

test("trata inteiros grandes dentro do limite seguro", () => {
  const max = Number.MAX_SAFE_INTEGER; // ímpar
  assert.deepEqual(feature.execute({ valores: [max, max - 1, -max] }).impares, [max, -max]);
});

test("não altera o array recebido", () => {
  const valores = [1, 2, 3, 4];
  const resultado = feature.execute({ valores });
  assert.deepEqual(valores, [1, 2, 3, 4]);
  assert.notEqual(resultado.impares, valores);
});

test("rejeita decimal e elemento textual", () => {
  assert.throws(() => feature.execute({ valores: [1, 2.5] }), { name: "Error" });
  assert.throws(() => feature.execute({ valores: [1, "3"] }), { name: "Error" });
});

test("rejeita NaN, Infinity, null, booleano e objeto na lista", () => {
  for (const invalido of [NaN, Infinity, -Infinity, null, true, {}, [1]]) {
    assert.throws(
      () => feature.execute({ valores: [1, invalido] }),
      { name: "Error" },
      String(invalido)
    );
  }
});

test("rejeita entrada ausente ou 'valores' que não é lista", () => {
  const mensagem = /lista de números inteiros/;
  for (const entrada of [
    undefined,
    null,
    {},
    { valores: "1,2,3" },
    { valores: 5 },
    { valores: null },
    [1, 2, 3]
  ]) {
    assert.throws(() => feature.execute(entrada), { name: "Error", message: mensagem });
  }
});
