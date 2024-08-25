import { WebSocketServer } from 'ws';
import fs from 'fs';

const wss = new WebSocketServer({ port: 8080 });

class GameState {
  constructor() {
    this.board = [];
    this.characters = [];
    this.currentPlayer = '';
    this.winner = null;
    this.moveHistory = [];
    this.clients = [];

    for (let i = 0; i < 5; i++) {
      this.board[i] = [];
      for (let j = 0; j < 5; j++) {
        this.board[i][j] = 0;
      }
    }

    this.characters = [
      { id: 'A-P1', type: 'Pawn', position: '0,0' },
      { id: 'A-H1', type: 'Hero1', position: '1,1' },
      { id: 'A-H2', type: 'Hero2', position: '2,2' },
      { id: 'A-P2', type: 'Pawn', position: '3,3' },
      { id: 'A-P3', type: 'Pawn', position: '4,4' },
      { id: 'B-P1', type: 'Pawn', position: '0,4' },
      { id: 'B-H1', type: 'Hero1', position: '1,3' },
      { id: 'B-H2', type: 'Hero2', position: '2,2' },
      { id: 'B-P2', type: 'Pawn', position: '3,1' },
      { id: 'B-P3', type: 'Pawn', position: '4,0' }
    ];
  }

  initGame() {
    this.currentPlayer = 'Player1';
  }

  updateGameState(character, newPosition) {
    character.position = newPosition;
    this.board[newPosition[0]][newPosition[1]] = character.id;
    this.currentPlayer = this.currentPlayer === 'Player1' ? 'Player2' : 'Player1';
    this.moveHistory.push({
      characterId: character.id,
      oldPosition: character.position,
      newPosition,
      timestamp: Date.now()
    });
  }

  checkForWin() {
    const player1Characters = this.characters.filter((character) => character.id.startsWith('P1'));
    const player2Characters = this.characters.filter((character) => character.id.startsWith('P2'));

    if (player1Characters.length === 0) {
      return 'Player2';
    } else if (player2Characters.length === 0) {
      return 'Player1';
    }

    return null;
  }

  broadcastGameState() {
    const gameStateString = JSON.stringify({
      board: this.board,
      characters: this.characters,
      currentPlayer: this.currentPlayer
    });

    this.clients.forEach((client) => {
      client.send(`gameState ${gameStateString}`);
    });
  }
}

let gameState = new GameState();

wss.on('connection', (ws) => {
  console.log('Client connected');
  gameState.clients.push(ws);

  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
    const messageParts = message.split(' ');

    switch (messageParts[0]) {
      case 'init':
        gameState.initGame();
        gameState.broadcastGameState();
        break;
      case 'move':
        handleMove(ws, messageParts[1], messageParts[2]);
        break;
      case 'newGame':
        startNewGame(ws);
        break;
      case 'quit':
        quitGame(ws);
        break;
      default:
        console.error(`Unknown message type: ${messageParts[0]}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    gameState.clients = gameState.clients.filter((client) => client !== ws);
  });

  ws.on('error', (error) => {
    console.error(`Error occurred on WebSocket server: ${error}`);
  });
});

function handleMove(ws, characterId, move) {
  const character = gameState.characters.find((character) => character.id === characterId);

  if (!character) {
    sendMoveResult(ws, false, 'Character not found');
    return;
  }

  try {
    const newPosition = calculateNewPosition(character, move);
    if (!newPosition) {
      sendMoveResult(ws, false, 'Invalid move');
      return;
    }

    gameState.updateGameState(character, newPosition);
    gameState.broadcastGameState();
    checkForWin();
  } catch (error) {
    console.error(`Error occurred while handling move: ${error}`);
    sendMoveResult(ws, false, 'Error occurred while handling move');
  }
}

const movementRules = {
  Pawn: {
    L: (x, y) => [x, y - 1],
    R: (x, y) => [x, y + 1],
    F: (x, y) => [x - 1, y],
    B: (x, y) => [x + 1, y],
  },
  Hero1: {
    L: (x, y) => [x, y - 2],
    R: (x, y) => [x, y + 2],
    F: (x, y) => [x - 2, y],
    B: (x, y) => [x + 2, y],
  },
  Hero2: {
    FL: (x, y) => [x - 1, y - 1],
    FR: (x, y) => [x - 1, y + 1],
    BL: (x, y) => [x + 1, y - 1],
    BR: (x, y) => [x + 1, y + 1],
  },
};

function calculateNewPosition(character, move) {
  const [x, y] = character.position.split(',').map(Number);
  const movementRule = movementRules[character.type][move];

  if (!movementRule) {
    return null;
  }

  const [newX, newY] = movementRule(x, y);

  if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5) {
    return `${newX},${newY}`;
  } else {
    return null;
  }
}

function sendMoveResult(ws, success, message) {
  ws.send(`moveResult ${success} ${message}`);
}

function checkForWin() {
  const winner = gameState.checkForWin();

  if (winner) {
    gameState.clients.forEach((client) => {
      client.send(`gameOver ${winner}`);
    });
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

// Additional error handling
process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error}`);
});

// Game state persistence (optional)
const gameStateFile = 'gameState.json';

function saveGameState() {
  fs.writeFileSync(gameStateFile, JSON.stringify(gameState));
}

function loadGameState() {
  if (fs.existsSync(gameStateFile)) {
    const gameStateString = fs.readFileSync(gameStateFile, 'utf8');
    gameState = JSON.parse(gameStateString);
  }
}

loadGameState();

gameState.initGame();
console.log('WebSocket server started on port 8080');
