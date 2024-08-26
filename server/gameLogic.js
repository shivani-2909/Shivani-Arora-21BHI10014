import moveTypes from './moveTypes.js';
import { gameState } from './gameState.js';

export const calculateNewPosition = (character, move) => {
  const { x, y } = character.position;
  const movementRule = moveTypes[character.type][move];

  if (!movementRule) return null;

  const [newX, newY] = movementRule(x, y);

  if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5) {
    return { x: newX, y: newY };
  } else {
    return null;
  }
};

export const sendMoveResult = (ws, success, message) => {
  ws.send(`moveResult ${success} ${message}`);
};
