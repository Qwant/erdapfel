FROM node:8-stretch as builder

ENV PROJECT_DIR=/srv/maps-tileview/
COPY . $PROJECT_DIR
WORKDIR $PROJECT_DIR
RUN npm install \
    && npm run-script build

FROM node:8-stretch

ENV PROJECT_DIR=/srv/maps-tileview/
ENV NODE_ENV=production

RUN mkdir $PROJECT_DIR

COPY local_modules $PROJECT_DIR/local_modules
COPY views $PROJECT_DIR/views
COPY bin $PROJECT_DIR/bin
COPY package*.json $PROJECT_DIR
COPY --from=builder $PROJECT_DIR/public $PROJECT_DIR/public

WORKDIR $PROJECT_DIR
RUN npm install -g --production

CMD node $PROJECT_DIR/bin/index.js
