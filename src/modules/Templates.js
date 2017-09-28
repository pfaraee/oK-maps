export const tableTemplate = vars => `
    <thead>
      <tr>
        <th colspan="1"></th>
        <th colspan="${vars}">Input</th>
        <th colspan="3">Output</th>
      </tr>
      <tr>
        <th>#</th>
        ${getVarTables(vars)}
        <th>1</th>
        <th>0</th>
        <th>X</th>
      </tr>
    </thead>
    <tbody>
      ${getTableRows(vars)}
    </tbody>
  `;
  
export function getVarTables(numVars) {
  let string = '';

  for(let i = 1; i < numVars + 1; i ++) {
    string += '<th>' + String.fromCharCode(65 + i - 1) + '</th>';
  }

  return string;
};

export function getTableRows(numVars) {
  let string = '';

  for(let i = 0; i < Math.pow(2, numVars); i++) {
    string += '<tr>';
    string += '<td>' + i + '</td>'
   
    var num = '' + i.toString(2);
    var pad = '0'.repeat(numVars); // its just 5 0's for the max var nums
    var bin = pad.substring(0, pad.length - num.length) + num;

    var binArray = bin.split('');

    for (let i = 0; i < binArray.length; i++) {
      string += '<td>' + binArray[i] + '</td>'
    }

    string += `<td> 
                <input name="group${i}" type="radio" id="OFF${i}" value=0 checked>
                <label for="OFF${i}"></label>
              </td>`;
    string += `<td> 
                <input name="group${i}" type="radio" id="ON${i}" value=1 >
                <label for="ON${i}"></label>
              </td>`;  
    string += `<td> 
                <input name="group${i}" type="radio" id="DONTCARE${i}" value=X >
                <label for="DONTCARE${i}"></label>
              </td>`;  
    string +='</tr>'
  }

  return string;
};