/// <reference path="server-ref" />
/// <reference path="server/dt/node-0.11.d.ts" />
/// <reference path="server/dt/ws.d.ts" />

declare var Config : any;

import WebSocketServer = require('ws');

var Game : Server.Game = require('./Game.js').Server.Game;

var wss = new WebSocketServer.Server({port: 80});

wss.on('connection', function connection (ws : WebSocketServer) {
    ws.on('message', function incoming (message) {
        console.log('received: %s', message);
    });

    ws.send('reply');
});

console.log("Server Started on port 80");

var game = new Game();