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
      if((x + 1) % 2) {
        this.cells[x][y] = new Cell(grayCode, x, y);
      } else {
        this.cells[x][maxYAxis - y - 1] = new Cell(grayCode, x, maxYAxis - y - 1)
      }
    }

    this.maxX = maxXAxis;
    this.maxY = maxYAxis;
  }

  mark(terms) {
    for(let i = 0; i < terms.length; i++) { // for each term
      for(let j = 0; j < this.cells.length; j++) {
        for(let k = 0; k < this.cells[j].length; k++) {
          if(this.cells[j][k].val === i) {
            this.cells[j][k].status = terms[i];
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
    let marked = [];
    // used to skip some group checks
    let numActive = 0;

    // TODO: refractor to work with maxterms
    for(let i = 0; i < this.cells.length; i++) {
      for(let j = 0; j < this.cells[i].length; j++) {
        if(this.cells[i][j].status != !this.expansionType) numActive++;
      }
    }

    // marks every cell and returns early to save proccessing time
    if(numActive >= Math.pow(2, this.lets)) {
      // draws if all are on
      let group = [];

      for(let i = 0; i < this.cells.length; i++) {
        for(let j = 0; j < this.cells[i].length; j++) {
          group.push(this.cells[i][j]);
        }
      }

      marked.push(new Group(group, 'full'));

      return marked; // all are marked
    }

    if(numActive >= 8 && this.vars > 3) {
      //mark 2x4's
      for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
        let rootPoint = this.get(i, 0);
        let secondPoint = this.get(i, 1);
        let thirdPoint = this.get(i, 2);
        let fourthPoint = this.get(i, 3);
        let fifthPoint = this.get(i + 1, 0);
        let sixthPoint = this.get(i + 1, 1);
        let seventhPoint = this.get(i + 1, 2);
        let eighthPoint = this.get(i + 1, 3);

        if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType) && (thirdPoint.status != !this.expansionType) &&
        (fourthPoint.status != !this.expansionType) && (fifthPoint.status != !this.expansionType) && (sixthPoint.status != !this.expansionType) && (seventhPoint.status != !this.expansionType) &&
        (eighthPoint.status != !this.expansionType))
        && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType || fifthPoint.status == this.expansionType || sixthPoint.status == this.expansionType || seventhPoint.status == this.expansionType || eighthPoint.status == this.expansionType)) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);
          group.push(fifthPoint);
          group.push(sixthPoint);
          group.push(seventhPoint);
          group.push(eighthPoint);

          let wrapper = new Group(group, '2x4')
          if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
        }
      }

      //mark 4x2's
      for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
        let rootPoint = this.get(0, i);
        let secondPoint = this.get(1, i);
        let thirdPoint = this.get(2, i);
        let fourthPoint = this.get(3 , i);
        let fifthPoint = this.get(0, i + 1);
        let sixthPoint = this.get(1, i + 1);
        let seventhPoint = this.get(2, i + 1);
        let eighthPoint = this.get(3, i + 1);

        if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType) && (thirdPoint.status != !this.expansionType) &&
        (fourthPoint.status != !this.expansionType) && (fifthPoint.status != !this.expansionType) && (sixthPoint.status != !this.expansionType) && (seventhPoint.status != !this.expansionType) &&
        (eighthPoint.status != !this.expansionType))
        && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType || fifthPoint.status == this.expansionType || sixthPoint.status == this.expansionType || seventhPoint.status == this.expansionType || eighthPoint.status == this.expansionType)) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);
          group.push(fifthPoint);
          group.push(sixthPoint);
          group.push(seventhPoint);
          group.push(eighthPoint);

          let wrapper = new Group(group, '4x2');
          if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
        }
      }
    }

    if(numActive >= 4) {
      //marks horizontal 'quads'
      if(this.vars > 3) {
        for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
          let rootPoint = this.get(0, i);
          let secondPoint = this.get(1, i);
          let thirdPoint = this.get(2, i);
          let fourthPoint = this.get(3, i);

          if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType) && (thirdPoint.status != !this.expansionType) &&
          (fourthPoint.status != !this.expansionType)) && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType )) {
            let group = [];

            group.push(rootPoint);
            group.push(secondPoint);
            group.push(thirdPoint);
            group.push(fourthPoint);

            let wrapper = new Group(group, '4x1');
            if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
          }
        }
      }

      //marks vertical 'quads'
      for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
        let rootPoint = this.get(i, 0);
        let secondPoint = this.get(i, 1);
        let thirdPoint = this.get(i, 2);
        let fourthPoint = this.get(i, 3);

        if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType) && (thirdPoint.status != !this.expansionType) &&
        (fourthPoint.status != !this.expansionType)) && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType )) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);

          let wrapper = new Group(group, '1x4');
          if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
        }
      }

      //marks 'boxes'
      for(let i = 0; i < 4; i++) {
        // TODO: MAKE MATH.POW STUFF A CONSTANT
        for(let j = 0; j < Math.pow(2, this.vars - 2); j++) {
          let rootPoint = this.get(j, i);
          let secondPoint = this.get(j + 1, i);
          let thirdPoint = this.get(j, i + 1);
          let fourthPoint = this.get(j + 1, i + 1);

          if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType) && (thirdPoint.status != !this.expansionType) &&
          (fourthPoint.status != !this.expansionType)) && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType )) {
            let group = [];

            group.push(rootPoint);
            group.push(secondPoint);
            group.push(thirdPoint);
            group.push(fourthPoint);

            let wrapper = new Group(group, '2x2')
            if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
          }
        }
      }
    }

    // TODO: remove verbose searches
    if(numActive >= 2) {
      for(let i = 0; i < Math.pow(2, this.vars - 2); i ++) {
        for(let j = 0; j < 4;  j++) {
          let rootPoint = this.get(i, j);

          //horizontal
          let secondPoint = this.get(i + 1, j);
          if(((rootPoint.status != !this.expansionType) && (secondPoint.status != !this.expansionType)) && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType)) {
            let group = [];
            group.push(rootPoint);
            group.push(secondPoint);

            let wrapper = new Group(group, '2x1');
            if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
          }

          //vertical
          let secondPointV = this.get(i, j + 1);
          if(((rootPoint.status != !this.expansionType) && (secondPointV.status != !this.expansionType)) &&(rootPoint.status == this.expansionType || secondPointV.status == this.expansionType)) {
            let group = [];
            group.push(rootPoint);
            group.push(secondPointV);

            let wrapper = new Group(group, '1x2')
            if(this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
          }
        }
      }
    }

    if(numActive >= 1) {
      for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
        for(let j = 0; j < 4; j++) {
          let group = [];
          let point = this.get(i, j);
          group.push(point);

          let wrapper = new Group(group, '1x1');
          if(point.status == this.expansionType && this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
        }
      }
    }

    return marked;
  }

  // mods coords for overflow and swaps them because array xy and map xy are flipped
  get(x, y){
    return this.cells[x % this.maxX][y % this.maxY];
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
          if((marked[i].cellArray[k].x == group.cellArray[j].x) && (marked[i].cellArray[k].y == group.cellArray[j].y)){
              matches.push(group[j]);
          }
        }
      }

      if(matches.length > group.cellArray.length / 2) return false;
    }

    return true;
  }

  simplifyGroups(groups, keep) {
    checking:
    for(let i = groups.length - 1; i >= 0; i--) { // for each group
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
        i--;
      }
    }
    //TODO: ask professor if this is good
    return groups;
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

    console.log("length: " + opts.length);

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
