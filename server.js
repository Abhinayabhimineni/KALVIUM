const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let currentPage = 1;

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'join') {
            // Send the current page to the newly joined user
            ws.send(JSON.stringify({ type: 'page_update', page: currentPage }));
        } else if (data.type === 'page_change') {
            currentPage = data.page;
            // Broadcast the new page to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'page_update', page: currentPage }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:3000');

