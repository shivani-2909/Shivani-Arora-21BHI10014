// gameLogic.js

import { gameState } from './gameState';
import moveTypes from './moveTypes';

export const validateMove = (move) => {
    const character = gameState.players.find((player) => player.characters.find((character) => character.id === move.characterId));
    if (!character) {
      return { error: 'Character not found' };
    }
  
    if (!moveTypes[character.type].move(character, move.newPosition)) {
      return { error: 'Invalid move' };
    }
  
    if (move.newPosition.y < 0 || move.newPosition.y >= 5 || move.newPosition.x < 0 || move.newPosition.x >= 5) {
      return { error: 'Move out of bounds' };
    }
  
    if (gameState.board[move.newPosition.y][move.newPosition.x] !== null) {
      return { error: 'Space already occupied' };
    }
  
    return { valid: true };
  };
  
  export const processMove = (move) => {
    const character = gameState.players.find((player) => player.characters.find((character) => character.id === move.characterId));
    character.position = move.newPosition;
  
    if (moveTypes[character.type].attack) {
      const opponentCharacters = gameState.players.find((player) => player !== character.player).characters;
      opponentCharacters.forEach((opponentCharacter) => {
        if (opponentCharacter.position.x === move.newPosition.x && opponentCharacter.position.y === move.newPosition.y) {
          opponentCharacter.isAlive = false;
        }
      });
    }
  
    gameState.board[move.newPosition.y][move.newPosition.x] = character;
  };
  
  export const checkForWinner = () => {
    // Check if Player 1 has won
    const player1CharactersAlive = gameState.players[0].characters.filter((character) => character.isAlive);
    if (player1CharactersAlive.length === 0) {
      return { winner: 1 };
    }
  
    // Check if Player 2 has won
    const player2CharactersAlive = gameState.players[1].characters.filter((character) => character.isAlive);
    if (player2CharactersAlive.length === 0) {
      return { winner: 0 };
    }
  
    // If no one has won, return null
    return { winner: null };
  };
  
  export const handleGameEnd = (winner) => {
    if (winner !== null) {
      // Emit a "gameOver" event to all connected clients
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({
          type: 'gameOver',
          winner: winner === 0 ? 'Player 1' : 'Player 2',
        }));
      });
  
      // Reset game state
      gameState.players.forEach((player) => {
        player.characters.forEach((character) => {
          character.isAlive = true;
          character.position = { x: 0, y: 0 };
        });
      });
  
      gameState.board = [];
      for (let i = 0; i < 5; i++) {
        gameState.board.push([]);
        for (let j = 0; j < 5; j++) {
          gameState.board[i].push(null);
        }
      }
    }
  };