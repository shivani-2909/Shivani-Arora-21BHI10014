
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
  ![Game Board Screenshot](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/Game-main-page.PNG?raw=true)

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
  
### Selecting a Piece
When you select a piece, its border will be highlighted in:

- Red for Player A's pieces
- Blue for Player B's pieces
- The possible moves for the selected piece will be highlighted on the board. If you try to move a piece to an invalid location, a pop-up will appear indicating that the move is not allowed.
    ![A's_Turn](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/A's%20turn.PNG)
    ![B's Turn](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/B's%20turn.PNG)

### Making a Move
- To make a move, simply click on the piece you want to move and then click on the destination square. If the move is valid, the piece will be moved to the new location. If the move is invalid, a pop-up will appear indicating that the move is not allowed.
  ![Invalid_move](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/invalid-move.PNG)

### Capturing an Opponent's Piece
- If a piece lands on a square occupied by an opponent's piece, the opponent's piece will be captured and removed from the board.
  ![Last_move](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/Last-move.PNG)
### Move History
After each move, the game will update the move history. The move history will display the following information:
1. The piece that was moved
2. The starting and ending coordinates of the move
3. The type of move made (e.g. " A-H1 0-2 to 2-2")
4. If a piece was captured, the type of piece captured and its coordinates (e.g. " A-H1 2-2 to 4-2 capturing B-H1")
    ![Move_History](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/move-history.PNG)

### Winning the Game
- The game is won when one player captures all of their opponent's pieces. The game will automatically end and display a message indicating the winner.
- It will display the button to start again.
  ![Winner_StartNewGame](https://github.com/shivani-2909/Shivani-Arora-21BHI10014/blob/main/images/Player%20A-wins.PNG)


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
