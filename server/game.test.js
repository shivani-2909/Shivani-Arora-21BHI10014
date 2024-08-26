import { validateMove } from './game';

describe('validateMove', () => {
  it('should return true for a valid move', () => {
    const move = { piece: 'Pawn', from: 'A1', to: 'A2' };
    expect(validateMove(move)).toBe(true);
  });

  it('should return false for an invalid move', () => {
    const move = { piece: 'Pawn', from: 'A1', to: 'Z2' };
    expect(validateMove(move)).toBe(false);
  });
});