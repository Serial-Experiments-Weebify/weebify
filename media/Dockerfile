FROM node:20-alpine AS build

WORKDIR /build

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /build/build ./

CMD ["node", "index.js"]