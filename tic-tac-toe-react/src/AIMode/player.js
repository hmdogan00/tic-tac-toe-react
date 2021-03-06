import {calculateWinner} from "./ai-mode.jsx";

export default class Player {
    constructor(maxDepth = -1){
        this.maxDepth = maxDepth
        this.nodesMap = new Map();
    }
    
    getBestMove(arr, maximizing = true, callback = () => {}, depth = 0){
        // clear nodesMap if the function is called the first time for a new move
        if ( depth === 0) this.nodesMap.clear();

        const win = calculateWinner(arr, true)
        const availMoves = getAvailableMoves(arr);
        if ( (win === "X" || win === "O") || depth === this.maxDepth ){
            if ( win === "X" ){
                return 100 - depth;
            }
            else if ( win === "O"){
                return -100 + depth;
            }
            return 0;
        }
        if ( availMoves.length === 0 ){
            return 0;
        }
        if ( maximizing ){
            // initialize best value to lowest possible value
            let best = -100;
            // loop thru all available cells
            availMoves.forEach(index => {

                // initialize a new board that is a copy of the current state
                const child = arr.slice();
                child[index] = "X";
                const nodeValue = this.getBestMove(child, false, callback, depth + 1);
                best = Math.max(best, nodeValue)
                if ( depth === 0){
                    const moves = this.nodesMap.has(nodeValue) ? (this.nodesMap.get(nodeValue) + "," + index) : index;
                    this.nodesMap.set(nodeValue, moves);
                }
            });
            if ( depth === 0){
                let ret;
                if ( typeof this.nodesMap.get(best) === 'string' ){
                    const nodeArray = this.nodesMap.get(best).split(",")
                    const rand = Math.floor(Math.random() * nodeArray.length);
                    ret = nodeArray[rand]
                }
                else{
                    ret = this.nodesMap.get(best)
                }
                callback(ret)
                return ret;
            }
            return best;
        }
        if ( !maximizing ){
            // initialize best value to highest possible value
            let best = 100;
            // loop thru all available cells
            availMoves.forEach(index => {
                // initialize a new board that is a copy of the current state
                const child = arr.slice();
                child[index] = "O";
                const nodeValue = this.getBestMove(child, true, callback, depth + 1);
                best = Math.min(best, nodeValue)
                if ( depth === 0 ){
                    const moves = this.nodesMap.has(nodeValue) ? (this.nodesMap.get(nodeValue) + "," + index) : index;
                    this.nodesMap.set(nodeValue, moves);
                }
            });
            // if this is the first recursive call, 
            if ( depth === 0 ){
                let returnVal;
                if ( typeof this.nodesMap.get(best) === 'string' ){
                    const nodeArray = this.nodesMap.get(best).split(",")
                    const rand = Math.floor(Math.random() * nodeArray.length);
                    returnVal = nodeArray[rand]
                }
                else{
                    returnVal = this.nodesMap.get(best)
                }
                callback(returnVal)
                return returnVal;
            }
            return best;
        }
    }
}

export function getAvailableMoves(arr){
    const moves = []
    arr.forEach((cell, index) => {
        if ( !cell ) moves.push(index);
        });
    return moves;
}