// index.js

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { initializeGame, processMove, getGameState } from './game.js';

const app = express();
const port = 8080;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static('public')); // Serve static files from the 'public' directory

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'initialize':
          initializeGame();
          ws.send(JSON.stringify({ type: 'gameState', gameState: getGameState() }));
          break;
        case 'move':
          if (!data.move || !data.move.characterId || !data.move.newPosition) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid move data' }));
            break;
          }
          processMove(data.move);
          broadcastGameState();
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type' }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Error handling message' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const broadcastGameState = () => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({ type: 'gameState', gameState: getGameState() }));
  });
};

server.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});