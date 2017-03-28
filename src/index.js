import CellArray from './classes/CellArray';
import * as drawer from './classes/DrawingFunctions';
import { getExpansionFormula } from './classes/BinaryFunctions';

var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

// c.height = window.innerHeight / 8 * 5;
// c.width = window.innerHeight / 8 * 5;

var scale = c.width / 5 //scale of the cells;

// fixes problem with browsers making my canvas look bad
var devicePixelRatio = window.devicePixelRatio || 1,
      backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1,
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

var cellArray = new CellArray(numVars, expansionType);

draw3varkmap();

function getMinterms() {
  var temp = [];
  //TODO: change it to work for more minterms instead of hardcoding the 8
  //gets minterms from html form
  for(let i = 0; i < Math.pow(2, numVars); i++) {
    var formGroup = document.getElementsByName('group' + i);

    for(let j = 0; j < formGroup.length; j++) {
      if(formGroup[j].checked == true) {
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

document.addEventListener('keypress', function (event) {
  if(event.keyCode == 13) {
    render();
  }
});

var formulaBox = document.getElementById('expansion');

function initializeFormulaBox() {
  for (let i = 0; i < formulaBox.childNodes.length; i++) {
    formulaBox.childNodes[i].addEventListener('click', function (event) {
      console.log("hello");
      var renderFormula;

      for(let i = 0; i < formulaBox.childNodes.length; i++) {
        if(!formulaBox.childNodes[i].className || formulaBox.childNodes[i].className.includes('active')) {
          formulaBox.childNodes[i].className = 'collection-item';
        }
      }

      event.target.className += ' active';

      if(!event.target.dataset.formula) return;

      resetkmap();

      switch(numVars) {
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

      let data = JSON.parse(event.target.dataset.formula);

      renderFormula = getExpansionFormula(data, numVars, cellArray.expansionType);
      console.log(renderFormula);

      drawer.drawPoints(ctx, scale, data);
      drawer.drawTerms(ctx, scale, cellArray.cells);
    });
  }
}

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
  off.appendChild(document.createTextNode('0'));
  let on = document.createElement('th');
  on.appendChild(document.createTextNode('1'));
  let dontCare = document.createElement('th');
  dontCare.appendChild(document.createTextNode('X'));

  tr.appendChild(off);
  tr.appendChild(on);
  tr.appendChild(dontCare);

  thead.appendChild(tr);
  tbl.appendChild(thead);

  var tbody = document.createElement('tbody');
  for(let i = 0; i < Math.pow(2, slider.noUiSlider.get()); i++) {
    let tr = document.createElement('tr');

    var num = '' + i.toString(2);
    var pad = '0'.repeat(slider.noUiSlider.get()); // its just 5 0's for the max var nums
    var bin = pad.substring(0, pad.length - num.length) + num;

    var binArray = bin.split('');

    for (let i = 0; i < binArray.length; i++) {
      let td = document.createElement('td');
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

  tbl.appendChild(tbody);
  truthTable.appendChild(tbl);

  numVars = Number(slider.noUiSlider.get());
  cellArray = new CellArray(numVars, expansionType);

  //rewdraws map
  resetkmap();

  var formulaBox = document.getElementById('expansion');
  formulaBox.innerHTML = "";
  let li = document.createElement('li');
  li.className = "collection-item active";
  li.innerHTML = "F =";
  formulaBox.appendChild(li);

  switch(numVars) {
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

  $('input:radio').click(function() {
    initializeFormulaBox();
    render();
  });
});

function render() {
  //grabs minterms on enter key
  //resets the canvas
  resetkmap();

  switch(numVars) {
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

  redrawMap();
}

function redrawMap() {
  //resets cell array
  cellArray.reset();

  // marks the values from the truth table
  minterms = getMinterms();
  cellArray.mark(minterms);

  //TODO: make simplify groups just part of the get groups function
  // marks the groups
  let groups = cellArray.getGroups();
  // console.log(groups);
  groups = cellArray.markPrimeImplicants(groups);
  // groups = cellArray.simplifyGroups(groups);

  // Add formulas to box
  let formulas = cellArray.getPossibleFormulas(groups);
  formulaBox.innerHTML = "";

  for(let i = 0; i < formulas.length; i ++) {
    let li = document.createElement('li');

    li.className = "collection-item";
    if(i === 0) li.className += " active";

    li.dataset.formula = JSON.stringify(formulas[i]);

    let formula = getExpansionFormula(formulas[i], numVars, cellArray.expansionType);

    li.appendChild(document.createTextNode(formula));

    formulaBox.appendChild(li);
  }

  initializeFormulaBox();

  // var groups = cellArray.getGroups();

  // console.log(groups);

  drawer.drawPoints(ctx, scale, formulas[0]);
  drawer.drawTerms(ctx, scale, cellArray.cells);
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
