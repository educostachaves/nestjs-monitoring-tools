FROM node:13

RUN mkdir -p /home/node/app/node_modules

ARG PORT
ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN chown -R node:node /home/node/app

USER node

EXPOSE $PORT

CMD [ "yarn", "start:dev" ]
