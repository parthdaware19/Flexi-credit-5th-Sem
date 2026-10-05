FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy root and package descriptors
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server and client dependencies
RUN cd server && npm install --production=false
RUN cd client && npm install

# Copy application source code
COPY . .

# Build React client bundle
RUN cd client && npm run build

# Install Chromium browser binary for Playwright
RUN cd server && npx playwright install chromium

EXPOSE 5000

# Start Express server (which also serves React SPA in production)
CMD ["node", "server/src/index.js"]
