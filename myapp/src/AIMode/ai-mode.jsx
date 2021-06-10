import React from 'react';
import {Link} from "react-router-dom"
//import ReactDOM from 'react-dom';
import '../index.css';
import Player from "./player.js"

function Square(props){
  return (
    <button className="square" onClick={props.onClick}>{props.value}</button>
  );
}
  
class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        key={ i }
        value={ this.props.squares[i] } 
        onClick= { () => this.props.onClick(i) }  
      />
    );
  }
  
  render() {
    let rows = []
    for ( let i = 0; i < 3; i++ ){
      let squares = [];
      for ( let k = 0; k < 3; k++ ){
        squares.push(this.renderSquare( i * 3 + k));
      }
      rows.push(<div className="board-row" key={i}>{squares}</div>);
    }
    return <div id="board">{rows}</div>;
  }
}
  
export default class GameAI extends React.Component {
  //-------------CONSTRUCTOR START------------------------
  constructor(props){
    super(props);
    // initialize player instance
    const p = new Player();
    this.player = p;
    // initialize state
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        rowMove: null,
        colMove: null,
      }],
      stepNumber: 0,
      ascending: true,
      isLight:true,
      xIsNext: true
    };
    // initialize button press
    document.onkeydown = this.checkKey
  }
  //-------------CONSTRUCTOR END------------------------
  //-------------HANDLE CLICK START------------------------
  handleClick(i){
    // initialize history, current state and current square array
    const history = this.state.history.slice(0, this.state.stepNumber + 1 );
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    // if there is a winner or square is clicked, ignore
    if ( calculateWinner(squares) || squares[i] ){
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    // if there is room for AI to play, then make it play by giving user's input
    if ( this.state.xIsNext && this.state.stepNumber < 8){
      this.aiPlay(squares,i);
    }
    // if there is only human room for play, i.e. game is at 8th step, enter only human play
    else if ( this.state.stepNumber >= 8 ){
      this.setState({
        history: history.concat([
          {squares:squares, rowMove: Math.floor(i / 3 + 1), colMove: i % 3 + 1},
        ]), 
        stepNumber: history.length,
        xIsNext: true
      });
    }
  }
  //-------------HANDLE CLICK END------------------------
  //-------------AI'S TURN START------------------------
  aiPlay(squares,userMove){
    // initialize history, get index of the best square and initialize the array that the AI's move will be made
    const history = this.state.history.slice(0, this.state.stepNumber + 1 );
    const index = this.player.getBestMove(squares.slice(), false)
    const nextSquares = squares.slice();
    // make the best move and set the state accordingly (both user and AI moves here)
    nextSquares[index] = "O";
    this.setState({
        history: history.concat([
          {squares:squares, rowMove: Math.floor(userMove / 3 + 1), colMove: userMove % 3 + 1},
          {squares:nextSquares, rowMove: Math.floor(index / 3 + 1), colMove: index % 3 + 1}
        ]), 
        stepNumber: history.length + 1,
        xIsNext: true
      });
  }
  //-------------AI'S TURN END------------------------
  //-------------MOVE LIST FUNCTIONALITY------------------------
  jumpTo(step){
    // boundary condition: step needs to be between 0 and history length
    if ( step < 0 || step >= this.state.history.length ){
      return;
    }
    this.setState({
      stepNumber:step,
      xIsNext: step % 2 === 0
    })
    const board = document.getElementById("board");
    for ( let i = 0; i < 9; i++ ){
      if ( this.state.isLight ){
        board.children[Math.floor(i / 3)].children[i % 3].style = ""
      }
      else{
        board.children[Math.floor(i / 3)].children[i % 3].style = "background-color:#999"
      }
    }
    this.setMode();
    const lis = document.getElementById("list");
    const moves = lis.children;
    for ( let i = 0; i < this.state.history.length; i++ ){
      moves[i].style = "";
      moves[i].children[0].style = "";
    }
    if ( !this.state.ascending ) { step = this.state.history.length - step - 1}
    moves[step].style = "font-weight:bold;";
    moves[step].children[0].style = "font-weight:bold; background-color: darkgray;";
  }
  //-------------MOVE LIST FUNCTONALITY END------------------------
  //-------------RENDER START------------------------
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step,move) => {
      const desc = move ? "Go to move " + move + "." + (move % 2 === 0 ? "O" : "X") + " (row " + step.rowMove + ", column" + step.colMove + ")" : "Go to game start";
      return (
        <li key={move} name={"step-" + move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });


    let status;
    if ( winner ){
      status = "Winner: " + winner;
    }
    else if (this.state.stepNumber >= 9){
      status = "It is a draw!";
    }
    else{
      status = 'Next player: ' + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        <div className="move-list">
          <ul style={{color:"white", grid_area:"moves"}} id="list">{this.state.ascending ? moves : moves.reverse()}</ul>
          <button className=" toggle-btn" onClick={ () => this.setState({ascending: !this.state.ascending}) }>Toggle Ascending/Descending</button>
          <br/><br/>
          <Link to="/" className="toggle-btn">Go back to home page</Link>
        </div>
        <div className="game-info">
          <div>{status}</div>
          
          <div>
            <p style={{display:"inline-block"}}>Toggle Dark Mode: </p>
            <input type="checkbox" onClick={ () => this.setMode()}></input>
          </div>
        </div>
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    );
  }
  //-------------RENDER END------------------------
  //-------------ON KEY DOWN FUNCTION START------------------------
  checkKey = (e) => {
    // if left arrow klicked
    if ( e.keyCode === 37 ){
      const step = this.state.stepNumber
      // jump to previous move
      this.jumpTo(step - 1)
    }
    // if right arrow clicked
    else if ( e.keyCode === 39 ){
      const step = this.state.stepNumber
      // jump to next move
      this.jumpTo(step + 1)
    }
  }
  //-------------ON KEY DOWN FUNCTION END------------------------
  //-------------DARK/LIGHT MODE------------------------
  setMode(){
    const inp = document.getElementsByTagName("input")[0].checked
    const body = document.getElementsByTagName("body")[0]
    const board = document.getElementById("board");
    const squares = board.getElementsByTagName("button")
    const gameInfo = document.getElementsByClassName("game-info")[0];
    const status = gameInfo.getElementsByTagName("div")[0]
    const toggleText = document.getElementsByTagName("p")[0]
    const list = document.getElementsByTagName("ul")[0]
    if ( inp ){
      body.style = "background-color: black;"
      for (let i of squares){
        i.style = "border: 1px solid #fff; background: #999"
      }
      status.style = "color: #fff"
      toggleText.style = "color: #fff; display:inline-block"
      list.style = "color:#000"
    }
    else{
      body.style = "background-color: #fff;"
      for (let i of squares){
        i.style = "border: 1px solid #999; background: #fff"
      }
      status.style = "color: #000"
      toggleText.style = "color: #000; display:inline-block"
      list.style = "color:#fff"
    }
    this.setState({isLight: !this.state.isLight});
  }
}
//-------------DARK-LIGHT MODE------------------------

//-------------CALCULATE WINNER FUNCTION------------------------
export function calculateWinner(squares, ai = false){
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,4,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [2,4,6],
  ];
  for ( let i = 0; i < lines.length; i++){
    const [a,b,c] = lines[i];
    if ( squares[a] && squares[a] === squares[b] && squares[a] === squares[c] ){
      if ( !ai ){
      const board = document.getElementById("board");
      board.children[Math.floor(a / 3)].children[a % 3].style = "background-color:green;"
      board.children[Math.floor(b / 3)].children[b % 3].style = "background-color:green;"
      board.children[Math.floor(c / 3)].children[c % 3].style = "background-color:green;"
      }
      return squares[a];
    }
  }
  return null;
}
// ========================================
/*ReactDOM.render(
  <Game/>,
  document.getElementById('root')
);*/
  