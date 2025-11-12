FROM node:18-alpine

WORKDIR /app

# Copy shared files and public directory
COPY ../shared ./shared
COPY ../../public ./public

# Copy service files
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
