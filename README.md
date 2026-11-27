# LAB40 – Laboratório de Funcionalidades Web

Projeto-base para avaliação prática de Integração e Entrega Contínua (CI/CD).

## Requisitos
- Node.js 20 ou superior.
- npm.

## Executar localmente
```bash
npm install
npm start
```
Acesse http://localhost:3000. Para desenvolvimento com reinicialização automática: `npm run dev`.

## Endpoints
- `GET /health`: verificação de disponibilidade.
- `GET /api/features`: lista as 40 funcionalidades e seus estados.
- `POST /api/features/:id`: executa uma funcionalidade, recebendo JSON no corpo.

Exemplo:
```bash
curl -X POST http://localhost:3000/api/features/1 -H "Content-Type: application/json" -d '{"valor":200,"percentual":15}'
```

## Estrutura
```text
lab40/
├── public/
├── src/
│   ├── app.js
│   ├── server.js
│   └── features/
├── package.json
└── package-lock.json
```

## Contrato de cada módulo
Cada arquivo `src/features/featureNN.js` exporta `id`, `name`, `description`, `implemented` e `execute(input)`.

1. Implemente `execute(input)`.
2. Valide os dados recebidos.
3. Retorne um objeto serializável em JSON.
4. Trate entradas inválidas lançando `Error` com mensagem clara.
5. Depois de implementar e validar, altere `implemented` para `true`.
6. Não altere o contrato dos outros módulos nem a API central sem autorização.

Enquanto `implemented` for `false`, a API retorna HTTP 501 para aquele módulo.

O servidor escuta `process.env.PORT` e `0.0.0.0`, e a aplicação não persiste dados em disco.

---

## Funcionalidade implementada: 23 – Filtro de números ímpares

Arquivo: `src/features/feature23.js`. Recebe uma lista de inteiros e devolve só os ímpares, na ordem original.

| Entrada | Saída |
|---|---|
| `{ "valores": [1, 2, 3, 4] }` | `{ "impares": [1, 3] }` |
| `{ "valores": [-3, -2, 0, 5] }` | `{ "impares": [-3, 5] }` |
| `{ "valores": [] }` | `{ "impares": [] }` |
| `{ "valores": [1, 2.5] }` | HTTP 400: `Informe 'valores' como uma lista de números inteiros.` |

Regras:
- `valores` precisa ser um array e todos os elementos precisam ser inteiros. Decimal, texto (`"3"`), `null`, `NaN`, `Infinity` e booleano são rejeitados.
- Zero é par. Negativos ímpares entram no resultado (`Math.abs(n % 2) === 1`, porque em JS `-3 % 2 === -1`).
- A lista recebida não é alterada.

```bash
curl -X POST http://localhost:3000/api/features/23 -H "Content-Type: application/json" -d '{"valores":[1,2,3,4]}'
```

PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/features/23 -ContentType "application/json" -Body '{"valores":[1,2,3,4]}'
```

## Qualidade: lint, testes, auditoria e smoke test

```bash
npm ci                          # instala exatamente as versões do package-lock.json
npm run format:check            # Prettier: confere a formatação (npm run format corrige)
npm run lint                    # ESLint
npm test                        # testes unitários e de integração (node:test)
npm audit --audit-level=high    # vulnerabilidades em dependências
npm run test:smoke              # sobe o servidor numa porta livre e testa as rotas essenciais
```

| Arquivo | O que cobre |
|---|---|
| `test/feature23.test.js` | Contrato do módulo, caso típico, negativos e zero, lista vazia, ordem e repetições, inteiros grandes, não mutação da entrada, entradas inválidas |
| `test/api.feature23.test.js` | A funcionalidade pela API HTTP: listagem, 200 com resultado, 400 para entrada inválida e para JSON malformado |
| `scripts/smoke.js` | `/health`, `/api/features`, `POST /api/features/23` e a página inicial. Com `SMOKE_URL` testa uma instância já rodando (por exemplo, o container) |

## Integração contínua (GitHub Actions)

Workflow em `.github/workflows/ci.yml`, disparado em pull request para `main` e em push na `main`.

1. **qualidade** (Node 20 e 22): `npm ci` → formatação → lint → testes → `npm audit` → smoke test.
2. **build** (só roda se a qualidade passar): build da imagem Docker → sobe um container efêmero → smoke test contra o container.

## Entrega contínua simulada (CD)

Workflow em `.github/workflows/cd.yml`. Roda automaticamente quando o CI termina **com sucesso na `main`** (e também pode ser disparado à mão em Actions → CD → Run workflow). Não publica em servidor real: gera a versão de entrega como artefato.

1. Faz checkout do commit exato que o CI validou.
2. Build da imagem com tag igual ao SHA curto do commit: `lab40:<sha7>`.
3. Sobe o container e roda o smoke test (inclui `/health` e a funcionalidade 23).
4. Exporta a imagem com `docker save` para `lab40-<sha7>.tar`.
5. Gera o `deployment-record.txt`: SHA do commit, nome e tag da imagem, Image ID, nome e SHA-256 do `.tar`, ID do container de teste, resposta do `/health`, link da execução e data.
6. Publica o `.tar` e o registro como artefato `entrega-lab40-<sha7>` (retenção de 14 dias). O registro também aparece no resumo da execução.

Para usar o `.tar` baixado: `docker load -i lab40-<sha7>.tar` e `docker run -p 3000:3000 lab40:<sha7>`.

## Docker

```bash
docker build -t lab40 .
docker run -d --name lab40 -p 3000:3000 lab40
curl http://localhost:3000/health
docker rm -f lab40
```

## Roteiro de teste manual

1. `npm ci` e depois `npm start`. O terminal mostra `LAB40 disponível na porta 3000`.
2. Abrir http://localhost:3000/health. Esperado: `{"status":"ok","application":"LAB40"}`.
3. Abrir http://localhost:3000 e localizar o card **23 – Filtro de números ímpares**. Ele deve exibir o selo **Implementada**.
4. No card, enviar `{"valores":[1,2,3,4]}`. Esperado: `{"impares":[1,3]}`.
5. Enviar `{"valores":[-3,-2,0,5]}`. Esperado: `{"impares":[-3,5]}` (zero fica de fora, negativo ímpar entra).
6. Enviar `{"valores":[]}`. Esperado: `{"impares":[]}`.
7. Enviar `{"valores":[1,2.5]}` e depois `{"valores":[1,"3"]}`. Esperado em ambos: erro `Informe 'valores' como uma lista de números inteiros.` (HTTP 400).
8. Enviar `{}`. Esperado: o mesmo erro do passo 7.

## Decisões técnicas

- **`node:test` em vez de Jest/Mocha:** o runner nativo do Node 20 resolve o que o projeto precisa sem dependência a mais, o que mantém a superfície do `npm audit` pequena.
- **Teste de integração usando o `app` real numa porta efêmera (`listen(0)`):** testa o caminho HTTP completo (roteamento, parse do JSON, códigos 200/400) sem conflito de porta.
- **Smoke test separado dos testes:** ele sobe o `src/server.js` de verdade (ponto de entrada de produção) e, com `SMOKE_URL`, valida o container no CI. Um script que só termina com código 0 não prova nada; este verifica as respostas.
- **ESLint com `js.configs.recommended`:** regras que pegam erro real (variável não usada, global inexistente), separando o ambiente Node (`src`, `test`, `scripts`) do navegador (`public`). Versões fixadas com `--save-exact` para o CI ser reprodutível.
- **Prettier só nos arquivos desta entrega:** padroniza a formatação sem reescrever os módulos e a API central do projeto-base, que não devem ser alterados.
- **CD disparado por `workflow_run` do CI:** a entrega só acontece se o CI passou, e usa o SHA que o CI validou. A tag da imagem, o nome do `.tar` e o registro carregam o mesmo SHA, o que liga a versão entregue ao commit integrado.
- **`npm ci` no CI:** falha se `package.json` e `package-lock.json` divergirem, o que garante que o CI testa exatamente o que foi commitado.
- **Matriz Node 20 e 22:** o `package.json` declara `node >=20`; a imagem Docker usa 22.
- **Docker:** `node:22-alpine` (imagem pequena), `npm ci --omit=dev` (sem ESLint em produção), camada de dependências antes do código (cache), execução como usuário `node` (sem root), `HEALTHCHECK` em `/health` e `CMD ["node", ...]` direto para o processo receber o `SIGTERM` do `docker stop`.
- **Workflow com `permissions: contents: read`** (mínimo privilégio) e `concurrency` para cancelar execuções antigas do mesmo branch.
