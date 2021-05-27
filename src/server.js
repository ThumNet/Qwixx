// https://boardgame.io/documentation/#/multiplayer?id=remote-master

const { Server } = require('boardgame.io/server');
const { Qwixx } = require('./Game');

const server = Server({ games: [Qwixx] });

server.run(8000);