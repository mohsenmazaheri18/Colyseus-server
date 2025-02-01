using UnityEngine;
using Colyseus;
using System.Threading.Tasks;

public class MultiplayerManager : MonoBehaviour
{
    private ColyseusClient client;
    private ColyseusRoom<object> room;

    async void Start()
    {
        // اتصال به سرور
        client = new ColyseusClient("ws://localhost:3000");
        
        // عضویت در روم
        room = await client.JoinOrCreate<object>("battle_room");
        Debug.Log("Connected to Room!");
        
        // دریافت پیام از سرور
        room.OnMessage<object>((message) =>
        {
            Debug.Log("Message from server: " + message);
        });
        
        room.OnMessage<string>("start_game", (message) =>
        {
            Debug.Log("Game Started!");
            // اینجا می‌توانی صحنه بازی را فعال کنی
        });
    }

    public void SendMessageToServer()
    {
        room.Send("attack", "player_attack");
        Debug.Log("Sent attack to server");
    }
    
}
