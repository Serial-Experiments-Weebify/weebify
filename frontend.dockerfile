FROM node:20 as build-frontend

WORKDIR /frontend
COPY frontend/package*.json .

RUN npm i 

COPY frontend .

RUN npm run build


FROM nginx:stable

COPY --from=build-frontend /frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]