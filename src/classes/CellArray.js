import Cell from './Cell';
import Point from './Point';

export default class CellArray {
  constructor(vars) {
    this.vars = vars;
    this.cells = new Array();

    this.cells[0] = new Array();
    this.cells[0].push(new Cell(0, 0, 0));
    this.cells[0].push(new Cell(4, 1, 0));

    this.cells[1] = new Array();
    this.cells[1].push(new Cell(1, 0, 1));
    this.cells[1].push(new Cell(5, 1, 1));

    this.cells[2] = new Array();
    this.cells[2].push(new Cell(3, 0, 2));
    this.cells[2].push(new Cell(7, 1, 2));

    this.cells[3] = new Array();
    this.cells[3].push(new Cell(2, 0, 3));
    this.cells[3].push(new Cell(6, 1, 3));

    if (this.vars > 3) {

      this.cells[0].push(new Cell(12, 2, 0));
      this.cells[0].push(new Cell(8, 3, 0));

      this.cells[1].push(new Cell(13, 2, 1));
      this.cells[1].push(new Cell(9, 3, 1));

      this.cells[2].push(new Cell(15, 2, 2));
      this.cells[2].push(new Cell(11, 3, 2));

      this.cells[3].push(new Cell(14, 2, 3));
      this.cells[3].push(new Cell(10, 3, 3));
    }
    // holds all marked groups
  }

