/*
* Returns the binary representation of the number left padded to the number of vars
* @param {number} num -  a number to be converted
* @param {number} vars - the amount of vars the number should be represented in
* @return {string} the binary representation of the number
*/
export function decToBin(num, vars) {
  if(num > Math.pow(2, vars) - 1 || num < 0) throw new Error('Invalid Number');

  var num = '' + num.toString(2);
  var pad = '0'.repeat(vars); // its just 5 0's for the max var nums

  return pad.substring(0, pad.length - num.length) + num;
}

export function toGrayCode(n) {
    if (n < 0) {
        throw new RangeError("cannot convert negative numbers to gray code");
    }
    return n ^ (n >>> 1);
}

/*
* Returns the result of applying Elimination Theorem to the two terms
* @param {string} term1 - the first term
* @param {string} term2 - the second term
* @return {string} the result of Elimination Theorem
*/
export function eliminateTerms(term1, term2) {
  term1 = term1.split('');
  term2 = term2.split('');

  var numDiff = 0;

  for(let i = 0; i < term1.length; i++ ) {
    if(term1[i] != term2[i]) {
      term1[i] = '-';
      numDiff++;
      if (numDiff > 1) throw new Error('Unsimplifiable Terms Given');
    }
  }

  return term1.join('');
}

/*
* Returns a group of terms solved using Elimination Theorem, represented as a string
* @param {Array.Cell}  group - group to simplify
* @param {number} vars - number of vars for the kmap
* @return {string} the simplified group
*/
export function solveGroup(group, vars) {
  if (group.length & (group.length - 1) && group.length != 1 || group.length > Math.pow(2, vars)) throw new Error('Invalid Group');

  var term1;
  var term2;

  if(group.length > 2) {
    term1 = solveGroup(group.slice(0, group.length / 2), vars);
    term2 = solveGroup(group.slice(group.length / 2), vars);
    return eliminateTerms(term1, term2);
  } else if(group.length < 2){
    return decToBin(group[0].val, vars);
  }

  term1 = group[0].val;
  term2 = group[1].val;

  return eliminateTerms(decToBin(term1, vars), decToBin(term2, vars));
}

/*
* Returns a variable representation of a term
* @param {string} term
* @return {string} the converted term
*/
export function binaryTermToVarTerm(term) {
  if(term === '') return 'Undefined Term';
  term = term.split('');
  var string = '';

  for(let i = 0; i < term.length; i++) {
    if(term[i] === '-') continue;
    string += String.fromCharCode(65 + i);
    if(term[i] === '0') string += "'";
  }

  return string;
}

/*
* Returns the expansion formula for the array of groups
* @param {Array.Array.Cell} groups - groups to expand
* @param {number} vars - number of vars in the map
* @return {string} the expansionFormula
*/
export function getExpansionFormula(groups, vars, expansionType) {
  switch(expansionType) {
    case 1:
      return getMintermExpansionFormula(groups, vars);
      break;
    case 0:
      return getMaxtermExpansionFormula(groups, vars);
      break;
    default:
      return 'Undefined Formula';
      break;
  }
}

export function getMintermExpansionFormula(groups, vars) {
  var formula = 'F = ';

  for(let i = 0; i < groups.length; i++) {
    var term;

    if(groups[i].cellArray.length > 1)  {
      term = solveGroup(groups[i].cellArray, vars);
    } else {
      term = decToBin(groups[i].cellArray[0].val, vars);
    }

    formula += binaryTermToVarTerm(term);

    if(i != groups.length - 1) formula += ' + ';
  }

  return formula;
}

export function getMaxtermExpansionFormula(groups, vars) {
  var formula = 'F = ';

  for(let i = 0; i < groups.length; i++) {
    formula += '(';
    var term;

    if(groups[i].cellArray.length > 1)  {
      term = solveGroup(groups[i].cellArray, vars);
    } else {
      term = decToBin(groups[i].cellArray[0].val, vars);
    }

    term = binaryTermToVarTerm(term).split('');

    for(let j = 0; j < term.length; j++) {
      formula += term[j];
      if(term[j+1] === "'") {
        formula += term[j+1];
        j++;
      }
      console.log(term[j]);
      if(j != term.length - 1) formula += ' + ';
    }

    formula += ')';
  }

  return formula;
}
