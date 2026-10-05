FROM node:22.12.0-bookworm

WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
RUN cd server && npm install

# Install client dependencies including Vite
RUN cd client && npm install --include=dev

# Copy application source
COPY . .

# Build React frontend
RUN cd client && npm run build

# Install Chromium for Playwright
RUN cd server && npx playwright install --with-deps chromium

# Production environment
ENV NODE_ENV=production

# Start Express server
CMD ["node", "server/src/index.js"]