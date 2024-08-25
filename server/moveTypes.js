const moveTypes = {
    Pawn: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      }
    },
    Hero1: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return dx === 2 && dy === 0;
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return dx === 2 && dy === 0;
      }
    },
    Hero2: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      }
    },
    Hero3: {
      move: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      },
      attack: (character, newPosition) => {
        const dx = Math.abs(newPosition[0] - character.position.x);
        const dy = Math.abs(newPosition[1] - character.position.y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      }
    }
  };
  
  export default moveTypes;