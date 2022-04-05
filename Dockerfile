FROM node:16.14.2-stretch-slim as base

ENV PROJECT_DIR=/srv/maps-tileview/

RUN apt-get update && apt-get -y install --no-install-recommends \
    gettext git python3 build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm i npm@"8.5.0" -g
RUN mkdir -p $PROJECT_DIR
RUN chown node $PROJECT_DIR

USER node
WORKDIR $PROJECT_DIR

###########################################################

FROM base as builder
COPY --chown=node package*.json $PROJECT_DIR
COPY --chown=node build $PROJECT_DIR/build
COPY --chown=node local_modules $PROJECT_DIR/local_modules

# Install with dev and build dependencies
# 'npm prepare' is called after install
RUN npm ci

COPY --chown=node . $PROJECT_DIR

RUN NODE_ENV=production npm run-script build -- --mode=production

# Pre-build gzipped versions of static files
# They will be served directly by express-static-gzip
RUN cd public && find . -type f ! -name '*.gz' ! -name '*.jpg' ! -name '*.png' ! -name '*.woff*' -exec gzip -k "{}" \;

###########################################################

FROM base

ENV NODE_ENV=production

COPY local_modules $PROJECT_DIR/local_modules
COPY package*.json $PROJECT_DIR

# As all static files will be copied from the previous step, 'prepare' script is not needed
RUN IGNORE_PREPARE=true npm ci --production

COPY config $PROJECT_DIR/config
COPY language $PROJECT_DIR/language
COPY views $PROJECT_DIR/views
COPY bin $PROJECT_DIR/bin
COPY --from=builder $PROJECT_DIR/public $PROJECT_DIR/public

CMD node $PROJECT_DIR/bin/index.js
