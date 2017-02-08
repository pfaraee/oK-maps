class CellArray {

  constructor(vars) {
    if (vars < 4) {
      this.cells = new Array();
      // TODO: remove verbose falses
      // TODO: MAKE ALL VIRTUAL CELLS AT THE RIGHT AND BOTTOM OF EACH MAP, AND
      // MAKE A SEPERATE MAP THAT MARKS ALL PAINTED CELLS
      this.cells.push(new Cell(0, 0, 0, false));
      this.cells.push(new Cell(1, 0, 1, false));
      this.cells.push(new Cell(3, 0, 2, false));
      this.cells.push(new Cell(2, 0, 3, false));
      this.cells.push(new Cell(4, 1, 0, false));
      this.cells.push(new Cell(5, 1, 1, false));
      this.cells.push(new Cell(7, 1, 2, false));
      this.cells.push(new Cell(6, 1, 3, false));
      // virtual cells
      this.cells.push(new Cell(0, 0, 4, true));
      this.cells.push(new Cell(4, 1, 4, true));

    } else {
      // fix this as the coordinates are wrong
      this.cells.push(new Cell(8, 2, 0, false));
      this.cells.push(new Cell(9, 2, 1, false));
      this.cells.push(new Cell(10, 2, 3, false));
      this.cells.push(new Cell(11, 2, 2, false));
      this.cells.push(new Cell(12, 3, 0, false));
      this.cells.push(new Cell(13, 3, 1, false));
      this.cells.push(new Cell(14, 3, 3, false));
      this.cells.push(new Cell(15, 3, 2, false));

      //TODO: add virtual cells for 4 var kmap
    }
    // holds all marked groups
  }

  mark(terms) {
    // console.log(terms);
    for(let i = 0; i < terms.length; i++) { // for each minterm
      for(let j = 0; j < this.cells.length; j++) {
        if((this.cells[j].val === i) && (terms[i] == 1)) {
          this.cells[j].active = true;
        }
      }
    }
  }

  reset() {
    // console.log(this.cells);
    for(let i = 0; i < this.cells.length; i ++) {
      this.cells[i].active = false;
    }
  }

  drawTerms() {
    ctx.font = '20pt Roboto';

    for(let i = 0; i < this.cells.length; i ++) {
      if(this.cells[i].active == 1) {
        ctx.fillText('1', scale * (this.cells[i].x + 1)+ scale / 2, scale * (this.cells[i].y + 1) + scale / 2);
      }
    }
  }

  //Writing this near midnight
  // TODO: write it better later
  getGroups() {
    var marked = [];
    // used to skip some group checks
    var numActive = 0;

    for(let i = 0; i < this.cells.length; i++) {
      if(this.cells[i].active && !this.cells[i].virtual) numActive++;
    }

    if(numActive >= 8) {
      // draws if all are on
      let group = [];

      for(let j = 0; j < this.cells.length; j++) {
        if(!this.cells[j].virtual) {
          group.push(new Point(this.cells[j].x, this.cells[j].y));
        }
      }

      marked.push(group);

      return; // all are marked
    }

    if(numActive >= 4) {
      //marks "quads"
      for(let i = 0; i <= 1; i++) {
        if(this.search(i, 0).active && this.search(i, 1).active && this.search(i, 2).active && this.search(i, 3).active) {
          let group = [];

          for(let j = 0; j < 4; j++) {
            group.push(new Point(i,j));
          }

          marked.push(group);
        }
      }

      //marks "boxes"
      for(let i = 0; i < 4; i++) {
        if(this.search(0,i).active && this.search(1,i).active && this.search(0, i+1).active && this.search(1, i+1).active ) {
          let group = [];

          // over kill because im going to expand to 4 vars later
          //TODO: fix for 4+ vars
          for(let j = 0; j <= 1; j ++) {
            for(let k = 0; k <= 1; k ++) {
              // let x = j;
              // let y = i + k;
              // x %= 4;
              // y %= 4;
              // if it is a "virtual" cell it is reset to its original position.
              group.push(new Point(j % 4, (i + k) % 4));
            }
          }

          marked.push(group);
        }
      }
    }

    if(numActive >= 2) {
      for(let i = 0; i < 2; i ++) {
        for(let j = 0; j < 4;  j++) {
          // Horizontal pairs
          if(this.search(i, j).active && this.search(i + 1, j).active) {
            let group = [];

            group.push(new Point(i % 4, j % 4));
            group.push(new Point((i + 1) % 4, j % 4));

            if(this.isGroupUnique(marked, group)) marked.push(group);
          }

          //vertical                                                  // temp fix just because it is hardcoded for 2 rn
          if(this.search(i, j).active && this.search(i, j + 1) && this.search(i, j + 1).active) {
            let group = [];

            group.push(new Point(i % 4, j % 4));
            group.push(new Point(i % 4, (j + 1) % 4));
            if(this.isGroupUnique(marked, group)) marked.push(group);
          }
        }
      }
    }

    console.log(marked);

    return marked;
  }

  search(x, y){
    for (var i=0; i < this.cells.length; i++) {
        if ((this.cells[i]["x"] === x) && (this.cells[i]["y"] === y)) {
            return this.cells[i];
        }
    }
    return false;
  }

  isGroupUnique(marked, group) {
    var matches = [];

    if(typeof marked === 'undefined' || marked === null ) {
      console.log("marked is empty");
      return true;
    }

    // ends too quickly
    for(let i = 0; i < marked.length; i++) { //for each marked group
      for(let j = 0; j < group.length; j++) { // for each point in the group
        for(let k = 0; k < marked[i].length; k ++) { // for each point in the marked group
          if((marked[i][k].x == group[j].x) && (marked[i][k].y == group[j].y)){

            // TODO: add checking for "flowers" causes error for m(0, 1, 2, 4)
            for (let l = 0; l < matches.length; l++) {
              if((matches[l].x != group[j].x) && (matches[l].y != group[j].y)){
                if(l >= matches.length - 1) {
                  matches.push(group[j]);
                }
              } else {
                break;
              }
            }

          }
        }
      }
    }
    console.log(matches);
    // too many matches
    if(matches.length > group.length / 2) {
      console.log("false");
      return false;
    }
    console.log("true");
    return true;
  }
}
