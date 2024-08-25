// game.js

// Game state
let gameState = {
    players: [
      {
        id: 'A',
        characters: [
          { id: 'P1', type: 'Pawn', position: [0, 0] },
          { id: 'H1', type: 'Hero1', position: [1, 0] },
          { id: 'H2', type: 'Hero2', position: [2, 0] },
          { id: 'P2', type: 'Pawn', position: [3, 0] },
          { id: 'P3', type: 'Pawn', position: [4, 0] }
        ]
      },
      {
        id: 'B',
        characters: [
          { id: 'P4', type: 'Pawn', position: [0, 4] },
          { id: 'H3', type: 'Hero1', position: [1, 4] },
          { id: 'H4', type: 'Hero2', position: [2, 4] },
          { id: 'P5', type: 'Pawn', position: [3, 4] },
          { id: 'P6', type: 'Pawn', position: [4, 4] }
        ]
      }
    ],
    board: [
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null]
    ],
    currentPlayer: 'A',
    moveHistory: []
  };
  
  // Move types
  const moveTypes = {
    Pawn: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return dx === 1 && dy === 0;
      }
    },
    Hero1: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return dx === 2 && dy === 0;
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return dx === 2 && dy === 0;
      }
    },
    Hero2: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return dx === 2 && dy === 1;
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return dx === 2 && dy === 1;
      }
    },
    Hero3: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position[0]);
        const dy = Math.abs(newPosition[1] - character.position[1]);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      }
    }
  };
  
  // Process move
  const processMove = (move) => {
    const character = gameState.players.find((player) => player.characters.find((character) => character.id === move.characterId));
    const newPosition = [move.newPosition[0], move.newPosition[1]];
    if (!character) {
      return { error: 'Character not found' };
    }
    if (!moveTypes[character.type].move(character, newPosition)) {
      return { error: 'Invalid move' };
    }
    // Check for combat
    const opponentCharacter = gameState.players.find((player) => player.id !== character.playerId).characters.find((character) => character.position[0] === newPosition[0] && character.position[1] === newPosition[1]);
    if (opponentCharacter) {
        if (moveTypes[character.type].attack(character, newPosition)) {
          // Remove opponent character
          gameState.players.find((player) => player.id !== character.playerId).characters = gameState.players.find((player) => player.id !== character.playerId).characters.filter((char) => char.id !== opponentCharacter.id);
        } else {
          return { error: 'Invalid attack' };
        }
      }
      // Update character position
      character.position = newPosition;
      // Update game state
      gameState.board[character.position[0]][character.position[1]] = character.id;
      // Update move history
      gameState.moveHistory.push({ characterId: character.id, newPosition });
      // Switch current player
      gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
      return { success: true };
    };
  
    // Get game state
    export function getGameState() {
      return gameState;
    };
  
    // Handle invalid move
    const handleInvalidMove = (move) => {
      console.log(`Invalid move: ${move}`);
    };
  
    // Handle game end
    const handleGameEnd = () => {
      const winner = checkForWinner();
      if (winner) {
        console.log(`Game over! Winner is ${winner}`);
      }
    };
  
    // Check for winner
    const checkForWinner = () => {
      const playerACharacters = gameState.players[0].characters.filter((character) => character.position !== null);
      const playerBCharacters = gameState.players[1].characters.filter((character) => character.position !== null);
      if (playerACharacters.length === 0) {
        return 'B';
      } else if (playerBCharacters.length === 0) {
        return 'A';
      } else {
        return null;
      }
    };
  
    // Initialize game
    const initGame = () => {
      gameState.board.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          gameState.players.forEach((player) => {
            player.characters.forEach((character) => {
              if (character.position[0] === rowIndex && character.position[1] === cellIndex) {
                gameState.board[rowIndex][cellIndex] = character.id;
              }
            });
          });
        });
      });
    };
  
    // Start game
    initGame();
  
    // Export game functions
    module.exports = {
        initializeGame: initGame,
        processMove,
        getGameState,
        handleInvalidMove,
        handleGameEnd
      };
  
 