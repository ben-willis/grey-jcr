FROM node:6.13.0-alpine

WORKDIR /usr/app

COPY bin bin
COPY db db
COPY helpers helpers
COPY models models
COPY public public
COPY routes routes
COPY semantic semantic
COPY test test
COPY views views
COPY package.json .
COPY semantic.json .
COPY app.js .
COPY knexfile.js .

RUN npm install --quiet

COPY .env .env
