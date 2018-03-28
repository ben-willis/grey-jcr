FROM node:6.13.0-alpine

WORKDIR /usr/app

COPY package.json .
COPY semantic.json .
COPY semantic semantic

RUN npm install --quiet

COPY bin bin
COPY db db
COPY helpers helpers
COPY models models
COPY public public
COPY routes routes
COPY test test
COPY views views
COPY app.js .
COPY knexfile.js .
