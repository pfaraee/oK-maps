var slider = document.getElementById('num-vars');

noUiSlider.create(slider, {
 start: 3,
 connect: [true, false],
 step: 1,
 range: {
   'min': [3],
   'max': [6]
 },
 pips: {
   mode: 'steps',
   density: 30
 }
});

slider.noUiSlider.on('update', function () {
  var truthTable = document.getElementById('truth-table');

  while(truthTable.firstChild){
    truthTable.removeChild(truthTable.firstChild);
  }

  var tbl = document.createElement('table');

  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  // Creates headers for the truth table
  for(let i = 0; i < slider.noUiSlider.get(); i ++) {
    let th = document.createElement('th');
    th.appendChild(document.createTextNode(String.fromCharCode(65 + i)));
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  tbl.appendChild(thead);

  var tbody = document.createElement('tbody');
  for(let i = 0; i < Math.pow(2, slider.noUiSlider.get()); i++) {
    let tr = document.createElement('tr');

    var num = "" + i.toString(2);
    var pad = '0'.repeat(slider.noUiSlider.get()); // its just 5 0's for the max var nums
    var bin = pad.substring(0, pad.length - num.length) + num;

    var binArray = bin.split("");

    for (let i = 0; i < binArray.length; i++) {
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(binArray[i]));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);
  truthTable.appendChild(tbl);
});




var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var scale = c.width / 5;
var minterms = [];
var numVars = 3;

var cellArray = new CellArray(numVars);
console.log(cellArray.cells);
var drawer;

// var pairPatterns = [
//   [new Point(0,0), new Point(0,-1)],
//   [new Point(0,0), new Point(1,0)],
//   [new Point(0,0), new Point(0,1)],
//   [new Point(0,0), new Point(-1,0)]
// ];
//
// var quadPatterns = [
//   [new Point(0,0), new Point(0,-1), new Point(1,-1), new Point(1,0)],
//   [new Point(0,0), new Point(1,0), new Point(1,1), new Point(0,1)],
//   [new Point(0,0), new Point(0,1), new Point(-1,1), new Point(-1,0)],
//   [new Point(0,0), new Point(-1,0), new Point(-1,-1), new Point(0,-1)]
// ];

// TODO: add switching for 3-4 (5-6)
draw3varkmap();

document.addEventListener('keypress', function(e) {
  //grabs minterms on enter key
  if(e.keyCode == 13) {
    //resets the canvas
    resetkmap();

    //resets cell array
    cellArray.reset();

    draw3varkmap();

    //TODO: change it to work for more minterms instead of hardcoding the 8
    //gets minterms from html form
    for(var i = 0; i < 8; i++) {
      minterms[i] = document.getElementsByClassName('var-wrapper')[0].children[i].value;
    }

    cleanArray(minterms);
    // marks every cell as active or not based on minterms
    cellArray.mark(minterms);
    console.log(cellArray.cells);
    cellArray.drawTerms();
    console.log("hello");
    drawer = new Drawer(cellArray.getGroups());
    drawer.drawPoints();
  }
});

// Cleans all empty values in the array and turns each string into an int
function cleanArray(arr) {
  // removes all empty values
  for(var i = 0; i < arr.length; i++) {
    if(arr[i] == "") {
      arr.splice(i, 1);
      i--;
    }
    arr[i] = parseInt(arr[i]);
  }
}

function resetkmap() {
  ctx.clearRect(0, 0, c.width, c.width);
}

function draw3varkmap() {
  //draws table
  ctx.beginPath();

  ctx.moveTo(0,0);
  ctx.lineTo(c.width, 0);

  ctx.moveTo(c.width,0);
  ctx.lineTo(c.width, c.width);

  ctx.moveTo(c.width, c.width);
  ctx.lineTo(0, c.width);

  ctx.moveTo(0, c.width);
  ctx.lineTo(0, 0);

  ctx.moveTo(0,0);
  ctx.lineTo(scale, scale);

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale, c.width);

  ctx.moveTo(scale * 2, scale);
  ctx.lineTo(scale * 2, c.width);

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale * 3, scale);

  ctx.moveTo(scale * 3, scale);
  ctx.lineTo(scale * 3, c.width);

  ctx.moveTo(scale, scale * 2);
  ctx.lineTo(scale * 3, scale * 2);

  ctx.moveTo(scale, scale * 3);
  ctx.lineTo(scale * 3, scale * 3);

  ctx.moveTo(scale, scale * 4);
  ctx.lineTo(scale * 3, scale * 4);

  ctx.moveTo(scale, scale * 5);
  ctx.lineTo(scale * 3, scale * 5);

  ctx.stroke();

  //draws vars and numbers
  ctx.font = '20pt Roboto';

  //vars
  ctx.fillText('A', scale * 0.6, scale * 0.4);

  ctx.fillText('BC', scale * 0.1, scale * 0.9);

  //numbers
  ctx.fillText('0', scale * 1.5 - 5, scale - 5);
  ctx.fillText('1', scale * 2.5 - 5, scale - 5);

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6 );
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6 );
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6 );
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6 );
}