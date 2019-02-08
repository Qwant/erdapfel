FROM node:8-stretch-slim as base

ENV PROJECT_DIR=/srv/maps-tileview/

RUN apt-get update && apt-get -y install \
  gettext git python build-essential

RUN npm i npm@latest -g
RUN mkdir -p $PROJECT_DIR
RUN chown node $PROJECT_DIR

USER node
WORKDIR $PROJECT_DIR

###########################################################

FROM base as builder
COPY --chown=node . $PROJECT_DIR

# Install with dev and build dependencies
# 'npm prepare' is called after install
RUN npm install

RUN NODE_ENV=production npm run-script build -- --mode=production

# Pre-build gzipped versions of static files
# They will be served directly by express-static-gzip
RUN cd public && find . -type f ! -name '*.gz' ! -name '*.jpg' ! -name '*.png' ! -name '*.woff*' -exec gzip -k "{}" \;

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
