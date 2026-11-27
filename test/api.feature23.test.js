// Testes de integração: a funcionalidade 23 através da API HTTP real (src/app.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)); // porta livre
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

function post(body) {
  return fetch(`${baseUrl}/api/features/23`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
}

test("GET /api/features lista a 23 como implementada", async () => {
  const res = await fetch(`${baseUrl}/api/features`);
  assert.equal(res.status, 200);
  const { items } = await res.json();
  const f23 = items.find((item) => item.id === 23);
  assert.equal(f23.implemented, true);
  assert.equal(f23.name, "Filtro de números ímpares");
});

test("POST /api/features/23 devolve 200 com os ímpares", async () => {
  const res = await post(JSON.stringify({ valores: [1, 2, 3, 4] }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    id: 23,
    name: "Filtro de números ímpares",
    result: { impares: [1, 3] }
  });
});

test("POST /api/features/23 devolve 400 para entrada inválida", async () => {
  const res = await post(JSON.stringify({ valores: [1, 2.5] }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /lista de números inteiros/);
});

test("POST /api/features/23 devolve 400 para JSON malformado", async () => {
  const res = await post("{valores:");
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /JSON válido/);
});
