const socket = new WebSocket('ws://localhost:8080');

let gameState = {};
let currentPlayer = '';
let moveHistory = [];
let gameOver = false;

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'gameState':
            gameState = message.data;
            renderGameState();
            break;
        case 'moveResult':
            handleMoveResult(message.data);
            break;
        case 'gameOver':
            handleGameOver(message.data);
            break;
        default:
            console.log(`Unknown message type: ${message.type}`);
    }
};

socket.onopen = () => {
    console.log('Connected to server');
};

socket.onerror = (error) => {
    console.log(`Error: ${error}`);
};

socket.onclose = () => {
    console.log('Disconnected from server');
};

document.getElementById('make-move-btn').addEventListener('click', () => {
    const moveInput = prompt('Enter move (e.g. P1:L)');
    if (moveInput) {
        const isValidMove = validateMove(moveInput, gameState, currentPlayer);
        if (isValidMove) {
            socket.send(`move ${moveInput}`);
        } else {
            alert('Invalid move!');
        }
    }
});

function renderGameState() {
    const boardHtml = '';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cellId = `cell-${i}-${j}`;
            const cellHtml = '';
            if (gameState.board[i][j] === 'P1') {
                cellHtml += '<span class="piece p1"></span>';
            } else if (gameState.board[i][j] === 'P2') {
                cellHtml += '<span class="piece p2"></span>';
            } else if (gameState.board[i][j] === 'H1') {
                cellHtml += '<span class="piece h1"></span>';
            } else if (gameState.board[i][j] === 'H2') {
                cellHtml += '<span class="piece h2"></span>';
            } else if (gameState.board[i][j] === 'H3') {
                cellHtml += '<span class="piece h3"></span>';
            }
            document.getElementById(cellId).innerHTML = cellHtml;
        }
    }
    document.getElementById('game-board').innerHTML = boardHtml;
}

function handleMoveResult(moveResult) {
    if (moveResult.valid) {
        moveHistory.push(moveResult.move);
        document.getElementById('move-history').innerHTML = moveHistory.join('<br>');
    } else {
        alert(`Invalid move: ${moveResult.error}`);
    }
}

function handleGameOver(winner) {
    gameOver = true;
    document.getElementById('game-over-message').innerHTML = `Game Over! ${winner} wins!`;
    document.getElementById('make-move-btn').disabled = true;
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.addEventListener('click', () => {
        socket.send('newGame');
        gameOver = false;
        document.getElementById('game-over-message').innerHTML = '';
        document.getElementById('make-move-btn').disabled = false;
    });
    document.getElementById('game-over-message').appendChild(playAgainBtn);
}

function validateMove(move, gameState, currentPlayer) {
    const moveParts = move.split(':');
    const pieceType = moveParts[0];
    const moveDirection = moveParts[1];
    const pieceIndex = gameState.board.findIndex((row) => row.includes(pieceType));
    const piecePosition = gameState.board[pieceIndex].indexOf(pieceType);
    const targetPosition = getTargetPosition(piecePosition, moveDirection);
    if (targetPosition === -1) {
        return false; // move is out of bounds
    }
    const targetPiece = gameState.board[targetPosition.y][targetPosition.x];
    if (targetPiece && targetPiece.startsWith(currentPlayer)) {
        return false; // cannot move onto own piece
    }
    if (pieceType === 'P1' || pieceType === 'P2') {
        if (moveDirection === 'L' || moveDirection === 'R') {
            return true; // pawn can move left or right
        } else {
            return false; // pawn cannot move in other directions
        }
    } else if (pieceType === 'H1' || pieceType === 'H2') {
        if (moveDirection === 'F' || moveDirection === 'B') {
            return true; // hero can move forward or backward
        } else {
            return false; // hero cannot move in other directions
        }
    } else if (pieceType === 'H3') {
        if (moveDirection === 'FL' || moveDirection === 'FR' || moveDirection === 'BL' || moveDirection === 'BR') {
            return true; // hero 3 can move diagonally
        } else {
            return false; // hero 3 cannot move in other directions
        }
    }
    return false; // invalid move
}

function getTargetPosition(piecePosition, moveDirection) {
    const x = piecePosition.x;
    const y = piecePosition.y;
    switch (moveDirection) {
        case 'L':
            return { x: x - 1, y: y };
        case 'R':
            return { x: x + 1, y: y };
        case 'F':
            return { x: x, y: y - 1 };
        case 'B':
            return { x: x, y: y + 1 };
        case 'FL':
            return { x: x - 1, y: y - 1 };
        case 'FR':
            return { x: x + 1, y: y - 1 };
        case 'BL':
            return { x: x - 1, y: y + 1 };
        case 'BR':
            return { x: x + 1, y: y + 1 };
        default:
            return -1; // invalid move direction
    }
}