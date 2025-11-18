FROM node:24-alpine AS build

WORKDIR /build

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine


WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /build/build ./

ENV NODE_ENV=production

CMD ["node", "index.js"]