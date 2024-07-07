FROM node:latest

COPY package.json /usr
WORKDIR /usr 
RUN npm install
WORKDIR /usr/app
COPY . .
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "app.js"]