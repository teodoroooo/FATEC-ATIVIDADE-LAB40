// API HTTP do LAB40 e servidor de arquivos estáticos.
const fs = require("node:fs");
const path = require("node:path");
const features = require("./features");
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MIME = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8" };

// Padroniza respostas JSON.
function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" });
  res.end(JSON.stringify(data));
}

// Lê e interpreta o corpo JSON da requisição.
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 100000) {
        reject(new Error("Corpo da requisição excede 100 KB."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Corpo da requisição não contém JSON válido.")); }
    });
    req.on("error", reject);
  });
}

// Entrega arquivos da pasta public sem permitir sair dela.
function serveStatic(pathname, res) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const target = path.resolve(PUBLIC_DIR, "." + requested);
  if (!target.startsWith(PUBLIC_DIR + path.sep)) return sendJson(res, 403, { error:"Acesso negado." });
  fs.readFile(target, (error, content) => {
    if (error) return sendJson(res, 404, { error:"Arquivo não encontrado." });
    res.writeHead(200, { "Content-Type":MIME[path.extname(target)] || "application/octet-stream" });
    res.end(content);
  });
}

// Roteia health check, catálogo, execução de módulos e interface.
async function app(req, res) {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && url.pathname === "/health")
    return sendJson(res, 200, { status:"ok", application:"LAB40" });
  if (req.method === "GET" && url.pathname === "/api/features")
    return sendJson(res, 200, { total:40, items:features.list() });

  const match = url.pathname.match(/^\/api\/features\/(\d+)$/);
  if (req.method === "POST" && match) {
    const id = Number(match[1]);
    const feature = features.get(id);
    if (!feature) return sendJson(res, 404, { error:"Funcionalidade não encontrada." });
    if (!feature.implemented) return sendJson(res, 501, { error:"Funcionalidade ainda não implementada.", id, name:feature.name });
    try {
      const input = await readJson(req);
      return sendJson(res, 200, { id, name:feature.name, result:feature.execute(input) });
    } catch (error) {
      return sendJson(res, 400, { error:error.message || "Erro ao executar funcionalidade." });
    }
  }
  if (req.method === "GET") return serveStatic(url.pathname, res);
  return sendJson(res, 405, { error:"Método HTTP não permitido." });
}

module.exports = app;
