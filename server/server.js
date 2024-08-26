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
    gameState.pieces[piece] = [toRow, toCol];

    // Check for capture
    const capturedPiece = Object.keys(gameState.pieces).find(key =>
        key !== piece &&
        gameState.pieces[key][0] === toRow &&
        gameState.pieces[key][1] === toCol
    );

    if (capturedPiece) {
        delete gameState.pieces[capturedPiece];
    }

    const lastMove = `${piece} ${from} to ${to}${capturedPiece ? ' capturing ' + capturedPiece : ''}`;
    gameState.moveHistory.push(lastMove);
    gameState.turn = gameState.turn === 'A' ? 'B' : 'A';

    const winner = checkWin();
    if (winner) {
        broadcast({ type: 'WIN', message: `${winner} Wins!`, state: gameState, lastMove });
    } else {
        broadcast({ type: 'UPDATE', state: gameState, lastMove });
    }
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const pieceType = piece.split('-')[1];
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (toRow === fromRow) return false; // Can't move onto own starting line

    switch (pieceType) {
        case 'P1':
        case 'P2':
        case 'P3':
            return (rowDiff === 1 && colDiff <= 1) || (rowDiff <= 1 && colDiff === 1);
        case 'H1':
            return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2);
        case 'H2':
            return rowDiff === 2 && colDiff === 2;
        default:
            return false;
    }
}

function checkWin() {
    const playerAPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('A-'));
    const playerBPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('B-'));

    if (playerAPieces.length === 0) return 'Player B';
    if (playerBPieces.length === 0) return 'Player A';

    const playerAWin = playerAPieces.some(piece => gameState.pieces[piece][0] === 4);
    const playerBWin = playerBPieces.some(piece => gameState.pieces[piece][0] === 0);

    if (playerAWin) return 'Player A';
    if (playerBWin) return 'Player B';

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

