document.addEventListener('DOMContentLoaded', function () {
    const board = document.querySelector('.container');
    const boxes = Array.from(document.querySelectorAll('.box'));
    const moveList = document.getElementById('moveList');
    let selectedBox = null;
    let turn = 'A';

    const ws = new WebSocket('ws://localhost:5500');

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

    function updateBoard(state) {
        initializeBoard(state);
    }

    function updateMoveHistory(lastMove) {
        if (lastMove) {
            const moveList = document.getElementById('moveList');
            const moveItem = document.createElement('li');
            moveItem.textContent = lastMove;
            moveList.appendChild(moveItem);
            moveList.scrollTop = moveList.scrollHeight;
        }
    }

    function updateMoveHistoryDisplay(moveHistory) {
        moveList.innerHTML = '';
        moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('li');
            moveItem.textContent = `${index + 1}. ${move}`;
            moveList.appendChild(moveItem);
        });
        moveList.scrollTop = moveList.scrollHeight;
    }

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

    function selectBox(box) {
        selectedBox = box;
        box.classList.add('selected');
        box.classList.add(turn === 'A' ? 'selected-a' : 'selected-b');
        highlightValidMoves(box);
    }

    function deselectBox() {
        if (selectedBox) {
            selectedBox.classList.remove('selected', 'selected-a', 'selected-b');
            clearHighlights();
            selectedBox = null;
        }
    }

    function highlightValidMoves(box) {
        const piece = box.getAttribute('data-piece');
        const [row, col] = box.id.slice(1).split('').map(Number);
        
        boxes.forEach(targetBox => {
            const [targetRow, targetCol] = targetBox.id.slice(1).split('').map(Number);
            if (isValidMove(piece, row, col, targetRow, targetCol)) {
                targetBox.classList.add('highlight');
            }
        });
    }

    function clearHighlights() {
        boxes.forEach(box => box.classList.remove('highlight'));
    }

    function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
        const pieceType = piece.split('-')[1];
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (toRow === fromRow) return false;

        switch (pieceType) {
            case 'P1':
            case 'P2':
            case 'P3':
                return (rowDiff === 1 && colDiff <= 1) || (rowDiff <= 1 && colDiff === 1);
            case 'H1':
                return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2);
            case 'H2':
                return (rowDiff === 2 && colDiff === 2);
            default:
                return false;
        }
    }
});

