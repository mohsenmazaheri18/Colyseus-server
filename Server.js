const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");

const app = express();
const server = http.createServer(app);

const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
});

// تعریف یک روم جدید
class BattleRoom extends colyseus.Room {
    onCreate(options) {
        this.maxClients = 2; // دو بازیکن در هر روم
        this.players = {}; // نگهداری اطلاعات بازیکنان
        this.readyPlayers = 0; // شمارش بازیکن‌های آماده برای شروع بازی
        console.log("Battle room created!");

        // وقتی پیام "move" از کلاینت دریافت می‌شود
        this.onMessage("move", (client, message) => {
            console.log("Player moved:", message);
        });

        // وقتی پیام "attack" از کلاینت دریافت می‌شود
        this.onMessage("attack", (client, message) => {
            console.log("Player attacked:", message);
            
            // کاهش سلامت بازیکن مقابل
            const targetClient = this.clients.find(c => c.sessionId !== client.sessionId);
            if (targetClient) {
                const targetPlayer = this.players[targetClient.sessionId];
                targetPlayer.health -= message.damage;

                console.log(`${targetClient.sessionId} health: ${targetPlayer.health}`);
                
                // ارسال نتیجه حمله به کلاینت‌ها
                this.broadcast("attack_result", { 
                    success: true, 
                    playerId: client.sessionId, 
                    targetPlayerId: targetClient.sessionId,
                    newHealth: targetPlayer.health 
                });
                
                // بررسی اینکه اگر سلامت به صفر برسد، بازی تمام شود
                if (targetPlayer.health <= 0) {
                    this.broadcast("game_over", { winner: client.sessionId });
                }
            }
        });

        // وقتی یک بازیکن دکمه ready رو می‌زند
        this.onMessage("ready", (client) => {
            console.log(client.sessionId + " is ready!");

            // افزایش شمارش بازیکنان آماده
            this.readyPlayers++;

            // اگر هر دو بازیکن آماده بودند، بازی آغاز می‌شود
            if (this.readyPlayers === 2) {
                this.broadcast("start_game", "Game Started!");
            }
        });
    }

    onJoin(client) {
        console.log(client.sessionId, "joined the battle room.");
        
        // مقداردهی اولیه وضعیت هر بازیکن
        this.players[client.sessionId] = { health: 100 }; // هر بازیکن با 100 سلامت شروع می‌کند
    }

    onLeave(client) {
        console.log(client.sessionId, "left the battle room.");
        delete this.players[client.sessionId];
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
