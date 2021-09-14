
FROM node:12.19.0-alpine3.9 as base

WORKDIR /usr/src/app

COPY ./server/package*.json ./server/
RUN npm set progress=false && npm config set depth 0

COPY ./client/package*.json ./client/

COPY ./client-admin/package*.json ./client-admin/




FROM base AS dependencies-frontend-client
# creating client dependencies
WORKDIR /usr/src/app/client
COPY ./client ./
# first installing node_modules only for produtcion and naming them prod_node_modules and building dist
RUN npm install --only=production
RUN npm run build

FROM base as frontend-client

COPY --from=dependencies-frontend-client /usr/src/app/client/build ./build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s","-p","3000","build"]

FROM base AS dependencies-backend
RUN npm set progress=false && npm config set depth 0
WORKDIR /usr/src/app/server
COPY ./server ./
# first installing node_modules only for produtcion and naming them prod_node_modules and building dist
RUN npm install --only=production
RUN npm run build 

FROM base AS dependencies-frontend-client-admin
WORKDIR /usr/src/app/client-admin
COPY ./client-admin ./
RUN npm install --only=production
RUN npm run build


#test!!!

#test!!!

#test!!!
FROM base as frontend-client-admin

COPY --from=dependencies-frontend-client-admin /usr/src/app/client-admin/build ./build

RUN npm install -g serve

CMD ["serve", "-s","-p","3000","build"]
#test!!!




#second test
FROM base as backend

ENV NODE_ENV=production

WORKDIR /usr/src/backend/

COPY --from=dependencies-backend /usr/src/app/server/node_modules ./node_modules

COPY --from=dependencies-backend /usr/src/app/server/dist ./dist

#copying the .env files
COPY --from=dependencies-backend /usr/src/app/server/.env* ./

EXPOSE 8252

CMD ["node", "dist/main.js"]
#second test


#copying the files from dependencies image
# FROM base as prod
# WORKDIR /usr/src/app/client

# # all the clinet files
# COPY --from=dependencies /usr/src/app/client/node_modules ./node_modules

# COPY --from=dependencies /usr/src/app/client/build ./build

# # all the server files
# WORKDIR /usr/src/app/server

# COPY --from=dependencies /usr/src/app/server/node_modules ./node_modules

# COPY --from=dependencies /usr/src/app/server/dist ./dist

# #copying the .env files
# COPY --from=dependencies /usr/src/app/server/.env* ./

# CMD ["node", "dist/main.js"]




