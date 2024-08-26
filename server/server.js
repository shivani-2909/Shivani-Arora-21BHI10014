const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const open = require('open');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const initialPositions = {
    'A-P1': [0, 0], 'A-P2': [0, 1], 'A-H1': [0, 2], 'A-H2': [0, 3], 'A-P3': [0, 4],
    'B-P1': [4, 0], 'B-P2': [4, 1], 'B-H1': [4, 2], 'B-H2': [4, 3], 'B-P3': [4, 4]
};

let gameState = {
    pieces: { ...initialPositions },
    turn: 'A',
    moveHistory: []
};

app.use(express.static(path.join(__dirname, '../client')));

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'INIT', state: gameState }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'MOVE') {
            handleMove(data, ws);
        } else if (data.type === 'RESET') {
            resetGame();
            broadcast({ type: 'INIT', state: gameState });
        }
    });
});

function handleMove(data, ws) {
    const { from, to } = data;
    const [fromRow, fromCol] = from.split('-').map(Number);
    const [toRow, toCol] = to.split('-').map(Number);

    const piece = Object.keys(gameState.pieces).find(key =>
        gameState.pieces[key][0] === fromRow &&
        gameState.pieces[key][1] === fromCol
    );

    if (!piece || piece[0] !== gameState.turn || !isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
        ws.send(JSON.stringify({ type: 'INVALID_MOVE' }));
        return;
    }

    // Execute the move
    const capturedPieces = movePiece(piece, toRow, toCol);

    const lastMove = `${piece} ${from} to ${to}${capturedPieces.length > 0 ? ' capturing ' + capturedPieces.join(', ') : ''}`;
    gameState.moveHistory.push(lastMove);
    gameState.turn = gameState.turn === 'A' ? 'B' : 'A';

    const winner = checkWin();
    if (winner) {
        broadcast({ type: 'WIN', message: `Player ${winner} Wins!`, state: gameState, lastMove });
    } else {
        broadcast({ type: 'UPDATE', state: gameState, lastMove });
    }
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
  const pieceType = piece.split('-')[1][0];
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Check if the destination is occupied by a friendly piece
  const destPiece = Object.keys(gameState.pieces).find(key =>
      gameState.pieces[key][0] === toRow &&
      gameState.pieces[key][1] === toCol
  );
  if (destPiece && destPiece[0] === piece[0]) return false;

  switch (pieceType) {
      case 'P':
          // Pawn moves one block in any direction (Left, Right, Forward, or Backward)
          return (Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1);
      case 'H':
          if (piece.endsWith('1')) {
              return (Math.abs(rowDiff) === 2 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 2);
          } else if (piece.endsWith('2')) {
              return Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2;
          }
  }
  return false;
}

function movePiece(piece, toRow, toCol) {
    const [fromRow, fromCol] = gameState.pieces[piece];
    const pieceType = piece.split('-')[1][0];
    const capturedPieces = [];

    if (pieceType === 'H') {
        const rowStep = Math.sign(toRow - fromRow);
        const colStep = Math.sign(toCol - fromCol);
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;

        while (currentRow !== toRow || currentCol !== toCol) {
            const capturedPiece = Object.keys(gameState.pieces).find(key =>
                gameState.pieces[key][0] === currentRow &&
                gameState.pieces[key][1] === currentCol &&
                key[0] !== piece[0]
            );
            if (capturedPiece) {
                delete gameState.pieces[capturedPiece];
                capturedPieces.push(capturedPiece);
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
    }

    const capturedPiece = Object.keys(gameState.pieces).find(key =>
        gameState.pieces[key][0] === toRow &&
        gameState.pieces[key][1] === toCol &&
        key[0] !== piece[0]
    );

    if (capturedPiece) {
        delete gameState.pieces[capturedPiece];
        capturedPieces.push(capturedPiece);
    }

    gameState.pieces[piece] = [toRow, toCol];
    return capturedPieces;
}

function checkWin() {
    const playerAPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('A-'));
    const playerBPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('B-'));

    if (playerAPieces.length === 0) return 'B';
    if (playerBPieces.length === 0) return 'A';

    return null;
}

function resetGame() {
    gameState = {
        pieces: { ...initialPositions },
        turn: 'A',
        moveHistory: []
    };
}

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

server.listen(5500, () => {
    console.log('Server is listening on port 5500');
    open('http://localhost:5500');
});