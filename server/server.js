// Import required modules
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const open = require('open');

// Set up Express app and create HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define initial positions for all pieces
const initialPositions = {
    'A-P1': [0, 0], 'A-P2': [0, 1], 'A-H1': [0, 2], 'A-H2': [0, 3], 'A-P3': [0, 4],
    'B-P1': [4, 0], 'B-P2': [4, 1], 'B-H1': [4, 2], 'B-H2': [4, 3], 'B-P3': [4, 4]
};

// Initialize game state
let gameState = {
    pieces: { ...initialPositions },
    turn: 'A',
    moveHistory: []
};

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    // Send initial game state to the newly connected client
    ws.send(JSON.stringify({ type: 'INIT', state: gameState }));

    // Handle incoming messages from clients
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

// Handle a move attempt from a client
function handleMove(data, ws) {
    const { from, to } = data;
    const [fromRow, fromCol] = from.split('-').map(Number);
    const [toRow, toCol] = to.split('-').map(Number);

    // Find the piece being moved
    const piece = Object.keys(gameState.pieces).find(key =>
        gameState.pieces[key][0] === fromRow &&
        gameState.pieces[key][1] === fromCol
    );

    // Check if the move is valid
    if (!piece || piece[0] !== gameState.turn || !isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
        ws.send(JSON.stringify({ type: 'INVALID_MOVE' }));
        return;
    }

    // Execute the move and capture any pieces
    const capturedPieces = movePiece(piece, toRow, toCol);

    // Update move history
    const lastMove = `${piece} ${from} to ${to}${capturedPieces.length > 0 ? ' capturing ' + capturedPieces.join(', ') : ''}`;
    gameState.moveHistory.push(lastMove);
    
    // Switch turns
    gameState.turn = gameState.turn === 'A' ? 'B' : 'A';

    // Check for a win
    const winner = checkWin();
    if (winner) {
        broadcast({ type: 'WIN', message: `Player ${winner} Wins!`, state: gameState, lastMove });
    } else {
        broadcast({ type: 'UPDATE', state: gameState, lastMove });
    }
}

// Check if a move is valid for a given piece
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
        case 'P': // Pawn
            // Pawn moves one block in any direction (Left, Right, Forward, or Backward)
            return (Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1);
        case 'H': // Hero
            if (piece.endsWith('1')) { // Hero1
                return (Math.abs(rowDiff) === 2 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 2);
            } else if (piece.endsWith('2')) { // Hero2
                return Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2;
            }
    }
    return false;
}

// Move a piece and capture any pieces in its path
function movePiece(piece, toRow, toCol) {
    const [fromRow, fromCol] = gameState.pieces[piece];
    const pieceType = piece.split('-')[1][0];
    const capturedPieces = [];

    if (pieceType === 'H') {
        // For Heroes, check for captures along the path
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

    // Check for capture at the destination
    const capturedPiece = Object.keys(gameState.pieces).find(key =>
        gameState.pieces[key][0] === toRow &&
        gameState.pieces[key][1] === toCol &&
        key[0] !== piece[0]
    );

    if (capturedPiece) {
        delete gameState.pieces[capturedPiece];
        capturedPieces.push(capturedPiece);
    }

    // Update the piece's position
    gameState.pieces[piece] = [toRow, toCol];
    return capturedPieces;
}

// Check if a player has won
function checkWin() {
    const playerAPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('A-'));
    const playerBPieces = Object.keys(gameState.pieces).filter(piece => piece.startsWith('B-'));

    if (playerAPieces.length === 0) return 'B';
    if (playerBPieces.length === 0) return 'A';

    return null;
}

// Reset the game to its initial state
function resetGame() {
    gameState = {
        pieces: { ...initialPositions },
        turn: 'A',
        moveHistory: []
    };
}

// Broadcast a message to all connected clients
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Start the server and open the game in the default browser
server.listen(5500, () => {
    console.log('Server is listening on port 5500');
    open('http://localhost:5500');
});