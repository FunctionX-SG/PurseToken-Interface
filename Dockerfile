# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If you use Next standalone output, uncomment next line and adjust runner stage
# RUN sed -i '1s/^/module.exports = { output: "standalone", ...require("./next.config") }/' /dev/null
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# If using standalone output:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# Simple (non-standalone) runtime:
COPY --from=builder /app/.next ./.next
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm","start"]
