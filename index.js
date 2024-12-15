const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');
const NodeMediaServer = require('node-media-server');
const path = require('path');

const app = express();
expressWs(app); // Enable WebSocket support

// Setup RTMP server with node-media-server
const nms = new NodeMediaServer({
  logType: 3,
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: true,
    ping: 30,
    ping_interval: 60,
  },
  http: {
    port: 8000,
    mediaroot: './media',
    webroot: './www',
    allow_origin: '*',
  },
});
nms.run();

// Serve static files like chat client (if needed)
app.use(express.static(path.join(__dirname, 'www')));

// WebSocket for live chat
const chatClients = {}; // Store chat clients per streamID

// Handle WebSocket chat connection
app.ws('/stream/:streamID/chat', (ws, req) => {
  const { streamID } = req.params;

  // Store the WebSocket connection in chatClients
  if (!chatClients[streamID]) {
    chatClients[streamID] = [];
  }

  chatClients[streamID].push(ws);

  // Broadcast incoming messages to other clients in the same stream
  ws.on('message', (message) => {
    console.log(`Chat message for stream ${streamID}: ${message}`);
    chatClients[streamID].forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Remove the WebSocket connection when the client disconnects
  ws.on('close', () => {
    chatClients[streamID] = chatClients[streamID].filter((client) => client !== ws);
  });
});

// RTMP streaming endpoint (just for understanding; it's handled by node-media-server internally)
app.post('/stream/:streamID/post', (req, res) => {
  res.status(200).send('RTMP stream is being processed');
});

// You can use this endpoint to handle the client-side chat
app.get('/stream/:streamID/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

app.listen(3000, () => {
  console.log('Express server running on http://localhost:3000');
});
