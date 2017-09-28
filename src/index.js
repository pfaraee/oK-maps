import Konva from 'konva';
import Renderer from './modules/Renderer';
import { tableTemplate } from './modules/Templates';
import CellArray from './modules/CellArray';
import { getExpansionFormula, decToBin, toGrayCode } from './modules/BinaryFunctions';

// -------------------
// Initial K-map setup
// -------------------
var formulaBox = document.getElementById('expansion');
let minterms = [];
let expansionType = 1;
let numVars = 3; // default
let cellArray = new CellArray(numVars, expansionType);

// render map
const stage = new Konva.Stage({
  container: 'konvaC',   // id of container <div>
  width: 500,
  height: 500
});

const renderer = new Renderer(stage, numVars); 
renderMap();

// document.addEventListener('keypress', function (event) {
//   if(event.keyCode == 13) {
//     renderer.drawMap();
//   }
// });


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

slider.noUiSlider.on('update', () => {
  numVars = Number(slider.noUiSlider.get());
  renderer.vars = numVars;

  let truthTable = document.getElementById('truth-table');

  //resets truth table
  while(truthTable.firstChild){
    truthTable.removeChild(truthTable.firstChild);
  } 

  truthTable.innerHTML = tableTemplate(numVars);

  cellArray = new CellArray(numVars, expansionType);

  //rewdraws map
  renderMap();

  // default state of formula box
  formulaBox = document.getElementById('expansion');
  formulaBox.innerHTML = '';
  let li = document.createElement('li');
  li.className = 'collection-item active';
  li.innerHTML = 'F =';
  formulaBox.appendChild(li);

  // rerenders map every time truth tables changes
  $('input:radio').click(function() {
    console.time("Mark and recalculate map: ");
    renderMap();
    console.timeEnd("Mark and recalculate map: ");
  });

});

function renderMap() {
  renderer.drawMap();

  // resets map and returns formulas
  let formulas = calculateMap();

  formulaBox.innerHTML = '';

  // for(let i = 0; i < formulas.length; i ++) {
  //   let li = document.createElement('li');

  //   li.className = 'collection-item';
  //   if(i === 0) li.className += ' active';

  //   li.dataset.formula = JSON.stringify(formulas[i]);

  //   let formula = getExpansionFormula(formulas[i], numVars, cellArray.expansionType);

  //   li.appendChild(document.createTextNode(formula));

  //   formulaBox.appendChild(li);
  // }
  initializeFormulaBox(formulaBox);
  // console.log('formulas', formulas);
  let formula = getExpansionFormula(formulas[0], numVars, cellArray.expansionType);
  // console.log(formula);
  renderer.drawGroups(formulas);

  // Terms rendered last so they are not covered by groups
  renderer.drawTerms(cellArray.cells);
  console.log(renderer.stage);
}

function calculateMap() {
  //resets cell array
  cellArray.reset();

  // marks the values from the truth table
  minterms = getMinterms();
  cellArray.mark(minterms);

  // marks the groups
  let groups = cellArray.getGroups();
  groups = cellArray.simplifyMinterms(groups);
  // console.log(groups);

  // groups = cellArray.markPrimeImplicants(groups);

  // return cellArray.getPossibleFormulas(groups);
  return groups;
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

      renderer.drawMap();
      renderer.drawTerms();

      let data = JSON.parse(event.target.dataset.formula);

      renderer.drawGroups(data);
    });
  }
}
