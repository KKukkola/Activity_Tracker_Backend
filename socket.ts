import WebSocket from "ws";

const wsServer = new WebSocket.Server({
    noServer: true
});

wsServer.on("connection", function(ws) {
    
    ws.on("message", function(msg) {
        wsServer.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg.toString());
            }
        });
    });

})

wsServer.on('upgrade', async function upgrade(request, socket, head) {
    
    // accepts half requests and rejects half. Reload browser page in case of rejection
    // if(Math.random() > 0.5){
    //     return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii")     //proper connection close in case of rejection
    // }
    
    // emit connection when request accepted
    wsServer.handleUpgrade(request, socket, head, function done(ws) {
      wsServer.emit('connection', ws, request);
    });
});

export default wsServer;