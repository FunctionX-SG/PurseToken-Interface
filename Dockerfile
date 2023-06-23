FROM node:alpine

WORKDIR /app
COPY package* ./
COPY . .

FROM nginx:alpine

# Copy SSL certificate and private key
COPY server.pem /etc/nginx/conf.d/
#COPY privkey.pem /etc/nginx/conf.d/

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 8000
EXPOSE 8443
CMD ["nginx", "-g", "daemon off;"]
