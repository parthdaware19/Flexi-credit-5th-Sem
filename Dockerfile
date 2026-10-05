FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app

ENV NODE_ENV=production

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

# Start Express server (Render injects PORT dynamically)
CMD ["node", "server/src/index.js"]
