import WebSocket from "ws";

const port = 8001;

export default function(): WebSocket.Server {
    
    const wsServer = new WebSocket.Server({
        port: port
    });

    wsServer.on("connection", function(ws) {
        console.log("Client Connected");

        ws.on("message", function(msg) {
            wsServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg.toString());
                }
            });
        });

        ws.on("close", function() {
            console.log("Client disconnected");
        });

        ws.onerror = function() {
            console.log("Some Error occurred");
        }
    })

    wsServer.on('upgrade', async function upgrade(request, socket, head) {
        
        // emit connection when request accepted
        wsServer.handleUpgrade(request, socket, head, function done(ws) {
        wsServer.emit('connection', ws, request);
        });
    });

    console.log("WebSocket Running at", port);

    return wsServer;
};
