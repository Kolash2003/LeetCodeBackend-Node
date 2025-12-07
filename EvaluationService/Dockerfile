FROM node:18-alpine

WORKDIR /app

# copy package files and install dependencies (inside container)
COPY package*.json ./
RUN npm ci

# install nodemon and ts-node globally so npm run dev works
RUN npm install -g nodemon ts-node typescript

# copy source
COPY . .

EXPOSE 3002

CMD ["npm", "run", "dev"]

# install docker CLI (Alpine)
RUN apk add --no-cache docker-cli || apk add --no-cache docker

