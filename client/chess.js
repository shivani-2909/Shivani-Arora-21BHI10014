document.addEventListener('DOMContentLoaded', function () {
    const board = document.querySelector('.container');
    const boxes = Array.from(document.querySelectorAll('.box'));
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
                break;
            case 'WIN':
                displayWinMessage(data.message);
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
            const index = row * 5 + col;
            boxes[index].textContent = piece;
            boxes[index].setAttribute('data-piece', piece);
        }
        document.querySelector('.turn-indicator').textContent = `Player ${state.turn}'s Turn`;
    }

    function updateBoard(state) {
        initializeBoard(state);
    }

    function isValidMove(fromIndex, toIndex, piece) {
        const pieceType = piece.split('-')[1];
        const fromRow = Math.floor(fromIndex / 5);
        const fromCol = fromIndex % 5;
        const toRow = Math.floor(toIndex / 5);
        const toCol = toIndex % 5;
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (toRow === fromRow) return false; // Can't move onto own starting line

        switch (pieceType) {
            case 'P1':
            case 'P2':
            case 'P3':
                return (rowDiff === 1 && colDiff <= 1) || (rowDiff <= 1 && colDiff === 1); // Pawn moves
            case 'H1':
                return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2); // Hero1 moves
            case 'H2':
                return (rowDiff === 2 && colDiff === 2); // Hero2 moves
            default:
                return false;
        }
    }

    function clearHighlights() {
        boxes.forEach(box => box.classList.remove('highlight'));
    }

    function highlightValidMoves(piece) {
        const index = boxes.indexOf(selectedBox);
        boxes.forEach((box, i) => {
            if (isValidMove(index, i, piece) && isMoveAllowed(index, i)) {
                box.classList.add('highlight');
            }
        });
    }

    function isMoveAllowed(fromIndex, toIndex) {
        const fromPiece = boxes[fromIndex].getAttribute('data-piece');
        const toPiece = boxes[toIndex].getAttribute('data-piece');

        if (!toPiece) return true; // Empty box

        const toPieceTeam = toPiece[0];
        const fromPieceTeam = fromPiece[0];

        return toPieceTeam !== fromPieceTeam; // Can't move to a box with own team piece
    }

    function movePiece(fromBox, toBox) {
        toBox.textContent = fromBox.textContent;
        toBox.setAttribute('data-piece', fromBox.getAttribute('data-piece'));
        fromBox.textContent = '';
        fromBox.removeAttribute('data-piece');
    }

    function switchTurn() {
        turn = (turn === 'A') ? 'B' : 'A';
        document.querySelector('.turn-indicator').textContent = `Player ${turn}'s Turn`;
    }

    function displayWinMessage(message) {
        let winMessage = document.querySelector('.win-message');
        if (winMessage) {
            winMessage.textContent = message;
        } else {
            winMessage = document.createElement('div');
            winMessage.className = 'win-message';
            winMessage.textContent = message;
            document.body.appendChild(winMessage);
        }
    }

    board.addEventListener('click', function (event) {
        const clickedBox = event.target;

        if (!clickedBox.classList.contains('box')) return;

        if (selectedBox) {
            const selectedPiece = selectedBox.getAttribute('data-piece');
            const clickedPiece = clickedBox.getAttribute('data-piece');

            if (clickedBox === selectedBox) {
                clearHighlights();
                selectedBox = null;
                return;
            }

            if (selectedPiece && isValidMove(boxes.indexOf(selectedBox), boxes.indexOf(clickedBox), selectedPiece) && isMoveAllowed(boxes.indexOf(selectedBox), boxes.indexOf(clickedBox))) {
                movePiece(selectedBox, clickedBox);
                ws.send(JSON.stringify({ type: 'MOVE', from: selectedBox.getAttribute('data-piece'), to: clickedBox.getAttribute('data-piece') }));
                selectedBox = null;
                clearHighlights();
                switchTurn();
            } else {
                clearHighlights();
                selectedBox = null;
            }
        } else {
            if (clickedBox.getAttribute('data-piece') && clickedBox.getAttribute('data-piece')[0] === turn) {
                selectedBox = clickedBox;
                highlightValidMoves(selectedBox.getAttribute('data-piece'));
            }
        }
    });
});
