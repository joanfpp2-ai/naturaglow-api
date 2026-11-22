# Imagen de la capa de aplicacion de NaturaGlow
# Node.js 24 LTS sobre Alpine Linux (imagen ligera, menor superficie de ataque)
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

# 1) Dependencias primero (aprovecha la cache de capas de Docker)
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# 2) Codigo fuente
COPY src ./src

# 3) Seguridad: el proceso NO corre como root dentro del contenedor
USER node

EXPOSE 3000

# Docker marca el contenedor como "healthy" solo si la API responde y la BD esta conectada
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
