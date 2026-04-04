FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

# Always keep RUN npm install after COPY . . due to layer caching.
