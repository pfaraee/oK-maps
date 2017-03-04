//takes a number and returns a left padded binary string representation
export function decToBin(num, vars) {
  if(num > Math.pow(2, vars) - 1) throw new Error('Error, num must be less than 2^vars');
  var num = '' + num.toString(2);
  var pad = '0'.repeat(vars); // its just 5 0's for the max var nums
  return pad.substring(0, pad.length - num.length) + num;
}

//Takes two numbers represented as Binary Strings
export function eliminateTerms(num1, num2) {
  num1 = num1.split('');
  num2 = num2.split('');

  for(let i = 0; i < num1.length; i++ ) {
    if(num1[i] != num2[i]) {
      num1[i] = '-';
      continue;
    }
  }

  return num1.join('');
}


export function solveGroup(group, vars) {
  var term1;
  var term2;

  if(group.length > 2) {
    term1 = solveGroup(group.slice(0, group.length / 2), vars);
    term2 = solveGroup(group.slice(group.length / 2), vars);
  } else {
    term1 = group[0].val;
    term2 = group[1].val;
  }

  return eliminateTerms(decToBin(term1, vars), decToBin(term2, vars));
}

export function binaryTermToVarTerm(term) {
  term = term.split('');
  var string = "";

  for(let i = 0; i < term.length; i++) {
    if(term[i] == "-") continue;
    string += String.fromCharCode(65 + i);
    if(term[i] == 0) string+= "'";
  }

  return string;
}

export function getExpansionFormula(groups, vars) {
  var formula = "F = ";

  for(let i = 0; i < groups.length; i++) {
    var term;

    if(groups[i].length > 1)  {
      term = solveGroup(groups[i], vars);
    } else {
      term = decToBin(groups[i][0].val, vars);
    }

    formula += binaryTermToVarTerm(term);
    if(i != groups.length - 1) formula += " + ";
  }

  return formula;
}
