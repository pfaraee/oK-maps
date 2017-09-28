import Cell from './Cell';
import Point from './Point';
import Group from './Group';
import { toGrayCode } from './BinaryFunctions';

export default class CellArray {
  constructor(vars, expansionType) {
    this.vars = vars;
    this.expansionType = expansionType;
    this.cells = new Array();

    // Genereates cell grid
    let maxAxisVars = vars - Math.floor(vars / 2);
    let maxYAxis = Math.pow(2, maxAxisVars);
    let maxNum = Math.pow(2, vars);
    let maxXAxis = maxNum / maxYAxis;

    // Initializes empty 2d array
    for(let i = 0; i < maxXAxis; i++) {
      this.cells[i] = new Array();
      this.cells[i].length = maxYAxis;
    }

    // Populates 2d array
    for(let i = 0; i < maxNum; i++) {
      //number
      let grayCode = toGrayCode(i);

      // coordinates
      let x = Math.floor(i / maxYAxis);
      let y = i % maxYAxis;

      // odd columns are in regular order, evens are in reverse
      // TODO: rewrite this so the logic rewrites what y is instead of two different blocks
      if((x + 1) % 2) {
        this.cells[x][y] = new Cell(grayCode, x, y);
      } else {
        this.cells[x][maxYAxis - y - 1] = new Cell(grayCode, x, maxYAxis - y - 1)
      }
    }

    this.maxX = maxXAxis;
    this.maxY = maxYAxis;

    this.minterms = [];
  }

  mark(terms) {
    // reset minterms
    this.minterms = [];
    this.minterms[0] = [];

    for(let i = 0; i < terms.length; i++) { // for each term
      for(let j = 0; j < this.cells.length; j++) {
        for(let k = 0; k < this.cells[j].length; k++) {
          if(this.cells[j][k].val === i) {
            this.cells[j][k].status = terms[i];

            if(this.cells[j][k].status != !this.expansionType) {
              let cell = new Cell(this.cells[j][k].val, this.cells[j][k].x, this.cells[j][k].y);
              let cellArray = [cell];
              this.minterms[0].push(new Group(cellArray, "TEST"));
            }
          }
        }
      }
    }

  }

  reset() {
    for(let i = 0; i < this.cells.length; i ++) {
      for(let j = 0; j < this.cells[i].length; j++ ) {
        this.cells[i][j].status = '';
      }
    }
  }

  //Writing this near midnight
  // TODO: write it better later
  getGroups() {    
    for (let i = 0; i < this.minterms.length; i++) {
      for(let j = 0; j < this.minterms[i].length; j++) { // for each minterm
        let subcube = this.minterms[i][j]; // root subcuve
        

        let root = subcube.cellArray[0]; // root minterm
        // console.log(subcube);
        for (let k = 0; k < this.vars; k++) { // toggles every bit
          let nextTermVal = root.val ^ 1 << k; // gets the next pairable number EX: 7 -> 6 -> 5 - > 3 -> 15

          for (let l = 0; l < this.minterms[i].length; l++) { // checks all other mintemrs
            let nextTerm = this.minterms[i][l];
            // console.log((nextTerm.cellArray[0].val == nextTermVal) && (j != l));
            // is correct val, and isnt the same as the root subcube
            if((nextTerm.cellArray[0].val == nextTermVal) && (j != l) && this.isUnitable(subcube, nextTerm)) {
              // console.log(nextTermVal);
              // makes the new subcube's cellArray
              let cellArray = [];
              for(let x1 = 0; x1 < subcube.cellArray.length; x1++) { // push original terms
                cellArray.push(subcube.cellArray[x1]);
              }

              for (let x2 = 0; x2 < nextTerm.cellArray.length; x2++) { // push new terms
                cellArray.push(nextTerm.cellArray[x2]);
              }
              // console.log(cellArray);

              let group = new Group(cellArray, "TEST");
              //makes sure a range exists for subcube dimensions
              if(!this.minterms[i + 1]) this.minterms[i + 1] = new Array(0);

              if (this.isGroupUnique(this.minterms[i + 1], group)) this.minterms[i + 1].push(group);
            }
          }
        }

      }
    }

    return this.minterms;
  }

