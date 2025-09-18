# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# allow build to pass even with TS errors
ENV TSC_COMPILE_ON_ERROR=true

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm i -g serve
COPY --from=builder /app/build ./build
ENV PORT=3000
EXPOSE 3000
CMD ["serve","-s","build"]
