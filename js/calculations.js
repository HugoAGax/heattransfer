function calTemp(){
    let data = document.querySelectorAll('.form-control-sm');
    let len = parseInt(data[0].value);
    let thc = parseInt(data[1].value);
    let colTemp = parseInt(data[2].value);
    let hotTemp = parseInt(data[3].value);
    let xnodes = parseInt(data[4].value);
    let ynodes = parseInt(data[5].value);
    let mat = data[6].value;
    let vdif = (hotTemp - colTemp)/(ynodes-1);
    let matrix = math.zeros(ynodes, xnodes)._data;
    let vars = [];
    let kt = 0;

    switch (mat) {
        case 'Copper':
            kt = 401;
            break;
        case 'Aluminum':
            kt = 205;
            break;
        case 'Gold':
            kt = 310;
            break;
        case 'Iron':
            kt = 80;
            break;
    }

    console.log(matrix);
    console.log(vdif);
    console.log(matrix);
    let vtemps = [];

    for(let i = 0; i < ynodes; i++){
        vtemps[i] = colTemp + (vdif*(i));
        for(let j = 0; j < xnodes; j++){
            switch(i){
                case 0:
                    /*matrix[0][j] = {val: vtemps[i]};
                    console.log(vtemps[i]);*/
                break;
                case ynodes-1:
                    /*matrix[ynodes-1][j] = {val: vtemps[i]};
                    console.log(vtemps[i]);*/
                break;
                default:
                    matrix[i][0] = {val: vtemps[i]};
                    matrix[i][xnodes-1] = {val: vtemps[i]};
                break;
            }
        }
    }
    matrix[0] = horizontalBorderUp(colTemp, hotTemp, kt, len, thc, xnodes);
    matrix[matrix.length - 1] = horizontalBorderDown(colTemp, hotTemp, kt, len, thc, xnodes);
    let count = 0;
    for(let i = 1; i < ynodes-1; i++){
        for(let j = 1; j < xnodes-1; j++){
            matrix[i][j] = { val: 'a' + count }
            vars[count] = 'a' + count;
            count++;
        }
    }
    console.log(matrix);
    console.log(vars);
    count = 0;
    
    for(let i = 1; i < ynodes-1; i++){
        for(let j = 1; j < xnodes-1; j++){
            matrix[i][j] = {val: 'a'+count, 
            up: ((matrix[i-1][j].val == undefined)? matrix[i-1][j]: matrix[i-1][j].val), 
            down: ((matrix[i+1][j].val == undefined)? matrix[i+1][j]: matrix[i+1][j].val), 
            left: ((matrix[i][j-1].val == undefined)? matrix[i][j-1]: matrix[i][j-1].val),
            right: ((matrix[i][j+1].val == undefined)? matrix[i][j+1]: matrix[i][j+1].val)};
            count++;
        }
    }
    
    console.log(matrix);
    

    let cons = math.zeros(vars.length, vars.length)._data;
    let vals = math.zeros(1, vars.length)._data;

    let fila = 0;
    let k = 0; 
    let equations = [];
    count = 0; 
    for(let i = 1; i < ynodes-1; i++){
        for(let j = 1; j < xnodes-1; j++){
            equations[count] = matrix[i][j];
            count++;
        }
    }

    for(let i = 0; i < equations.length; i++){
        vals[i] = 0;
        cons[i][parseInt(equations[i].val.substring(1,equations[i].val.length))] += 4;
        if(typeof equations[i].up == 'number'){
            vals[i] += parseInt(equations[i].up); 
        }else{
            let test = parseInt(equations[i].up.substring(1,equations[i].up.length)); 
            cons[i][parseInt(equations[i].up.substring(1,equations[i].up.length))] += -1;
        }
        if(typeof equations[i].left == 'number'){
            vals[i] += parseInt(equations[i].left); 
        }else{
            let test = parseInt(equations[i].left.substring(1,equations[i].left.length)); 
            cons[i][parseInt(equations[i].left.substring(1,equations[i].left.length))] += -1;
        }
        if(typeof equations[i].down == 'number'){
            vals[i] += parseInt(equations[i].down);
            
        }else{
            let test = parseInt(equations[i].down.substring(1,equations[i].down.length)); 
            cons[i][parseInt(equations[i].down.substring(1,equations[i].down.length))] += -1;
        }
        if(typeof equations[i].right == 'number'){
            vals[i] += parseInt(equations[i].right); 
        }else{
            let test = parseInt(equations[i].right.substring(1,equations[i].right.length));
            cons[i][parseInt(equations[i].right.substring(1,equations[i].right.length))] += -1;
        }
    }

    let results = math.multiply(vals, math.inv(cons));
    let table = document.createElement('table');
    table.setAttribute('class','table table-sm table-responsive  text-center table-borderless');
    let thead = document.createElement('thead');
    table.appendChild(thead);
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    let tr = [];
    let td = [];
    let th = [];
    count = 0;
    tr[0] = document.createElement('tr');
    for(let i = 0; i < xnodes-1; i++){
        if(i != 0){
            th[i] = document.createElement('th');
            th[i].innerHTML = 'Col '+(i);
            th[i].setAttribute('scope','col');
            thead.appendChild(th[i]);
        }else{
            th[0] = document.createElement('th');
            th[i].innerHTML = 'Row';
            thead.appendChild(th[i]);
        }
    }
    for(let i = 1; i < ynodes-1; i++){
        tr[i] = document.createElement('tr');
        table.appendChild(tr[i]);
        for(let j = 0; j < xnodes-1; j++){
            if(j != 0){
                td[j] = document.createElement('td');
                td[j].innerHTML = results[count].toFixed(4);
                count++;
                tr[i].appendChild(td[j]);
            }else{
                td[j] = document.createElement('td');
                td[j].innerHTML = '<strong>'+ (i) +'<strong>';
                tr[i].appendChild(td[j]);
            }
            
        }

    }
    console.log(table);
    document.querySelector('.table').innerHTML = '';
    document.querySelector('.table').appendChild(table);
    document.querySelector('.graph').innerHTML = '';
    let canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'myChart');
    document.querySelector('.graph').appendChild(canvas);
    createGraph(results);
}

