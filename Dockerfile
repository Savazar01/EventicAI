FROM node:22-alpine AS base
WORKDIR /app

# Create necessary directory for persistence and set permissions
RUN mkdir -p /app/data && chmod 777 /app/data

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD npx tsx src/lib/migrate.ts && npm start

