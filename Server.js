const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");

const app = express();
const server = http.createServer(app);

const gameServer = new Server({
    transport: new WebSocketTransport({ server }), // تنظیم transport جدید
});

// تعریف یک روم جدید
class BattleRoom extends colyseus.Room {
    onCreate(options) {
        this.maxClients = 2; // دو بازیکن در هر روم
        console.log("Battle room created!");

        // مقداردهی اولیه به وضعیت مبارزه
        this.onMessage("move", (client, message) => {
            console.log("Player moved:", message);
            // اینجا می‌توانی وضعیت حرکت بازیکن را به سایر بازیکنان اطلاع دهی
        });

        // پیام حمله
        this.onMessage("attack", (client, message) => {
            console.log("Player attacked:", message);
            // بررسی اینکه آیا حمله موفق بوده یا خیر
            this.broadcast("attack_result", { success: true, playerId: client.sessionId });
        });
    }

    onJoin(client) {
        console.log(client.sessionId, "joined the battle room.");
        
        if (this.clients.length == 2) {
            this.broadcast("start_game", "Game Started!");
        }
    }

    onLeave(client) {
        console.log(client.sessionId, "left the battle room.");
    }

    onDispose() {
        console.log("Battle room disposed.");
    }
}

// ثبت روم
gameServer.define("battle_room", BattleRoom);

server.listen(3000, () => {
    console.log("Server is running on ws://localhost:3000");
});
