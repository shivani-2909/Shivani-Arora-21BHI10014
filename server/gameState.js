// gameState.js

let gameState = {
    currentPlayer: 0,
    players: [
      {
        id: 0,
        characters: [
          { id: 0, type: 'Pawn', position: { x: 0, y: 0 }, isAlive: true },
          { id: 1, type: 'Hero1', position: { x: 1, y: 0 }, isAlive: true },
          { id: 2, type: 'Hero2', position: { x: 2, y: 0 }, isAlive: true },
          { id: 3, type: 'Pawn', position: { x: 3, y: 0 }, isAlive: true },
          { id: 4, type: 'Pawn', position: { x: 4, y: 0 }, isAlive: true },
        ],
      },
      {
        id: 1,
        characters: [
          { id: 0, type: 'Pawn', position: { x: 0, y: 4 }, isAlive: true },
          { id: 1, type: 'Hero1', position: { x: 1, y: 4 }, isAlive: true },
          { id: 2, type: 'Hero2', position: { x: 2, y: 4 }, isAlive: true },
          { id: 3, type: 'Pawn', position: { x: 3, y: 4 }, isAlive: true },
          { id: 4, type: 'Pawn', position: { x: 4, y: 4 }, isAlive: true },
        ],
      },
    ],
    board: [],
  };
  
  for (let i = 0; i < 5; i++) {
    gameState.board.push([]);
    for (let j = 0; j < 5; j++) {
      gameState.board[i].push(null);
    }
  }
  
  // Initialize the board with the characters
  gameState.players.forEach((player) => {
    player.characters.forEach((character) => {
      gameState.board[character.position.y][character.position.x] = character;
    });
  });
  
  export { gameState };