  // mods coords for overflow and swaps them because array xy and map xy are flipped
  get(arr, x, y){
    x >= 0 ? x %= this.maxX : x = this.maxX - 1 + x;
    y >= 0 ? y %= this.maxY : y = this.maxY - 1 + y;

    return arr[x][y];
  }

  isUnitable(group1, group2) {
    if(group1.cellArray.length != group2.cellArray.length) return false;

    let unitingBit = this.getDifferingBit(group1.cellArray[0].val, group2.cellArray[0].val);
   
    for(let i = 1; i < group1.cellArray.length; i++) { // for every cell 
      let nextBit = this.getDifferingBit(group1.cellArray[i].val, group2.cellArray[i].val); // finds the uniting bit for this pair

      if(nextBit != unitingBit) return false;
    }

    return true;
  }

  // returns if minterm2 is unitable with minterm1
  getDifferingBit(minterm1, minterm2) {
    let term;

    for(let i =0; i < this.vars; i++) {
      term = minterm1 ^ 1 << i;
      if(minterm2 == term) return i;
    }

    return -1;
  }

  // searches minterm array and finds if there is a minterm that matches those coords
  searchTerms(minterms, x, y) {
    for(let i = 0; i < minterms.length; i++) {
      
    }
  }

  isGroupUnique(marked, group) {
    if(typeof marked === 'undefined' || marked === null ) {
      console.log('marked is empty');
      return true;
    }

    for(let i = 0; i < marked.length; i++) { //for each marked group
      let matches = [];

      for(let j = 0; j < group.cellArray.length; j++) { // for each point in the group
        for(let k = 0; k < marked[i].cellArray.length; k ++) { // for each point in the marked group
          if(((marked[i].cellArray[k].x == group.cellArray[j].x) && (marked[i].cellArray[k].y == group.cellArray[j].y))) {
              matches.push(group[j]);
          }
        }
      }

      if(matches.length > group.cellArray.length / 2) return false;
    }

    return true;
  }

  // removes groups from minterms if more than half of the group is inside another goup
  simplifyMinterms(minterms) {
    for(let i = 0; i < minterms.length; i++) {
      for(let j = 0; j < minterms[i].length; j++) {

        let subcube = minterms[i][j];
        //for every subcube, if more than half of that subcubes subcubes are in other subcubes, it can be removed;
        let removalLength = subcube.cellArray.length / 2;
        let foreignPoints = 0;

        for(let k = 0; k < subcube.cellArray.length; k++) {
          let minterm = subcube.cellArray[k];
          // console.log("minterm val: " + minterm.val);

          foreignPointChecking:
          //check every other subcube
          for(let x = 0; x < minterms.length; x++) {
            for (let y = 0; y < minterms[x].length; y++) {

              //check all those subcube's minterms
              for(let z = 0; z < minterms[x][y].cellArray.length; z++) {
                // console.log("z: " + z + " pair val: " + minterms[x][y].cellArray[z].val);

                if(minterms[x][y].cellArray[z].val == minterm.val && (i != x || j != y || k != z)) {
                  foreignPoints++;
                  break foreignPointChecking;
                }
              }
            }
          }
        }
        console.log("foreign points: " + foreignPoints + " removal length: " + removalLength);
        // if foreign points > removalLength remove the subcube
        if(foreignPoints > removalLength) {
          console.log("remove the point");
          minterms[i].splice(j, 1); // removes that subcube
          j--;
        }
      }
    }

    return this.minterms;
  }

