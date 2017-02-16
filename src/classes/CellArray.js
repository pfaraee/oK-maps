class CellArray {

  constructor(vars) {
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

    if (vars > 3) {

      // fix this as the coordinates are wrong
      this.cells.push(new Cell(8, 3, 0, false));
      this.cells.push(new Cell(9, 3, 1, false));
      this.cells.push(new Cell(10, 3, 3, false));
      this.cells.push(new Cell(11, 3, 2, false));
      this.cells.push(new Cell(12, 2, 0, false));
      this.cells.push(new Cell(13, 2, 1, false));
      this.cells.push(new Cell(14, 2, 3, false));
      this.cells.push(new Cell(15, 2, 2, false));

      //TODO: add virtual cells for 4 var kmap
      this.cells.push(new Cell(0, 4, 0, true));
      this.cells.push(new Cell(1, 4, 1, true));
      this.cells.push(new Cell(3, 4, 2, true));
      this.cells.push(new Cell(2, 4, 3, true));
      this.cells.push(new Cell(0, 4, 4, true));
      this.cells.push(new Cell(8, 2, 3, true));
      this.cells.push(new Cell(12, 2, 2, true));
    }
    console.log(this.cells);
    // holds all marked groups
  }

  mark(terms) {
    // console.log(terms);
    for(let i = 0; i < terms.length; i++) { // for each minterm
      for(let j = 0; j < this.cells.length; j++) {
        if(this.cells[j].val === i) {
          this.cells[j].status = terms[i];
        }
      }
    }
  }

  reset() {
    // console.log(this.cells);
    for(let i = 0; i < this.cells.length; i ++) {
      this.cells[i].status = "";
    }
  }

  drawTerms() {
    ctx.font = '20pt Roboto';

    for(let i = 0; i < this.cells.length; i ++) {
      ctx.fillText(this.cells[i].status, scale * (this.cells[i].x + 1)+ scale / 2, scale * (this.cells[i].y + 1) + scale / 2);
    }
  }

  //Writing this near midnight
  // TODO: write it better later
  getGroups() {
    var marked = [];
    // used to skip some group checks
    var numActive = 0;

    for(let i = 0; i < this.cells.length; i++) {
      if((this.cells[i].status != "0") && !this.cells[i].virtual) numActive++;
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

      return marked; // all are marked
    }

    if(numActive >= 4) {
      //marks "quads"
      for(let i = 0; i <= 1; i++) {
        let rootPoint = this.search(i, 0);
        let secondPoint = this.search(i, 1);
        let thirdPoint = this.search(i, 2);
        let fourthPoint = this.search(i, 3);
        // TODO: simplify this logic once you build 4 var kmaps
        if(((rootPoint.status != "0") && (secondPoint.status != "0") && (thirdPoint.status != "0") &&
        (fourthPoint.status != "0")) && (rootPoint.status == "1" || secondPoint.status == "1" || thirdPoint.status == "1" || fourthPoint.status == "1" )) {
          let group = [];

          for(let j = 0; j < 4; j++) {
            group.push(new Point(i,j));
          }

          marked.push(group);
        }
      }

      //marks "boxes"
      for(let i = 0; i < 4; i++) {
        let rootPoint = this.search(0,i);
        let secondPoint = this.search(1,i);
        let thirdPoint = this.search(0, i+1);
        let fourthPoint = this.search(1, i+1);

        if(((rootPoint.status != "0") && (secondPoint.status != "0") && (thirdPoint.status != "0") &&
        (fourthPoint.status != "0")) && (rootPoint.status == "1" || secondPoint.status == "1" || thirdPoint.status == "1" || fourthPoint.status == "1" )) {
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
              group.push(new Point(j % 2, (i + k) % 4));
            }
          }

          marked.push(group);
        }
      }
    }

    // TODO: remove verbose searches
    if(numActive >= 2) {
      for(let i = 0; i < 2; i ++) {
        for(let j = 0; j < 4;  j++) {
          // Horizontal pairs
          let rootPoint = this.search(i, j);
          if(rootPoint.status == "1" && this.isAlreadyMatched(marked, new Point(rootPoint.x, rootPoint.y))) continue;
          let secondPoint = this.search(i + 1, j);
          if(((rootPoint.status != "0") && (secondPoint.status != "0")) && (rootPoint.status == "1" || secondPoint.status == "1")) {
            let group = [];

            group.push(new Point(i % 2, j % 4));
            group.push(new Point((i + 1) % 2, j % 4));

            if(this.isGroupUnique(marked, group)) marked.push(group);
          }

          //vertical                                                  // temp fix just because it is hardcoded for 2 rn
          let secondPointV = this.search(i, j + 1);
          if(((rootPoint.status != "0") && (secondPointV.status != "0")) &&(rootPoint.status == "1" || secondPointV.status == "1")) {
            let group = [];

            group.push(new Point(i % 2, j % 4));
            group.push(new Point(i % 2, (j + 1) % 4));
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

  isAlreadyMatched(marked, point) {
    for(let i = 0; i < marked.length; i ++) {
      for(let j = 0; j < marked[i].length; j++) {
        if(marked[i][j].x == point.x && marked[i][j].y == point.y) {
          return true;
        }
      }
    }
    return false;
  }
  isGroupUnique(marked, group) {
    if(typeof marked === 'undefined' || marked === null ) {
      console.log("marked is empty");
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
}
