FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Copy node_modules instead of installing
COPY node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
