const statusDisplay = document.querySelector('.game-status');

let gameActive= true;

let currentPlayer = "X";

//empty strings will help us track played and empty cells

let gameState =['','','','','','','','',''];

const winMsg = () => `Player ${currentPlayer} has won!`;

const drawMsg = () => `It's a Draw!`;

const CurrentPlayerTurn =() => `It's ${currentPlayer}'s turn`;

//initial status message

statusDisplay.innerHTML = CurrentPlayerTurn();

function handleCellPlayed() {

}
function handlePlayerChange() {

}
function handleResultValidation() {

}
function handleCellClick() {

}
function handleRestartGame() {

}

//adding event listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click',handleCellClick));
document.querySelector('#game-restart').addEventListener('click',handleRestartGame);

function handleCellClick(clickedCellEvent){
  
  const clickedCell = clickedCellEvent.target;
  
  const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
  
  if(gameState[clickedCellIndex]!== "" || !gameActive){   
    return;
  }  
  //check is clicked cell is already played or game isnt active
  
  handleCellPlayed(clickedCell, clickedCellIndex);
  handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex){
  //add o or x to played cell
  
  gameState[clickedCellIndex]=currentPlayer;
  clickedCell.innerHTML = currentPlayer;
}

const winningConditions = [
    [0, 1, 2],   //
    [3, 4, 5],   //horizontals
    [6, 7, 8],   //
  
    [0, 3, 6],   //
    [1, 4, 7],   //verticals
    [2, 5, 8],   //
  
    [0, 4, 8],   //diagonals
    [2, 4, 6]    //
];

function handleResultValidation(){
  let roundWon =false;
  for(i=0; i<=7; i++){
    const winCondition = winningConditions[i];
    let a = gameState[winCondition[0]];
    let b = gameState[winCondition[1]];
    let c = gameState[winCondition[2]];
    if(a==='' || b==='' || c==='' ){
      continue;
    };
    
    if(a===b && b===c){
       roundWon= true;
      console.log(winCondition);
      for(j=0;j<=2;j++){
        n=parseInt(winCondition[j]);
        wonCell= document.getElementsByClassName('cell')[n].classList.add("cellwon");
      }
      break;
       
       };
  }
  
  if(roundWon){
    statusDisplay.innerHTML= winMsg();
    gameActive= false;
    return;
    
  }
  
  let roundDraw= !gameState.includes("");
  if(roundDraw){
    statusDisplay.innerHTML = drawMsg();
    gameActive=false;
    return;
  }
  //if none of the above things happened it means game isnt finished, so, lets handle player change
  handlePlayerChange();
}

function handlePlayerChange(){
  
  currentPlayer= currentPlayer === "X" ? "O" : "X";
  statusDisplay.innerHTML = CurrentPlayerTurn();
}

//lets handle restart game now

function handleRestartGame(){
  gameActive=true;
  currentPlayer="X";
  gameState=['','','','','','','','',''];
  statusDisplay.innerHTML = CurrentPlayerTurn();
  document.querySelectorAll('.cell').forEach(cell => cell.innerHTML ="");
  document.querySelectorAll('.cell').forEach(cell => cell.classList.remove("cellwon"));
}