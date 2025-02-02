const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");

const app = express();
const server = http.createServer(app);

// استفاده از WebSocketTransport به جای گزینه‌های قدیمی
const gameServer = new Server({
    transport: new WebSocketTransport({ server }), // تنظیم transport جدید
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