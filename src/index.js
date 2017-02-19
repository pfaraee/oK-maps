var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var scale = c.width / 5;
var minterms = [];
var numVars = 3;

var cellArray = new CellArray(numVars);
var drawer;

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

slider.setAttribute('disabled', true);


slider.noUiSlider.on('update', function () {
  var truthTable = document.getElementById('truth-table');

  while(truthTable.firstChild){
    truthTable.removeChild(truthTable.firstChild);
  }

  var tbl = document.createElement('table');

  var thead = document.createElement('thead');

  var superHeadRow = document.createElement('tr');

  let input = document.createElement('th');
  input.appendChild(document.createTextNode('Input'));
  input.setAttribute('colspan', slider.noUiSlider.get());

  let output = document.createElement('th');
  output.setAttribute('colspan', 3);
  output.appendChild(document.createTextNode('Output'));

  superHeadRow.appendChild(input);
  superHeadRow.appendChild(output);

  thead.appendChild(superHeadRow);

  var tr = document.createElement('tr');
  // Creates headers for the truth table
  for(let i = 0; i < slider.noUiSlider.get(); i ++) {
    let th = document.createElement('th');
    th.appendChild(document.createTextNode(String.fromCharCode(65 + i)));
    tr.appendChild(th);
  }

  let off = document.createElement('th');
  off.appendChild(document.createTextNode("0"));
  let on = document.createElement('th');
  on.appendChild(document.createTextNode("1"));
  let dontCare = document.createElement('th');
  dontCare.appendChild(document.createTextNode("X"));

  tr.appendChild(off);
  tr.appendChild(on);
  tr.appendChild(dontCare);

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

    let td = document.createElement('td');
    let input1 = document.createElement('input');
    input1.setAttribute('name', 'group' + i);
    input1.setAttribute('type', 'radio');
    input1.setAttribute('id', 'OFF'+ i);
    input1.setAttribute('value', '0');
    input1.setAttribute('checked', 'checked');
    let label1 = document.createElement('label');
    label1.setAttribute('for', 'OFF' + i);
    td.appendChild(input1);
    td.appendChild(label1)

    let td2 = document.createElement('td');
    let input2 = document.createElement('input');
    input2.setAttribute('name', 'group' + i);
    input2.setAttribute('type', 'radio');
    input2.setAttribute('id', 'ON' + i);
    input2.setAttribute('value', '1');
    let label2 = document.createElement('label');
    label2.setAttribute('for', 'ON' + i);
    td2.appendChild(input2);
    td2.appendChild(label2);

    let td3 = document.createElement('td');
    let input3 = document.createElement('input');
    input3.setAttribute('name', 'group' + i);
    input3.setAttribute('type', 'radio');
    input3.setAttribute('id', 'DONTCARE' + i);
    input3.setAttribute('value', 'X');
    let label3 = document.createElement('label');
    label3.setAttribute('for', 'DONTCARE' + i);
    td3.appendChild(input3);
    td3.appendChild(label3);

    tr.appendChild(td);
    tr.appendChild(td2);
    tr.appendChild(td3);

    tbody.appendChild(tr);
  }

  tbody.style.overflowY = "scroll";
  tbl.appendChild(tbody);
  truthTable.appendChild(tbl);

  resetkmap();
  var numVars = Number(slider.noUiSlider.get());
  cellArray = new CellArray(numVars);

  //rewdraws map
  resetkmap();
  switch(numVars) {
    case 3:
      draw3varkmap();
      break;
    case 4:
      draw4varkmap();
      break;
    default:
      console.log("You did it Professor.");
      break;
  }
});

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
    switch(numVars) {
      case 3:
        draw3varkmap();
        break;
      case 4:
        draw4varkmap();
        break;
      case 5:
        console.log("5 vars");
        break;
      case 6:
        console.log("6 vars");
        break;
      default:
        console.log("You did it Professor.");
        break;
    }

    //resets cell array
    cellArray.reset();

    minterms = getMinterms();
    // cleanArray(minterms);
    // marks every cell as active or not based on minterms
    cellArray.mark(minterms);
    console.log(cellArray.cells);
    cellArray.drawTerms();

    drawer = new Drawer(cellArray.getGroups());
    console.log(drawer.points);
    drawer.drawPoints();
  }
});

function getMinterms() {
  var temp = [];
  //TODO: change it to work for more minterms instead of hardcoding the 8
  //gets minterms from html form
  for(let i = 0; i < Math.pow(2, numVars); i++) {
    var formGroup = document.getElementsByName("group" + i);

    for(let j = 0; j < formGroup.length; j++) {
      if(formGroup[j].checked == true) {
        temp[i] = formGroup[j].value;
      }
    }
  }

  return temp;
}

// // Cleans all empty values in the array and turns each string into an int
// function cleanArray(arr) {
//   // removes all empty values
//   for(var i = 0; i < arr.length; i++) {
//     if(arr[i] == "") {
//       arr.splice(i, 1);
//       i--;
//     }
//     arr[i] = parseInt(arr[i]);
//   }
// }

function resetkmap() {
  ctx.clearRect(0, 0, c.width, c.width);
}

function draw4varkmap() {
  ctx.beginPath();

  ctx.moveTo(0,0);
  ctx.lineTo(scale, scale);//

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale, c.width);//

  ctx.moveTo(scale * 2, scale);
  ctx.lineTo(scale * 2, c.width);//

  ctx.moveTo(scale, scale);
  ctx.lineTo(c.width, scale);//

  ctx.moveTo(scale * 3, scale);
  ctx.lineTo(scale * 3, c.width);

  ctx.moveTo(scale * 4, scale);
  ctx.lineTo(scale * 4, c.width);//

  ctx.moveTo(scale * 5, scale);
  ctx.lineTo(scale * 5, c.width);//

  ctx.moveTo(scale, scale * 2);
  ctx.lineTo(c.width, scale * 2);

  ctx.moveTo(scale, scale * 3);
  ctx.lineTo(c.width, scale * 3);

  ctx.moveTo(scale, scale * 4);
  ctx.lineTo(c.width, scale * 4);

  ctx.moveTo(scale, scale * 5);
  ctx.lineTo(c.width, scale * 5);

  ctx.stroke();

  //draws vars and numbers
  ctx.font = '20pt Roboto';

  //vars
  ctx.fillText('AB', scale * 0.6, scale * 0.4);

  ctx.fillText('CD', scale * 0.1, scale * 0.9);

  //numbers
  ctx.fillText('00', scale * 1.5 - 5, scale - 5);
  ctx.fillText('01', scale * 2.5 - 5, scale - 5);
  ctx.fillText('11', scale * 3.5 - 5, scale - 5);
  ctx.fillText('10', scale * 4.5 - 5, scale - 5);

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6 );
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6 );
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6 );
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6 );
}

function draw3varkmap() {
  //draws table
  ctx.beginPath();

  // ctx.moveTo(0,0);
  // ctx.lineTo(c.width, 0);
  //
  // ctx.moveTo(c.width,0);
  // ctx.lineTo(c.width, c.width);
  //
  // ctx.moveTo(c.width, c.width);
  // ctx.lineTo(0, c.width);
  //
  // ctx.moveTo(0, c.width);
  // ctx.lineTo(0, 0);

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
