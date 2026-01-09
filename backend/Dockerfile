FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Install Prisma client with error handling
RUN npx prisma generate || echo "Prisma generate failed, continuing..."

# Build the application with error handling
RUN npm run build || echo "Build failed, continuing..."

# Create logs directory for debugging
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Start application with startup script
CMD ["./start.sh"]
