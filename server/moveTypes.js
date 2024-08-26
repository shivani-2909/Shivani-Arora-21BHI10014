const moveTypes = {
    Pawn: {
      move: (character, newPosition) => {
        const { x, y } = character.position;
        return (newPosition.x === x && (newPosition.y === y - 1 || newPosition.y === y + 1)) ||
               (newPosition.y === y && (newPosition.x === x - 1 || newPosition.x === x + 1));
      }
    },
    Hero1: {
      move: (character, newPosition) => {
        const { x, y } = character.position;
        return (newPosition.x === x && (newPosition.y === y - 2 || newPosition.y === y + 2)) ||
               (newPosition.y === y && (newPosition.x === x - 2 || newPosition.x === x + 2));
      }
    },
    Hero2: {
      move: (character, newPosition) => {
        const { x, y } = character.position;
        return (newPosition.x === x - 1 && (newPosition.y === y - 1 || newPosition.y === y + 1)) ||
               (newPosition.x === x + 1 && (newPosition.y === y - 1 || newPosition.y === y + 1));
      },
      attack: (character, newPosition) => {
        // Implement attack logic for Hero2
        const targetCharacter = gameState.characters.find(c => 
          c.position.x === newPosition.x && c.position.y === newPosition.y && c.id.startsWith(character.id[0] === 'A' ? 'B' : 'A')
        );
  
        if (targetCharacter) {
          targetCharacter.isAlive = false; // Mark the opponent character as not alive
          return true;
        }
        return false;
      }
    }
  };
  
  export default moveTypes;
  