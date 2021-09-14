FROM node:12.19.0-alpine3.9 as base

WORKDIR /usr/src/app/server

COPY ./package*.json ./

###############################################

FROM base as dependencies-server

WORKDIR /usr/src/app/server

RUN npm set progress=false && npm config set depth 0

COPY ./ ./
# first installing node_modules only for produtcion and naming them prod_node_modules and building dist
RUN npm install --only=production

RUN npm run build 

###############################################

FROM base as server

WORKDIR /usr/src/app/server/

COPY --from=dependencies-server /usr/src/app/server/node_modules ./node_modules

COPY --from=dependencies-server /usr/src/app/server/dist ./dist

#copying the .env files
COPY --from=dependencies-server /usr/src/app/server/.env* ./

ENV NODE_ENV=production

CMD node dist/main.js