  mark(terms) {
    // console.log(terms);
    for(let i = 0; i < terms.length; i++) { // for each minterm
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
    // console.log(this.cells);
    for(let i = 0; i < this.cells.length; i ++) {
      for(let j = 0; j < this.cells[i].length; j++ ) {
        this.cells[i][j].status = '';
      }
    }
  }

  //Writing this near midnight
  // TODO: write it better later
  getGroups() {
    var marked = [];
    // used to skip some group checks
    var numActive = 0;

    // TODO: refractor to work with maxterms
    for(let i = 0; i < this.cells.length; i++) {
      for(let j = 0; j < this.cells[i].length; j++) {
        if(this.cells[i][j].status != '0') numActive++;
      }
    }

    // marks every cell and returns early to save proccessing time
    if(numActive >= Math.pow(2, this.vars)) {
      // draws if all are on
      let group = [];

      for(let i = 0; i < this.cells.length; i++) {
        for(let j = 0; j < this.cells[i].length; j++) {
          group.push(this.cells[i][j]);
        }
      }

      marked.push(group);

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

        if(((rootPoint.status !== '0') && (secondPoint.status !== '0') && (thirdPoint.status !== '0') &&
        (fourthPoint.status !== '0') && (fifthPoint.status !== '0') && (sixthPoint.status !== '0') && (seventhPoint.status !== '0') &&
        (eighthPoint.status !== '0'))
        && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1' || fifthPoint.status === '1' || sixthPoint.status === '1' || seventhPoint.status === '1' || eighthPoint.status === '1')) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);
          group.push(fifthPoint);
          group.push(sixthPoint);
          group.push(seventhPoint);
          group.push(eighthPoint);

          if(this.isGroupUnique(marked, group)) marked.push(group);
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

        if(((rootPoint.status !== '0') && (secondPoint.status !== '0') && (thirdPoint.status !== '0') &&
        (fourthPoint.status !== '0') && (fifthPoint.status !== '0') && (sixthPoint.status !== '0') && (seventhPoint.status !== '0') &&
        (eighthPoint.status !== '0'))
        && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1' || fifthPoint.status === '1' || sixthPoint.status === '1' || seventhPoint.status === '1' || eighthPoint.status === '1')) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);
          group.push(fifthPoint);
          group.push(sixthPoint);
          group.push(seventhPoint);
          group.push(eighthPoint);

          if(this.isGroupUnique(marked, group)) marked.push(group);
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

          if(((rootPoint.status !== '0') && (secondPoint.status !== '0') && (thirdPoint.status !== '0') &&
          (fourthPoint.status !== '0')) && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1' )) {
            let group = [];

            group.push(rootPoint);
            group.push(secondPoint);
            group.push(thirdPoint);
            group.push(fourthPoint);

            if(this.isGroupUnique(marked, group)) marked.push(group);
          }
        }
      }

      //marks vertical 'quads'
      for(let i = 0; i < Math.pow(2, this.vars - 2); i++) {
        let rootPoint = this.get(i, 0);
        let secondPoint = this.get(i, 1);
        let thirdPoint = this.get(i, 2);
        let fourthPoint = this.get(i, 3);

        if(((rootPoint.status !== '0') && (secondPoint.status !== '0') && (thirdPoint.status !== '0') &&
        (fourthPoint.status !== '0')) && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1' )) {
          let group = [];

          group.push(rootPoint);
          group.push(secondPoint);
          group.push(thirdPoint);
          group.push(fourthPoint);

          if(this.isGroupUnique(marked, group)) marked.push(group);
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

          if(((rootPoint.status !== '0') && (secondPoint.status !== '0') && (thirdPoint.status !== '0') &&
          (fourthPoint.status !== '0')) && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1' )) {
            let group = [];

            group.push(rootPoint);
            group.push(secondPoint);
            group.push(thirdPoint);
            group.push(fourthPoint);

            if(this.isGroupUnique(marked, group)) marked.push(group);
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
          if(((rootPoint.status !== '0') && (secondPoint.status !== '0')) && (rootPoint.status === '1' || secondPoint.status === '1')) {
            let group = [];
            group.push(rootPoint);
            group.push(secondPoint);

            if(this.isGroupUnique(marked, group)) marked.push(group);
          }

          //vertical
          let secondPointV = this.get(i, j + 1);
          if(((rootPoint.status !== '0') && (secondPointV.status !== '0')) &&(rootPoint.status === '1' || secondPointV.status === '1')) {
            let group = [];
            group.push(rootPoint);
            group.push(secondPointV);

            if(this.isGroupUnique(marked, group)) marked.push(group);
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

          if(point.status === '1' && this.isGroupUnique(marked, group)) marked.push(group);
        }
      }
    }

    return marked;
  }

  // mods coords for overflow and swaps them because array xy and map xy are flipped
  get(x, y){
    return this.cells[y % 4][x % Math.pow(2, this.vars - 2)];
  }

  isGroupUnique(marked, group) {
    if(typeof marked === 'undefined' || marked === null ) {
      console.log('marked is empty');
      return true;
    }

    for(let i = 0; i < marked.length; i++) { //for each marked group
      var matches = [];

      for(let j = 0; j < group.length; j++) { // for each point in the group
        for(let k = 0; k < marked[i].length; k ++) { // for each point in the marked group
          if((marked[i][k].x == group[j].x) && (marked[i][k].y == group[j].y)){
              matches.push(group[j]);
          }
        }
      }

      if(matches.length > group.length / 2) return false;
    }

    return true;
  }

  simplifyGroups(groups) {
    for(let i = groups.length - 1; i >= 0; i--) { // for each group
      let numberOfOnes = 0;
      let matches = 0;

      for(let j = 0; j < groups[i].length; j++) { // for each point in the group
        // if it is a 1 increment number of ones otherwise skip this loop
        if(groups[i][j].status !== '1') continue;
        numberOfOnes++;

        // check every 1 in the array of groups for matching (x & y's) and
        // increment matches if it is in a different group than the current group
        pairing:
          for(let k = 0; k < groups.length; k++) {
            for(let l = 0; l < groups[k].length; l++) {
              if(groups[k][l].status === '1' && groups[i][j].x === groups[k][l].x
              && groups[i][j].y === groups[k][l].y && i !== k) {
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

  cellsToPoints(groups) {
    return groups.map((group) => {
      return group.map((cell) => {
        return new Point(cell.x, cell.y);
      });
    });
  }
}
