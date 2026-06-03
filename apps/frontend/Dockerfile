FROM node:18-alpine AS production
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
