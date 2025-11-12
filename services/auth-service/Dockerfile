FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY ../shared ./shared

# Copy service files
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
