import CellArray from './modules/CellArray';
import * as Renderer from './modules/Renderer';
import { getExpansionFormula, decToBin, toGrayCode } from './modules/BinaryFunctions';

var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

var scale = c.width / 5 //scale of the cells;

// ----------------------------------------
// Fixes problem with bad scaling on chrome
// ----------------------------------------
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

ctx.scale(ratio, ratio);

// -------------------
// Initial K-map setup
// -------------------
var minterms = [];
var numVars = 3;
var expansionType = 1;

Renderer.drawMap(ctx, numVars, scale);
var cellArray = new CellArray(numVars, expansionType);

document.addEventListener('keypress', function (event) {
  if(event.keyCode == 13) {
    renderMap();
  }
});

var formulaBox = document.getElementById('expansion');

// -----------------------------
// Sets up expansion type switch
// -----------------------------
var expansionTypeSwitch = document.getElementById('expansionType');

expansionTypeSwitch.addEventListener('change', function (event) {
  expansionType = Number(!event.target.checked);
  cellArray.expansionType = expansionType;
  renderMap();
});

// ----------------------------
// Slider and truth table setup
// ----------------------------
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

  var superHeadRow = document.createElement('tr');

  let input = document.createElement('th');
  input.appendChild(document.createTextNode('Input'));
  input.setAttribute('colspan', slider.noUiSlider.get());

  let output = document.createElement('th');
  output.setAttribute('colspan', 3);
  output.appendChild(document.createTextNode('Output'));

  let number = document.createElement('th');
  number.setAttribute('colspan', 1);

  superHeadRow.appendChild(number);
  superHeadRow.appendChild(input);
  superHeadRow.appendChild(output);

  thead.appendChild(superHeadRow);

  var tr = document.createElement('tr');
  // Creates headers for the truth table
  let numTh = document.createElement('th');
  numTh.appendChild(document.createTextNode('#'));

  tr.appendChild(numTh);
  for(let i = 1; i < slider.noUiSlider.get() + 1; i ++) {
    let th = document.createElement('th');
    th.appendChild(document.createTextNode(String.fromCharCode(65 + i - 1)));
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

    let numTd = document.createElement('td');
    numTd.appendChild(document.createTextNode(i));
    tr.appendChild(numTd);

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
  renderMap();

  // default state of formula box
  var formulaBox = document.getElementById('expansion');
  formulaBox.innerHTML = '';
  let li = document.createElement('li');
  li.className = 'collection-item active';
  li.innerHTML = 'F =';
  formulaBox.appendChild(li);

  // rerenders map every time truth tables changes
  $('input:radio').click(function() {
    renderMap();
  });
});

function renderMap() {
  Renderer.reset(canvas);
  Renderer.drawMap(ctx, numVars, scale);

  // resets map and returns formulas
  let formulas = calculateMap();

  formulaBox.innerHTML = '';

  for(let i = 0; i < formulas.length; i ++) {
    let li = document.createElement('li');

    li.className = 'collection-item';
    if(i === 0) li.className += ' active';

    li.dataset.formula = JSON.stringify(formulas[i]);

    let formula = getExpansionFormula(formulas[i], numVars, cellArray.expansionType);

    li.appendChild(document.createTextNode(formula));

    formulaBox.appendChild(li);
  }

  initializeFormulaBox(formulaBox);

  Renderer.drawGroups(ctx, scale, formulas[0]);

  // Terms rendered last so they are not covered by groups
  Renderer.drawTerms(ctx, scale, cellArray.cells);
}

function calculateMap() {
  //resets cell array
  cellArray.reset();

  // marks the values from the truth table
  minterms = getMinterms();
  cellArray.mark(minterms);

  // marks the groups
  let groups = cellArray.getGroups();

  groups = cellArray.markPrimeImplicants(groups);

  return cellArray.getPossibleFormulas(groups);
}

function getMinterms() {
  var temp = [];

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

// Initializes formulas with
function initializeFormulaBox(formulaBox) {
  for (let i = 0; i < formulaBox.childNodes.length; i++) {
    formulaBox.childNodes[i].addEventListener('click', function (event) {
      for(let i = 0; i < formulaBox.childNodes.length; i++) {
        if(!formulaBox.childNodes[i].className || formulaBox.childNodes[i].className.includes('active')) {
          formulaBox.childNodes[i].className = 'collection-item';
        }
      }

      event.target.className += ' active';

      if(!event.target.dataset.formula) return;

      Renderer.reset(canvas);

      Renderer.drawMap(ctx, numVars, scale);

      let data = JSON.parse(event.target.dataset.formula);

      Renderer.drawGroups(ctx, scale, data);
      Renderer.drawTerms(ctx, scale, cellArray.cells);
    });
  }
}
