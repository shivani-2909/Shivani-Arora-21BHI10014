import { WebSocketServer } from 'ws';
import { GameState } from './gameState.js';
import { calculateNewPosition, sendMoveResult } from './gameLogic.js';

const wss = new WebSocketServer({ port: 8080 });
let gameState = new GameState();

wss.on('connection', ws => {
  console.log('Client connected');
  gameState.clients.push(ws);

  ws.on('message', message => {
    console.log(`Received message from client: ${message}`);
    const [command, ...args] = message.split(' ');

    switch (command) {
      case 'init':
        gameState.initGame();
        gameState.broadcastGameState();
        break;
      case 'move':
        handleMove(ws, args[0], args[1]);
        break;
      case 'newGame':
        startNewGame(ws);
        break;
      case 'quit':
        quitGame(ws);
        break;
      default:
        console.error(`Unknown message type: ${command}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    gameState.clients = gameState.clients.filter(client => client !== ws);
  });

  ws.on('error', error => {
    console.error(`Error occurred on WebSocket server: ${error}`);
  });
});

function handleMove(ws, characterId, move) {
  const character = gameState.characters.find(character => character.id === characterId);

  if (!character) {
    sendMoveResult(ws, false, 'Character not found');
    return;
  }

  try {
    const newPosition = calculateNewPosition(character, move);
    if (!newPosition || gameState.board[newPosition.y][newPosition.x] !== null) {
      sendMoveResult(ws, false, 'Invalid move');
      return;
    }

    gameState.updateGameState(character, newPosition);
    gameState.broadcastGameState();
    const winner = gameState.checkForWin();
    if (winner) {
      gameState.broadcastGameState();
      ws.send(`gameOver ${winner}`);
    }
  } catch (error) {
    console.error(`Error occurred while handling move: ${error}`);
    sendMoveResult(ws, false, 'Error occurred while handling move');
  }
}

function startNewGame(ws) {
  gameState = new GameState(); // Re-initialize game state for a new game
  gameState.initGame();
  gameState.broadcastGameState();
  console.log('New game started');
}

function quitGame(ws) {
  console.log('Client quit game');
  ws.close();
}

console.log('WebSocket server started on port 8080');
