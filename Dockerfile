FROM node:12.19.0-alpine3.9

WORKDIR /usr/src/app

COPY . .
#COPY ./package*.json ./

#RUN npm install glob rimraf ??

RUN cd server && npm install && npm run build 
RUN cd client && npm install && npm run build
#changes START
#RUN rm -rf server/node_modules server/src
#RUN rm -rf client/node_modules client/src
#UN rm -rf client-admin

#changes END

#EXPOSE 3306

# RUN cd server && npm run start:dev

WORKDIR /usr/src/app/server
ENV NODE_ENV=production
#CMD ["npm", "run", "start:dev"]
CMD ["node", "dist/main.js"]
