FROM node:latest

COPY package*.json /usr
WORKDIR /usr 
RUN npm install
RUN npm install -g typescript
WORKDIR /usr/app
COPY . .
RUN tsc
CMD ["node","./dist/app.js"]
