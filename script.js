/*
** The Gameboard represents the state of the board
** Each equare holds a Cell (defined later)
** and we expose a dropToken method to be able to add Cells to squares
*/

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create a 2d array that will represent the state of the game board
    // For this 2d array, row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    // This will be the method of getting the entire board that our
    // UI will eventually need to render it.
    const getBoard = () => board;

    // In order to drop a token, we need to find what the lowest point of the
    // selected column is, *then* change that cell's value to the player number
    const dropToken = (column, row, player) => {
        // Our board's outermost array represents the row,
        // so we need to loop through the rows, starting at row 0,
        // find all the rows that don't have a token, then take the
        // last one, which will represent the bottom-most empty cell
        // const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

        // If no cells make it through the filter, 
        // the move is invalid. Stop execution.
        // if (!availableCells.length) return;

        // Otherwise, I have a valid cell, the last one in the filtered array
        const currentCell = board[row][column]
        if (currentCell.getValue() === "") {
            board[row][column].addToken(player);
        }
    };

    // This method will be used to print our board to the console.
    // It is helpful to see what the board looks like after each turn as we play,
    // but we won't need it after we build our UI
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    // Here, we provide an interface for the rest of our
    // application to interact with the board
    return { getBoard, dropToken, printBoard };
}

/*
** A Cell represents one "square" on the board and can have one of
** 0: no token is in the square,
** 1: Player One's token,
** 2: Player 2's token
*/

function Cell() {
    let value = "";

    // Accept a player's token to change the value of the cell
    const addToken = (player) => {
        value = player;
    };

    // How we will retrieve the current value of this cell through closure
    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/
function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 'X'
        },
        {
            name: playerTwoName,
            token: 'O'
        }
    ];

    let activePlayer = players[0];
    let gameWon = false;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (column, row, playerWon) => {
        // Drop a token for the current player
        if (!gameWon) {
            console.log(
                `Dropping ${getActivePlayer().name}'s token into column ${column}...`
            );
            board.dropToken(column, row, getActivePlayer().token);
        }

        /*  This is where we would check for a winner and handle that logic,
            such as a win message. */

        // Switch player turn
        if (checkWinner()) {
            gameWon = true;
            console.log(`${getActivePlayer().name} has won the game!`);
            playerWon.textContent = `${getActivePlayer().name} has won!!...`
        } else {
            switchPlayerTurn();
            printNewRound();
        }
    };

    const checkWinner = () => {
        const currentBoard = board.getBoard();

        // Check rows
        for (let i = 0; i < 3; i++) {
            if (currentBoard[i][0].getValue() !== '' &&
                currentBoard[i][0].getValue() === currentBoard[i][1].getValue() &&
                currentBoard[i][1].getValue() === currentBoard[i][2].getValue()) {
                return true; // Row win
            }
        }

        // Check columns
        for (let i = 0; i < 3; i++) {
            if (currentBoard[0][i].getValue() !== '' &&
                currentBoard[0][i].getValue() === currentBoard[1][i].getValue() &&
                currentBoard[1][i].getValue() === currentBoard[2][i].getValue()) {
                return true; // Column win
            }
        }

        // Check main diagonal
        if (currentBoard[0][0].getValue() !== '' &&
            currentBoard[0][0].getValue() === currentBoard[1][1].getValue() &&
            currentBoard[1][1].getValue() === currentBoard[2][2].getValue()) {
            return true; // Main diagonal win
        }

        // Check anti-diagonal
        if (currentBoard[0][2].getValue() !== '' &&
            currentBoard[0][2].getValue() === currentBoard[1][1].getValue() &&
            currentBoard[1][1].getValue() === currentBoard[2][0].getValue()) {
            return true; // Anti-diagonal win
        }

        return false; // No winner yet
    };

    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const playerWonDiv = document.querySelector('.won');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";

        // get the newest version of the board and player turn
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

        // Render board squares
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                // Anything clickable should be a button!!
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the column
                // This makes it easier to pass into our `playRound` function 
                cellButton.dataset.column = colIndex
                cellButton.dataset.row = rowIndex
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;
        // Make sure I've clicked a column and not the gaps in between
        if (!selectedColumn) return;

        game.playRound(selectedColumn, selectedRow, playerWonDiv);
        updateScreen();
    }
    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}

ScreenController();