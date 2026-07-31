# Multi-stage Dockerfile for Ouvidoria UPA API (Backend)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm install --omit=dev
RUN npx prisma generate

# Copy built dist files
COPY --from=builder /app/dist ./dist

# Copy entrypoint runner script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 4000

CMD ["./entrypoint.sh"]
