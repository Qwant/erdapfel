FROM node:8-stretch as base

ENV PROJECT_DIR=/srv/maps-tileview/

RUN apt-get update && apt-get -y install gettext
RUN npm i npm@latest -g
RUN mkdir -p $PROJECT_DIR
RUN chown node $PROJECT_DIR

USER node
WORKDIR $PROJECT_DIR

###########################################################

FROM base as builder
COPY --chown=node . $PROJECT_DIR
RUN npm install && npm run-script build

###########################################################

FROM base

ENV NODE_ENV=production

COPY config $PROJECT_DIR/config
COPY language $PROJECT_DIR/language
COPY local_modules $PROJECT_DIR/local_modules
COPY views $PROJECT_DIR/views
COPY bin $PROJECT_DIR/bin
COPY package*.json $PROJECT_DIR
COPY --from=builder $PROJECT_DIR/public $PROJECT_DIR/public

RUN npm install --production

CMD node $PROJECT_DIR/bin/index.js
