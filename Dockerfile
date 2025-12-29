# syntax=docker/dockerfile:1
FROM node:24-alpine

WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest
COPY . .

EXPOSE 5173

# Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
