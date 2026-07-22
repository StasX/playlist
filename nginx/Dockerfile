FROM nginx:1.31.3-alpine3.24
RUN apk update && apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
