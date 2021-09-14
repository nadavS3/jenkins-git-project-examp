FROM node:12.19.0-alpine3.9 as base

WORKDIR /usr/src/app/client-admin

COPY ./package*.json ./

###############################################

FROM base as dependencies-client-admin

WORKDIR /usr/src/app/client-admin

RUN npm set progress=false && npm config set depth 0

COPY ./ ./
# first installing node_modules only for produtcion and naming them prod_node_modules and building dist
RUN npm install --only=production

RUN npm run build 

###############################################

FROM base as frontend-client-admin

WORKDIR /usr/src/app/client-admin

COPY --from=dependencies-client-admin /usr/src/app/client-admin/build ./build

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s","-p","80","build"]