// Smoke test: confirma que a aplicação sobe e responde nas rotas essenciais.
//
// Uso:
//   npm run test:smoke                                    -> sobe src/server.js numa porta livre e testa
//   SMOKE_URL=http://localhost:3000 npm run test:smoke    -> testa uma instância já rodando (ex.: container)
//
// Sai com código 0 se tudo passar e 1 na primeira falha.
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const path = require("node:path");
const assert = require("node:assert/strict");

const STARTUP_TIMEOUT_MS = 15000;

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) return;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Aplicação não respondeu em ${baseUrl}/health dentro de ${STARTUP_TIMEOUT_MS} ms.`
  );
}

async function check(name, fn) {
  await fn();
  console.log(`  ok  ${name}`);
}

async function run(baseUrl) {
  await waitForHealth(baseUrl);

  await check("GET /health -> 200 { status: 'ok' }", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, "ok");
  });

  await check("GET /api/features -> 40 itens, 23 implementada", async () => {
    const res = await fetch(`${baseUrl}/api/features`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.items.length, 40);
    assert.equal(body.items.find((f) => f.id === 23).implemented, true);
  });

  await check("POST /api/features/23 -> { impares: [1, 3] }", async () => {
    const res = await fetch(`${baseUrl}/api/features/23`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valores: [1, 2, 3, 4] })
    });
    assert.equal(res.status, 200);
    assert.deepEqual((await res.json()).result, { impares: [1, 3] });
  });

  await check("GET / -> interface HTML", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
  });
}

async function main() {
  const external = process.env.SMOKE_URL;
  if (external) {
    console.log(`Smoke test em ${external}`);
    await run(external.replace(/\/$/, ""));
    return;
  }

  const port = await freePort();
  const child = spawn(process.execPath, [path.join(__dirname, "..", "src", "server.js")], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "inherit", "inherit"]
  });
  const exited = new Promise((_, reject) =>
    child.once("exit", (code) =>
      reject(new Error(`Servidor encerrou antes do teste (código ${code}).`))
    )
  );

  console.log(`Smoke test em http://127.0.0.1:${port}`);
  try {
    await Promise.race([run(`http://127.0.0.1:${port}`), exited]);
  } finally {
    child.removeAllListeners("exit");
    child.kill();
  }
}

main().then(
  () => console.log("Smoke test: OK"),
  (error) => {
    console.error(`Smoke test: FALHOU - ${error.message}`);
    process.exitCode = 1;
  }
);
