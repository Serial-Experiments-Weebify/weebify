FROM node:24-alpine AS build-frontend

WORKDIR /frontend
COPY frontend/package*.json .

RUN npm ci 

COPY backend/src/schema.gql /schema.gql

# Run 
COPY frontend .

# Run codegen with the schema copied from the backend
RUN GQL_SCHEMA=/schema.gql npm run codegen && npm run build


FROM nginx:mainline-alpine

COPY --from=build-frontend /frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]