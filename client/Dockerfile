FROM node:12.19.0-alpine3.9 as base

WORKDIR /usr/src/app/client

COPY ./package*.json ./

###############################################

FROM base as dependencies-client

WORKDIR /usr/src/app/client

RUN npm set progress=false && npm config set depth 0

COPY ./ ./
# first installing node_modules only for produtcion and naming them prod_node_modules and building dist
RUN npm install --only=production

RUN npm run build 

###############################################

FROM base as frontend-client

WORKDIR /usr/src/app/client

COPY --from=dependencies-client /usr/src/app/client/build ./build

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s","-p","80","build"]