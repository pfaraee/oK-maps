'use strict';

var _CellArray = require('./classes/CellArray');

var _CellArray2 = _interopRequireDefault(_CellArray);

var _DrawingFunctions = require('./classes/DrawingFunctions');

var drawer = _interopRequireWildcard(_DrawingFunctions);

var _BinaryFunctions = require('./classes/BinaryFunctions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

var scale = c.width / 5; //scale of the cells;

// fixes problem with browsers making my canvas look bad
var devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1,
    ratio = devicePixelRatio / backingStoreRatio;

var oldWidth = c.width;
var oldHeight = c.height;

c.width = oldWidth * ratio + 1;
c.height = oldHeight * ratio + 1;

c.style.width = oldWidth + 'px';
c.style.height = oldHeight + 'px';

// now scale the context to counter
// the fact that we've manually scaled
// our c element
ctx.scale(ratio, ratio);

//kmap stuff
var minterms = [];
var numVars = 3;
var expansionType = 1;

var cellArray = new _CellArray2.default(numVars, expansionType);

draw3varkmap();

document.addEventListener('keypress', render);

function render() {
  var formulaBox = document.getElementById('expansion');
  //grabs minterms on enter key
  //resets the canvas
  resetkmap();

  switch (numVars) {
    case 3:
      draw3varkmap();
      break;
    case 4:
      draw4varkmap();
      console.log('4 vars');
      break;
    case 5:
      console.log('5 vars');
      break;
    case 6:
      console.log('6 vars');
      break;
    default:
      console.log('You did it Professor.');
      break;
  }

  //resets cell array
  cellArray.reset();

  // marks the values from the truth table
  minterms = getMinterms();
  cellArray.mark(minterms);
  drawer.drawTerms(ctx, scale, cellArray.cells);

  //TODO: make simplify groups just part of the get groups function
  // marks the groups
  var groups = cellArray.simplifyGroups(cellArray.getGroups());
  console.log(groups);
  drawer.drawPoints(ctx, scale, groups);

  //draw formula
  formulaBox.innerHTML = (0, _BinaryFunctions.getExpansionFormula)(groups, numVars, cellArray.expansionType);
}

function getMinterms() {
  var temp = [];
  //TODO: change it to work for more minterms instead of hardcoding the 8
  //gets minterms from html form
  for (var i = 0; i < Math.pow(2, numVars); i++) {
    var formGroup = document.getElementsByName('group' + i);

    for (var j = 0; j < formGroup.length; j++) {
      if (formGroup[j].checked == true) {
        temp[i] = formGroup[j].value;
      }
    }
  }

  return temp;
}

function resetkmap() {
  ctx.clearRect(0, 0, c.width, c.width);
}

var slider = document.getElementById('num-vars');
var expansionTypeSwitch = document.getElementById('expansionType');

expansionTypeSwitch.addEventListener('change', function (event) {
  expansionType = Number(!event.target.checked);
  cellArray.expansionType = expansionType;
  render();
});

noUiSlider.create(slider, {
  start: 3,
  connect: [true, false],
  step: 1,
  range: {
    'min': [3],
    'max': [4]
  },
  pips: {
    mode: 'steps',
    density: 30
  }
});

slider.noUiSlider.on('update', function () {
  var truthTable = document.getElementById('truth-table');

  while (truthTable.firstChild) {
    truthTable.removeChild(truthTable.firstChild);
  }

  var tbl = document.createElement('table');

  var thead = document.createElement('thead');

  var superHeadRow = document.createElement('tr');

  var input = document.createElement('th');
  input.appendChild(document.createTextNode('Input'));
  input.setAttribute('colspan', slider.noUiSlider.get());

  var output = document.createElement('th');
  output.setAttribute('colspan', 3);
  output.appendChild(document.createTextNode('Output'));

  superHeadRow.appendChild(input);
  superHeadRow.appendChild(output);

  thead.appendChild(superHeadRow);

  var tr = document.createElement('tr');
  // Creates headers for the truth table
  for (var i = 0; i < slider.noUiSlider.get(); i++) {
    var th = document.createElement('th');
    th.appendChild(document.createTextNode(String.fromCharCode(65 + i)));
    tr.appendChild(th);
  }

  var off = document.createElement('th');
  off.appendChild(document.createTextNode('0'));
  var on = document.createElement('th');
  on.appendChild(document.createTextNode('1'));
  var dontCare = document.createElement('th');
  dontCare.appendChild(document.createTextNode('X'));

  tr.appendChild(off);
  tr.appendChild(on);
  tr.appendChild(dontCare);

  thead.appendChild(tr);
  tbl.appendChild(thead);

  var tbody = document.createElement('tbody');
  for (var _i = 0; _i < Math.pow(2, slider.noUiSlider.get()); _i++) {
    var _tr = document.createElement('tr');

    var num = '' + _i.toString(2);
    var pad = '0'.repeat(slider.noUiSlider.get()); // its just 5 0's for the max var nums
    var bin = pad.substring(0, pad.length - num.length) + num;

    var binArray = bin.split('');

    for (var _i2 = 0; _i2 < binArray.length; _i2++) {
      var _td = document.createElement('td');
      _td.appendChild(document.createTextNode(binArray[_i2]));
      _tr.appendChild(_td);
    }

    var td = document.createElement('td');
    var input1 = document.createElement('input');
    input1.setAttribute('name', 'group' + _i);
    input1.setAttribute('type', 'radio');
    input1.setAttribute('id', 'OFF' + _i);
    input1.setAttribute('value', '0');
    input1.setAttribute('checked', 'checked');
    var label1 = document.createElement('label');
    label1.setAttribute('for', 'OFF' + _i);
    td.appendChild(input1);
    td.appendChild(label1);

    var td2 = document.createElement('td');
    var input2 = document.createElement('input');
    input2.setAttribute('name', 'group' + _i);
    input2.setAttribute('type', 'radio');
    input2.setAttribute('id', 'ON' + _i);
    input2.setAttribute('value', '1');
    var label2 = document.createElement('label');
    label2.setAttribute('for', 'ON' + _i);
    td2.appendChild(input2);
    td2.appendChild(label2);

    var td3 = document.createElement('td');
    var input3 = document.createElement('input');
    input3.setAttribute('name', 'group' + _i);
    input3.setAttribute('type', 'radio');
    input3.setAttribute('id', 'DONTCARE' + _i);
    input3.setAttribute('value', 'X');
    var label3 = document.createElement('label');
    label3.setAttribute('for', 'DONTCARE' + _i);
    td3.appendChild(input3);
    td3.appendChild(label3);

    _tr.appendChild(td);
    _tr.appendChild(td2);
    _tr.appendChild(td3);

    tbody.appendChild(_tr);
  }

  tbody.style.overflowY = 'scroll';
  tbl.appendChild(tbody);
  truthTable.appendChild(tbl);

  numVars = Number(slider.noUiSlider.get());
  cellArray = new _CellArray2.default(numVars, expansionType);

  //rewdraws map
  resetkmap();
  var formulaBox = document.getElementById('expansion');
  formulaBox.innerHTML = "F =";
  switch (numVars) {
    case 3:
      draw3varkmap();
      break;
    case 4:
      draw4varkmap();
      break;
    default:
      console.log('You did it Professor.');
      break;
  }
});

function draw4varkmap() {
  ctx.beginPath();

  ctx.moveTo(0, 0);
  ctx.lineTo(scale, scale); //

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale, c.width); //

  ctx.moveTo(scale * 2, scale);
  ctx.lineTo(scale * 2, c.width); //

  ctx.moveTo(scale, scale);
  ctx.lineTo(c.width, scale); //

  ctx.moveTo(scale * 3, scale);
  ctx.lineTo(scale * 3, c.width);

  ctx.moveTo(scale * 4, scale);
  ctx.lineTo(scale * 4, c.width); //

  ctx.moveTo(scale * 5, scale);
  ctx.lineTo(scale * 5, c.width); //

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

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6);
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6);
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6);
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6);
}

function draw3varkmap() {
  //draws table
  ctx.beginPath();

  ctx.moveTo(0, 0);
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

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6);
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6);
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6);
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6);
}