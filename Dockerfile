FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --production --omit=dev

# Copy application source
COPY . .

# Expose the application port
EXPOSE 3000

# Healthcheck so Docker/Kubernetes knows the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]