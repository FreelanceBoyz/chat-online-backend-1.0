FROM node:12.13.0
WORKDIR /server

COPY . /server
RUN npm install --silent

EXPOSE 4200 4000
CMD [ "npm", "run" ,"start:prod" ]