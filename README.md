
# Chess-like Game

This is a custom chess-like game played on a 5x5 grid with unique piece movements and capture rules.

## Setup and Run Instructions

### Prerequisites

- Node.js (version 12 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/chess-like-game.git
   cd chess-like-game
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Game

1. Start the server:
   ```sh
   npm start
   ```
2. The game should automatically open in your default web browser. If it doesn't, open a browser and go to:
   [http://localhost:5500](http://localhost:5500)

## How to Play

### Game Setup
- The game is played between two players on a 5x5 grid.
- Each player controls a team of 5 characters, which can include Pawns, Hero1, and Hero2.
- Players arrange their characters on their respective starting rows at the beginning of the game.

### Characters and Movement
There are three types of characters available:
1. **Pawn:**
   - Moves one block in any direction (Left, Right, Forward, or Backward).
   - Move commands: L (Left), R (Right), F (Forward), B (Backward).
2. **Hero1:**
   - Moves two blocks straight in any direction.
   - Kills any opponent's character in its path.
   - Move commands: L (Left), R (Right), F (Forward), B (Backward).
3. **Hero2:**
   - Moves two blocks diagonally in any direction.
   - Kills any opponent's character in its path.
   - Move commands: FL (Forward-Left), FR (Forward-Right), BL (Backward-Left), BR (Backward-Right).

### Move Command Format
- All moves are relative to the player's perspective.
- For Pawn and Hero1: `<character_name>:<move>` (e.g., `P1:L`, `H1:F`).
- For Hero2: `<character_name>:<move>` (e.g., `H2:FL`, `H2:BR`).

### Game Flow
1. **Initial Setup:**
   - Players deploy all 5 characters on their starting row in any order.
   - Character positions are input as a list of character names, placed from left to right.
   - Players can choose any combination of Pawns, Hero1, and Hero2 for their team.

## Game Screenshots

![Game Board Screenshot](path/to/screenshot.png)

## Move History

![Move History Screenshot](path/to/move-history.png)

## Testing

To test the game on your local machine:

1. Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
2. Clone the repository as described in the Installation section.
3. Open the project folder in your preferred code editor (e.g., Visual Studio Code, Sublime Text).
4. In the terminal, navigate to the project folder and run `npm install` to install dependencies.
5. Start the server by running `npm start` in the terminal.
6. The game should open automatically in your default browser. If not, open a browser and go to `http://localhost:5500`.
7. You can now play the game and test different scenarios:
   - Try moving different pieces.
   - Attempt invalid moves to ensure they're blocked.
   - Capture opponent pieces.
   - Play until one player wins.

If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub Issues page](https://github.com/yourusername/chess-like-game/issues).
