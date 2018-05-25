FROM node:8-stretch

ENV PROJECT_DIR=/srv/maps-tileview/
ENV NODE_ENV=production

RUN mkdir $PROJECT_DIR

COPY public $PROJECT_DIR/public
COPY bin $PROJECT_DIR/bin
COPY views $PROJECT_DIR/views
COPY package*.json $PROJECT_DIR

WORKDIR $PROJECT_DIR

RUN npm install -g --production

CMD node bin/app.js
