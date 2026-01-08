# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

ARG PORT=3000
ENV PORT=${PORT}

WORKDIR /app

# Install serve to run the built application
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["/bin/sh", "-c", "serve -s dist -l ${PORT}"]

