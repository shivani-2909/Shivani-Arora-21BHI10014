const boardElement = document.getElementById('board');
const characterSelect = document.getElementById('character');
const moveSelect = document.getElementById('move');
const moveButton = document.getElementById('moveButton');

const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to server');
    ws.send('init'); // Request game initialization
};

ws.onmessage = (event) => {
    const [type, ...data] = event.data.split(' ');

    if (type === 'gameState') {
        const gameState = JSON.parse(data.join(' '));
        updateBoard(gameState.board);
        updateCharacters(gameState.characters);
    } else if (type === 'moveResult') {
        handleMoveResult(data);
    } else if (type === 'gameOver') {
        alert(`${data[0]} wins!`);
    }
};

ws.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

ws.onclose = () => {
    console.log('Disconnected from server');
};

function updateBoard(board) {
    boardElement.innerHTML = '';
    board.forEach(row => {
        row.forEach(cell => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            if (cell) {
                const characterType = cell.split('-')[1];
                const characterElement = document.createElement('div');
                characterElement.className = `character ${characterType}`;
                cellElement.appendChild(characterElement);
            }
            boardElement.appendChild(cellElement);
        });
    });
}

function updateCharacters(characters) {
    characterSelect.innerHTML = '';
    characters.forEach(character => {
        const option = document.createElement('option');
        option.value = character.id;
        option.textContent = `${character.id} (${character.type})`;
        characterSelect.appendChild(option);
    });
}

function handleMoveResult(data) {
    const [success, message] = data;
    if (success === 'false') {
        alert(`Move failed: ${message}`);
    }
}

moveButton.addEventListener('click', () => {
    const selectedCharacterId = characterSelect.value;
    const selectedMove = moveSelect.value;
    if (selectedCharacterId && selectedMove) {
        ws.send(`move ${selectedCharacterId} ${selectedMove}`);
    }
});
