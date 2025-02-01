const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { Server } = require("colyseus");

const app = express();
const server = http.createServer(app);
const gameServer = new Server({
    server,
});

// تعریف یک روم جدید
class BattleRoom extends colyseus.Room {
    onCreate(options) {
        this.maxClients = 2; // دو بازیکن در هر روم
        console.log("Room Created!");
    }
    onJoin(client) {
        console.log(client.sessionId, "joined!");
        
        if (this.clients.length == 2) {
            this.broadcast("start_game", "Game Started!");
        }
    }
}

// ثبت روم
gameServer.define("battle_room", BattleRoom);

server.listen(3000, () => {
    console.log("Server is running on ws://localhost:3000");
});