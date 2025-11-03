FROM node:20-alpine AS build

WORKDIR /build

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i --only=production

COPY --from=build /build/dist ./

CMD ["node", "main.js"]