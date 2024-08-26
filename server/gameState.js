export class GameState {
    constructor() {
      this.board = Array.from({ length: 5 }, () => Array(5).fill(null));
      this.characters = [];
      this.currentPlayer = 'Player1';
      this.winner = null;
      this.moveHistory = [];
      this.clients = [];
    }
  
    initGame() {
      this.currentPlayer = 'Player1';
      this.winner = null;
      this.moveHistory = [];
      this.board = Array.from({ length: 5 }, () => Array(5).fill(null));
      this.characters = [
        { id: 'A-P1', type: 'Pawn', position: { x: 0, y: 0 }, isAlive: true },
        { id: 'A-H1', type: 'Hero1', position: { x: 1, y: 0 }, isAlive: true },
        { id: 'A-H2', type: 'Hero2', position: { x: 2, y: 0 }, isAlive: true },
        { id: 'A-P2', type: 'Pawn', position: { x: 3, y: 0 }, isAlive: true },
        { id: 'A-P3', type: 'Pawn', position: { x: 4, y: 0 }, isAlive: true },
        { id: 'B-P1', type: 'Pawn', position: { x: 0, y: 4 }, isAlive: true },
        { id: 'B-H1', type: 'Hero1', position: { x: 1, y: 4 }, isAlive: true },
        { id: 'B-H2', type: 'Hero2', position: { x: 2, y: 4 }, isAlive: true },
        { id: 'B-P2', type: 'Pawn', position: { x: 3, y: 4 }, isAlive: true },
        { id: 'B-P3', type: 'Pawn', position: { x: 4, y: 4 }, isAlive: true }
      ];
      this.characters.forEach(character => {
        this.board[character.position.y][character.position.x] = character.id;
      });
    }
  
    updateGameState(character, newPosition) {
      this.board[character.position.y][character.position.x] = null;
      character.position = newPosition;
      this.board[newPosition.y][newPosition.x] = character.id;
  
      this.currentPlayer = this.currentPlayer === 'Player1' ? 'Player2' : 'Player1';
      this.moveHistory.push({
        characterId: character.id,
        newPosition,
        timestamp: Date.now()
      });
    }
  
    checkForWin() {
      const player1Characters = this.characters.filter(character => character.id.startsWith('A') && character.isAlive);
      const player2Characters = this.characters.filter(character => character.id.startsWith('B') && character.isAlive);
  
      if (player1Characters.length === 0) return 'Player2';
      if (player2Characters.length === 0) return 'Player1';
  
      return null;
    }
  
    broadcastGameState() {
      const gameStateString = JSON.stringify({
        board: this.board,
        characters: this.characters,
        currentPlayer: this.currentPlayer
      });
  
      this.clients.forEach(client => {
        client.send(`gameState ${gameStateString}`);
      });
    }
  }
  