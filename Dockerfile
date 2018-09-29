FROM node:6.13.0-alpine

WORKDIR /usr/app

RUN apk update
RUN apk add tzdata

COPY package.json .
COPY semantic.json .
COPY semantic semantic

RUN npm install --quiet

COPY bin bin
COPY src src

EXPOSE 3000

CMD npm run start
