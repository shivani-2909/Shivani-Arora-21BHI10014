document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const board = document.querySelector('.container');
    const boxes = Array.from(document.querySelectorAll('.box'));
    const moveList = document.getElementById('moveList');
    let selectedBox = null;
    let turn = 'A';

    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:5500');

    // Handle messages from the server
    ws.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'INIT':
                initializeBoard(data.state);
                break;
            case 'UPDATE':
                updateBoard(data.state);
                updateMoveHistory(data.lastMove);
                break;
            case 'WIN':
                updateBoard(data.state);
                updateMoveHistory(data.lastMove);
                displayWinMessage(data.message);
                break;
            case 'INVALID_MOVE':
                alert('Invalid move. Please try again.');
                break;
        }
    });

    // Initialize the game board
    function initializeBoard(state) {
        boxes.forEach(box => {
            box.textContent = '';
            box.removeAttribute('data-piece');
        });
        for (const piece in state.pieces) {
            const [row, col] = state.pieces[piece];
            const box = document.getElementById(`b${row}${col}`);
            box.textContent = piece;
            box.setAttribute('data-piece', piece);
        }
        document.querySelector('.turn-indicator').textContent = `Player ${state.turn}'s Turn`;
        turn = state.turn;
        updateMoveHistoryDisplay(state.moveHistory);
    }

    // Update the board after a move
    function updateBoard(state) {
        initializeBoard(state);
    }

    // Add a new move to the move history
    function updateMoveHistory(lastMove) {
        if (lastMove) {
            const moveItem = document.createElement('li');
            moveItem.textContent = lastMove;
            moveList.appendChild(moveItem);
            moveList.scrollTop = moveList.scrollHeight;
        }
    }

    // Update the entire move history display
    function updateMoveHistoryDisplay(moveHistory) {
        moveList.innerHTML = '';
        moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('li');
            moveItem.textContent = `${index + 1}. ${move}`;
            moveList.appendChild(moveItem);
        });
        moveList.scrollTop = moveList.scrollHeight;
    }

    // Display the win message and new game button
    function displayWinMessage(message) {
        const winDialog = document.createElement('div');
        winDialog.className = 'win-dialog';
        winDialog.innerHTML = `
            <div class="win-content">
                <h2>${message}</h2>
                <button id="newGameBtn">New Game</button>
            </div>
        `;
        document.body.appendChild(winDialog);
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            ws.send(JSON.stringify({ type: 'RESET' }));
            winDialog.remove();
        });
    }

    // Handle clicks on the game board
    board.addEventListener('click', function (event) {
        const clickedBox = event.target.closest('.box');
        if (!clickedBox) return;

        const piece = clickedBox.getAttribute('data-piece');
        const player = piece ? piece[0] : null;

        if (selectedBox) {
            if (clickedBox === selectedBox) {
                deselectBox();
            } else if (player === turn) {
                deselectBox();
                selectBox(clickedBox);
            } else {
                const fromId = selectedBox.id;
                const toId = clickedBox.id;
                ws.send(JSON.stringify({
                    type: 'MOVE',
                    from: `${fromId[1]}-${fromId[2]}`,
                    to: `${toId[1]}-${toId[2]}`
                }));
                deselectBox();
            }
        } else if (piece && player === turn) {
            selectBox(clickedBox);
        }
    });

    // Select a box and highlight valid moves
    function selectBox(box) {
        selectedBox = box;
        box.classList.add('selected');
        box.classList.add(turn === 'A' ? 'selected-a' : 'selected-b');
        highlightValidMoves(box);
    }

    // Deselect the currently selected box
    function deselectBox() {
        if (selectedBox) {
            selectedBox.classList.remove('selected', 'selected-a', 'selected-b');
            clearHighlights();
            selectedBox = null;
        }
    }

    // Highlight valid moves for the selected piece
    function highlightValidMoves(box) {
        const piece = box.getAttribute('data-piece');
        const [row, col] = box.id.slice(1).split('').map(Number);
        
        boxes.forEach(targetBox => {
            const [targetRow, targetCol] = targetBox.id.slice(1).split('').map(Number);
            if (isValidMove(piece, row, col, targetRow, targetCol)) {
                const targetPiece = targetBox.getAttribute('data-piece');
                if (!targetPiece || targetPiece[0] !== turn) {
                    targetBox.classList.add('highlight');
                }
            }
        });
    }

    // Clear all highlighted moves
    function clearHighlights() {
        boxes.forEach(box => box.classList.remove('highlight'));
    }

    // Check if a move is valid for a given piece
    function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
        const pieceType = piece.split('-')[1][0];
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
    
        switch (pieceType) {
            case 'P':
                // Pawn moves one block in any direction (Left, Right, Forward, or Backward)
                return (Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1);
            case 'H':
                // Hero moves two blocks in a specific direction depending on its type
                if (piece.endsWith('1')) {
                    // Hero1 moves two blocks straight in any direction (Left, Right, Forward, or Backward)
                    return (Math.abs(rowDiff) === 2 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 2);
                } else if (piece.endsWith('2')) {
                    // Hero2 moves two blocks diagonally in any direction
                    return Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2;
                }
        }
        return false;
    }
});