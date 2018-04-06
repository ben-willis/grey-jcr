var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

module.exports = socketApi;