function createGraph(vtemps) {
    let lbl = [];
    for (i = 0; i < vtemps.length; i++) {
        lbl[i] = i + 1;
    }
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lbl,
            datasets: [{
                label: '# of Votes',
                data: vtemps,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)'
                ],
                borderWidth: 1
            }, 
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });
}

function horizontalBorderUp(ctemp, htemp, mat, len, thc, xnod) {

    let rmat = thc/(mat*(len * 0.01));
    console.log(rmat);

    console.log(mat);
    let heat = rmat*(htemp - ctemp);
    console.log(heat);
    let difTemp = ((heat / (xnod - 1)) * 0.1) / (rmat);
    console.log(difTemp);


    let coltempArr = [];
    coltempArr[0] = { val: ctemp };
    coltempArr[1] = { val: ctemp };
    for (let i = 2; i < xnod; i++) {
        coltempArr[i] = { val: coltempArr[i - 1].val + difTemp };
        console.log(coltempArr[i]);
    }
    console.log(coltempArr);
    return coltempArr;

    /*console.log(mat);
    let heat = (mat * (len * 0.01) * (htemp - ctemp)) / thc;
    console.log(heat);
    let difTemp = ((heat / (xnod - 1)) * thc) / (mat * ((len / (xnod - 1))));
    console.log(difTemp);

    let rmat = mat / (len * 0.01);
    console.log(rmat);

    let coltempArr = [];
    coltempArr[0] = { val: ctemp };
    coltempArr[1] = { val: ctemp };
    for (let i = 2; i < xnod; i++) {
        coltempArr[i] = { val: coltempArr[i - 1].val + difTemp };
        console.log(coltempArr[i]);
    }
    console.log(coltempArr);
    return coltempArr;*/


}

function horizontalBorderDown(ctemp, htemp, mat, len, thc, xnod) {
    let rmat = thc / (mat * (len * 0.01));
    console.log(rmat);

    console.log(mat);
    let heat = rmat * (htemp - ctemp);
    console.log(heat);
    let difTemp = ((heat / (xnod - 1))*0.1) / (rmat);
    console.log(difTemp);


    let coltempArr = [];
    coltempArr[0] = { val: htemp };
    coltempArr[1] = { val: htemp };
    for (let i = 2; i < xnod; i++) {
        coltempArr[i] = { val: coltempArr[i - 1].val + difTemp };
        console.log(coltempArr[i]);
    }
    console.log(coltempArr);
    return coltempArr;

    /*console.log(mat);
    let heat = (mat * (len * 0.01) * (htemp - ctemp)) / thc;
    console.log(heat);
    let difTemp = ((heat / (xnod - 1)) * thc) / (mat * ((len / (xnod - 1))));
    console.log(difTemp);

    let hottempArr = [];
    hottempArr[0] = { val: htemp };
    hottempArr[1] = { val: htemp };
    for (let i = 2; i < xnod; i++) {
        hottempArr[i] = { val: hottempArr[i - 1].val - difTemp };
        console.log(hottempArr[i]);
    }
    console.log(hottempArr);
    return hottempArr;*/

}