FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Use npm install instead of npm ci to avoid lockfile requirement in this subproject
RUN npm install --omit=dev

COPY index.js ./
COPY default-state.json ./

ENV PORT=9379
EXPOSE 9379

CMD ["node", "index.js"]


