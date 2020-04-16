# build stage
FROM node:lts-alpine as build-stage
RUN apk add --no-cache git
WORKDIR /app
COPY package.json ./
RUN rm -rf node_modules && npm install
COPY . .
RUN npm run build

# production stage
FROM fholzer/nginx-brotli as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker build -t artificialsolutions-tiva/tiva-leopard-ui .
# docker run -it -p 8080:80 --rm --name tiva-leopard-ui artificialsolutions-tiva/tiva-leopard-ui