var socket_io = require('socket.io');
var io = socket_io();

const redisAdapter = require("socket.io-redis")({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

io.adapter(redisAdapter);

var socketApi = {};

socketApi.io = io;

module.exports = socketApi;