  simplifyGroupsR(groups, keep){
    checking:
    for(let i = 0; i < groups.length; i++) { // for each group
      if(keep){
        for(let j = 0; j < keep.length; j++) {
          if(JSON.stringify(groups[i]) === JSON.stringify(keep[j])) continue checking;
        }
      }

      let numberOfOnes = 0;
      let matches = 0;

      for(let j = 0; j < groups[i].cellArray.length; j++) { // for each point in the group
        // if it is a 1 increment number of ones otherwise skip this loop
        if(groups[i].cellArray[j].status != this.expansionType) continue;

        numberOfOnes++;

        // check every 1 in the array of groups for matching (x & y's) and
        // increment matches if it is in a different group than the current group
        pairing:
        for(let k = 0; k < groups.length; k++) {
          for(let l = 0; l < groups[k].cellArray.length; l++) {
            if(groups[k].cellArray[l].status == this.expansionType && groups[i].cellArray[j].x === groups[k].cellArray[l].x
            && groups[i].cellArray[j].y === groups[k].cellArray[l].y && i !== k) {
              matches++;
              break pairing; // used to break out of both loops
            }
          }
        }
      }

      // removes the group and decrements the count by 1
      if(matches && numberOfOnes && numberOfOnes === matches) {
        groups.splice(i, 1);
        i++;
      }
    }
    //TODO: ask professor if this is good
    return groups;
  }

  markPrimeImplicants(groups) {
    for(let i = groups.length - 1; i >= 0; i--) { // for each group
      for(let j = 0; j < groups[i].cellArray.length; j++) { // for each point in the group
        let matches = 0;

        // if it is a 1 increment number of ones otherwise skip this loop
        if(groups[i].cellArray[j].status != this.expansionType) continue;

        // check every 1 in the array of groups for matching (x & y's) and
        // increment matches if it is in a different group than the current group
        pairing:
          for(let k = 0; k < groups.length; k++) {
            for(let l = 0; l < groups[k].cellArray.length; l++) {
              if(groups[k].cellArray[l].status == this.expansionType && groups[i].cellArray[j].x === groups[k].cellArray[l].x
              && groups[i].cellArray[j].y === groups[k].cellArray[l].y && i !== k) {
                matches++;
                break pairing; // used to break out of both loops
              }
            }
          }

        if(!matches) {
          groups[i].pImp = true;
          break;
        }
      }
    }
    //TODO: ask professor if this is good
    return groups;
  }

  /**
   * returns all possible formulas
   * @param {Array.Groups} groups - an array of marked groups
   * @return {Array.Groups} array of possible groupings
   */
  getPossibleFormulas(groups) {
    let temp = groups.slice();
    let formulas = [];

    let pImps = [];

    groups.forEach((group) => {
      if(group.pImp) pImps.push(group);
    });

    let opts = [];

    groups.forEach((group) => {
      if(!group.pImp) opts.push(group);
    });


    for(let i = 0; i < opts.length; i++) {
      let keeps = [];

      for(let j = i; j < opts.length; j++) {
        keeps.push(opts[j]);

        let formula = this.simplifyGroups(temp, keeps);
        formula = this.simplifyGroups(formula); // used to remove hiding opts

        if(this.isUniqueFormula(formulas, formula)) formulas.push(formula);
        temp = groups.slice();
      }
    }

    for(let i = 0; i < opts.length; i++) {
      let keeps = [];

      for(let j = i; j < opts.length; j++) {
        keeps.push(opts[j]);

        let formula = this.simplifyGroupsR(temp, keeps);
        formula = this.simplifyGroups(formula); // used to remove hiding opts

        if(this.isUniqueFormula(formulas, formula)) formulas.push(formula);
        temp = groups.slice();
      }
    }

    if(!opts.length) formulas.push(this.simplifyGroups(temp));

    return formulas;
  }

  /**
   * returns if the formula is unique to the array of formulas
   * @param {Array.Groups} formulas - an array of simplified groups
   * @param {Group} formulas - a simplified group
   * @return {boolean} whether the group is unique or not
   */
  isUniqueFormula(formulas, formula) {
    for(let i = 0; i < formulas.length; i++) {
      if(JSON.stringify(formulas[i]) === JSON.stringify(formula)) return false;
    }

    return true;
  }

  /**
   * Converts cells to points
   * @param {Array.Array.Cells} groups - a 2d array of cells
   * @return {Array.Array.Point} a 2d array of points
   */
  cellsToPoints(groups) {
    return groups.map((group) => {
      return group.map((cell) => {
        return new Point(cell.x, cell.y);
      });
    });
  }
}
