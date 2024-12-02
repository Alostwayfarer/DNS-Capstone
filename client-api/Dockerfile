FROM node:18-alpine

#Create a app directory
WORKDIR /app

#Install app dependencies
COPY package*.json ./

#Run npm install
RUN npm install

#Bundle app souce
COPY . .
RUN npx prisma generate

EXPOSE 8000

CMD [ "npm", "run", "dev"]