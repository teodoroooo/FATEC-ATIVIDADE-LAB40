# Imagem de produção do LAB40.
# Alpine: imagem pequena. Só dependências de produção (o projeto não tem nenhuma hoje).
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Copia os manifests antes do código para aproveitar o cache de camadas do Docker.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

# Roda sem root. Os arquivos ficam com dono root, então o processo só consegue lê-los.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1

# node direto (sem npm): o processo recebe o SIGTERM do `docker stop`.
CMD ["node", "src/server.js"]
