FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy wait script first so it can be executable
COPY wait-for-es.sh ./
RUN chmod +x wait-for-es.sh

# Copy application code
COPY . .

# Expose the application port
EXPOSE 3000

# The command will be overridden by docker-compose.yml
CMD ["npm", "start"]