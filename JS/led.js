"use strict";
var canvas;
var on_colour = '#00AA00';
var off_colour = '#AA0000';
var grid = 4;
var led_grid = [];
var stop = false;
var runn;
var arg_list = [];
var func = [];

function operation(op,args) {
    this.op = op;
    this.args = args;
}

function clear_code() {died(); document.getElementById('code').value = "";}

function clean_up() {
    var codeElem = document.getElementById('code');
    var code=codeElem.value;
    // Clean up whitespace surrounding code input
    code = code.replace(/^\s+|\s+\n?$/,'')
    code = code.replace(/\s*\n\s*/,'\n')
    if (!/(end|ret)$/.test(code)) {code = code + "\n" + "end"}
    code = code.split('\n')
    var prev = 0;
    var curr = 0;
    var index = 0;
    var index_re = /^([0-9]+)\s/;
    var fun;
    for (var line=0; line<code.length; line++) {
	if(code[line].startsWith('#') || /^\s*$/.test(code[line])) {continue}
	if (curr = index_re.exec(code[line])) { // Check if lines are indexed
	    var currIndex = parseInt(curr[1])
	    if (currIndex <= prev) { // If index ordering bizarre
		index = Math.floor(prev/10)*10 + 10;
		code[line] = code[line].replace(index_re,index.toString()+" ");
		prev = index;
	    } else {
		prev = currIndex;
	    }
	} else { // If not, index them
	    index = Math.floor(prev/10)*10 + 10;
	    code[line] = index.toString() + " " + code[line];
	    prev = index;
	}
	if(fun = /([a-zA-Z][a-zA-Z_0-9]*):$/.exec(code[line])) {func[fun[1]] = prev}
    }
    codeElem.value = code.join('\n')
    return code;
}

function parse() {
    func = [];
    var code = clean_up()
    var commands = [];
    var labels = [];
    for (var line=0; line<code.length; line++) {
	if(code[line].startsWith('#') || /^\s*$/.test(code[line])) {continue}
	var args = code[line].split(/\s+/);
	var label = args.splice(0,1)[0];
	var op = args.splice(0,1)[0];
	commands[label] = new operation(op,args);
	labels.push(parseInt(label));
	if (stop) return;
    }

    return [labels, commands];
}

function init() {
    canvas.fill('#000000');
    led_grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    document.getElementById('code').value = "#H\n10 new 144\n20 bld 6\n30 out\n40 slp 1000\n#A\n50 new 10\n60 bld 144\n70 out\n80 slp 1000\n#P\n90  new 5\n100 swp 96\n110 off 1\n120 bld 16\n130 out\n140 slp 1000\n#P\n150 new 5\n160 swp 96\n170 off 1\n180 bld 16\n190 out\n200 slp 1000\n#Y\n210 new 108\n230 out\n240 slp 1000\n#Space\n250 new 0\n260 out\n270 slp 1000\n#T\n280 new 104\n290 bld 96\n300 out\n310 slp 1000\n#O\n320 new 102\n330 out\n340 slp 1000\n#D\n350 new 102\n360 bld 16\n370 out\n380 slp 1000\n#A\n390 new 10\n400 bld 144\n410 out\n420 slp 1000\n#Y\n430 new 108\n450 out\n460 slp 1000\n#!\n470 new 96\n480 off 2\n490 out\n500 slp 1000\n510 jmp 10\n520 end\n"
    draw();
}

function draw() {
    canvas.clear()
    canvas.fill('#000000')
    for (var i = 0; i < grid; i++) {
	for (var j = 0; j < grid; j++) {
	    canvas.draw_circ([i+0.5,j+0.5],undefined,led_grid[i][j]?on_colour:off_colour,undefined,true);
	}
    }
}

function died() {
    stop = true;
    console.log('Died at '+arg_list['prev'])
    clearTimeout(runn);
}

function interp_arg(arg, permit_array) {
    if (Array.isArray(arg)) {return arg}
    else if (/^[+-]?\d+$/.test(arg)) {return parseInt(arg)}
    else if(/^[+-]?\d+b$/.test(arg)) {return parseInt(arg,2)}
    else if (/^\d/.test(arg)) {alert ('Error: cannot start variable with number'); died(); return}
    else {
	if (Array.isArray(arg_list[arg])) {
	    if (!permit_array) {alert ('Error: cannot operate on grid'); died(); return}
	    return arg_list[arg].slice(); // Return array copy
	}
	else if (arg_list[arg] !== undefined) {return arg_list[arg]}
	else{alert('Error: Variable '+arg+' not set'), died();}
    }
}

function pad0(str,len) {
    return ("0".repeat(len)+str).substr(-len,len);
}

function calc_bits(input) {
    var maxM = (2**grid);
    var maxM2 = (maxM*maxM)-1;
    if (input > maxM2) {console.log('Warning: Output too large, only last '+(grid*2).toString()+' bits will be used')}
    input = input & maxM2; // Ignore bits beyond max
    var horiz = pad0((input >> grid).toString(2),grid); // Shift to forefront and pad to grid bits
    var vert = input & (maxM-1); // Extract front bits
    var output = bits_grid([horiz,vert])
    return output;
}

function bits_grid(input) {
    var output = []
    for (var i = 0; i < grid; i++) {
	var current_bits = parseInt(input[0].charAt(i).repeat(4),2) // Create line operating bit from horizontal
	var result = current_bits^input[1]; // Xor bits
	result = pad0(result.toString(2),grid) // Make into binary number (len=grid)
	output.push(result.split('').map(Number)); // Push to array as numeric values
    }
    return output;
}

function build_mask(input) {
    if (Array.isArray(input)) {return input;}
    return calc_bits(input)
}

function opn(args) { // New is intrinsic function, hence opn = open/new operation
    if (args.length != 1) {alert ('Error: opn has bad number of arguments'); died(); return}
    var output = interp_arg(args[0]);
    output = calc_bits(output)
    for (var i = 1; i <= grid; i++) {
	led_grid[grid-i] = output[i-1];
    }	
}

function off(args) {
    if (args.length != 1) {alert ('Error: off has bad number of arguments'); died(); return}
    var output = interp_arg(args[0]);
    output = calc_bits(output)
    for (var i = 1; i <= grid; i++) {
	for (var j = 0; j < grid; j++) {
	    if(output[i-1][j]) {led_grid[grid-i][j] = 0;}
	}
    }	
}

function bld(args) {
    if (args.length != 1) {alert ('Error: bld has bad number of arguments'); died(); return}
    var output = interp_arg(args[0]);
    output = calc_bits(output)
    for (var i = 1; i <= grid; i++) {
	for (var j = 0; j < grid; j++) {
	    led_grid[grid-i][j] = output[i-1][j]|led_grid[grid-i][j];
	}
    }	
}

function swp(args) {
    if (args.length != 1) {alert ('Error: swp has bad number of arguments'); died(); return}
    var output = interp_arg(args[0]);
    output = calc_bits(output)
    for (var i = 1; i <= grid; i++) {
	for (var j = 0; j < grid; j++) {
	    if(output[i-1][j]) {led_grid[grid-i][j] = led_grid[grid-i][j]?0:1}
	}
    }	
}

function sto(args) {
    if (args.length != 1) {alert ('Error: sto has bad number of arguments'); died(); return}
    arg_list[args[0]] = led_grid.slice();
    return;
}

function set(args) {
    if (args.length != 2) {alert ('Error: set has bad number of arguments'); died(); return}
    var arg_name = args[0];
    var value = interp_arg(args[1], true);
    switch(true) {
	case /^\d+$/.test(arg_name):
	case /^\d/.test(arg_name):
	case /^end$/.test(arg_name):
	case /^prev$/.test(arg_name):
	case /^next$/.test(arg_name):
	case /^sys$/.test(arg_name):
	alert ('Error: cannot set value of '+arg_name); died(); return;
	default: break;
    }
    if (Array.isArray(value)) {arg_list[arg_name] = value; return} // If array or led_grid
    if (value != Math.floor(value)) {console.log('Real value of '+arg_name+' truncated')}
    arg_list[arg_name] = Math.floor(value)
    return;
}

function add(args) {
    if (args.length != 3) {alert ('Error: add has bad number of arguments'); died(); return}
    var a = interp_arg(args[1]);
    var b = interp_arg(args[2]);
    set([args[0],a+b]);
}

function mul(args) {
    if (args.length != 3) {alert ('Error: mul has bad number of arguments'); died(); return}
    var a = interp_arg(args[1]);
    var b = interp_arg(args[2]);
    set([args[0],a*b]);
}

function sub(args) {
    if (args.length != 3) {alert ('Error: sub has bad number of arguments'); died(); return}
    var a = interp_arg(args[1]);
    var b = interp_arg(args[2]);
    set([args[0],a-b]);
}

function mod(args) {
    if (args.length != 3) {alert ('Error: mod has bad number of arguments'); died(); return}
    var a = interp_arg(args[1]);
    var b = interp_arg(args[2]);
    set([args[0],a%b]);
}

function div(args) {
    if (args.length != 3) {alert ('Error: div has bad number of arguments'); died(); return}
    var a = interp_arg(args[1]);
    var b = interp_arg(args[2]);
    set([args[0],a/b]);
}

function dec(args) {
    if (args.length != 1) {alert ('Error: dec has bad number of arguments'); died(); return}
    var a = interp_arg(args[0]);
    set([args[0],a-1]);
}

function inc(args) {
    if (args.length != 1) {alert ('Error: inc has bad number of arguments'); died(); return}
    var a = interp_arg(args[0]);
    set([args[0],a+1]);
}

function shf(args) {
    if (args.length != 2 && args.length != 1) {alert ('Error: shf has bad number of arguments'); died(); return}
    var a = args.length == 2?interp_arg(args[1]):1;
    var b = interp_arg(args[0]);
    if (a > 0) {set([args[0],b<<a])}
    else {set([args[0],b>>a])}
}

function jmp(args) {
    if (args.length != 1) {alert ('Error: jmp has bad number of arguments'); died(); return}
    return interp_arg(args[0])
}

function jif(args) {
    if (args.length != 4) {alert ('Error: jif has bad number of arguments'); died(); return}
    var test = interp_arg(args[0]);
    var lt = interp_arg(args[1]);
    var eq = interp_arg(args[2]);
    var gt = interp_arg(args[3]);
    if (test < 0) {return lt}
    if (test == 0) {return eq}
    if (test > 0) {return gt}
    else {alert ('Error: bad value in jif'); died(); return}
}

function slp(args) {
    if (args.length != 1) {alert ('Error: slp has bad number of arguments'); died(); return}
    return interp_arg(args[0])
}

function say(args) {
    if (args.length != 1) {alert ('Error: say has bad number of arguments'); died(); return}
    console.log(interp_arg(args[0], true))
}

function inv(args) {
    if (args.length > 1) {alert ('Error: inv has bad number of arguments'); died(); return}
    if (args.length == 0) {
	for (var i = 0; i < grid; i++) {
	    for (var j = 0; j < grid; j++) {
		led_grid[i][j] = led_grid[i][j]?0:1;
	    }
	}
    } else {
	var mask = build_mask(interp_arg(args[0],true));
	for (var i = 0; i < grid; i++) {
	    for (var j = 0; j < grid; j++) {
		if (mask[i][j]) 
		    led_grid[i][j] = led_grid[i][j]?0:1;
	    }
	}
    }	
}

function out(args) {
    if (args.length > 1) {alert ('Error: out has bad number of arguments'); died(); return}
    if (args.length == 1) {
	var a = interp_arg(args[0],true);
	if (Array.isArray(a) && Array.isArray(a[0]) && a.length == grid && a[0].length == grid) {
	    sto(['sys']);
	    res(args);
	    draw();
	    res(['sys']);
	    return;}
	else {
	    opn(args)
	}}
    draw();
}

function fun(args) {
    if (args.length != 1) {alert ('Error: fun has bad number of arguments'); died(); return}
    if (func[args[0]] === undefined) {alert('Error: function '+args[0]+' not defined'); died(); return}
    return func[args[0]];
}

function res(args) {
    if (args.length != 1) {alert ('Error: res has bad number of arguments'); died(); return}
    var grid_out = interp_arg(args[0], true);
    if (!Array.isArray(grid_out)) {alert ('Error: in res '+args[0]+' is not a stored grid'); died(); return}
    led_grid = grid_out;
    return;
}

function get(args) {
    if (args.length == 1) {
	var flat = [].concat.apply([],led_grid); // Flatten LED grid
	var count = flat.filter(x=>x==1).length; // Get number of "on" lights in grid
    } else if (args.length == 2) {
	var mask = build_mask(interp_arg(args[1]));
	var count = 0;
	for (var i = 1; i <= grid; i++) {
	    for (var j = 0; j < grid; j++) {
		if (mask[i-1][j] && led_grid[grid-i][j]) count ++;
	    }
	}
    } else {
	alert ('Error: get has bad number of arguments'); died(); return
    }
    set([args[0],count]);
    return;
}

function get_pos(pos,arg) {
    var mouse_pos = canvas.unscale(pos[0]).map(Math.floor);
    var output = [];
    for (var i = 0; i < grid; i++){
	output[i] = [];
	for (var j = 0; j < grid; j++){
	    output[i][j] = 0;
	}
    }
    output[mouse_pos[0]][mouse_pos[1]] = 1;
    set ([arg, output]);
    canvas.set_interactive(undefined, false);
}

function rcv(loc) {
    if (loc.length != 1) {alert ('Error: rcv has bad number of arguments'); died(); return}
    if (canvas.clickable) {alert ('Already waiting for mouse command'); died(); return}
    canvas.set_interactive({func:get_pos,args:loc[0]}, true);
    return;
}

function rcj(loc) {
    if (loc.length != 2) {alert ('Error: rcj has bad number of arguments'); died(); return}
    if (canvas.clickable) {alert ('Already waiting for mouse command'); died(); return}
    canvas.set_interactive({func:get_pos,args:loc[0]}, true);
    return interp_arg(loc[1]);
}

function get_file(evt) {
    var file = event.target
    var reader = new FileReader();
    reader.onload = function() {document.getElementById('code').value = reader.result}
    reader.readAsText(file.files[0])
}

function download(){
    // From stack overflow
    var textToWrite = document.getElementById('code').value; 
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = document.getElementById('savename').value;

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function run() {
    // Clean up any remaining data
    clearTimeout(runn)
    stop = false;
    arg_list = [];
    func = [];
    canvas.set_interactive(undefined, false);
    var parsed = parse();
    var labels = parsed[0];
    arg_list['end'] = Math.max(labels)
    var commands = parsed[1];
    var line = labels[0];
    var func_dep = [];
    function main_loop(){
	var command = commands[line];
	arg_list['prev'] = line;
	line = labels[labels.findIndex((n=>n>line))];
	arg_list['next'] = line;
	var sleep = 5;
	switch(command.op) {
	case command.op.substr(0,command.op.length-1)+":":
	    break;
	case 'jmp':
	    line = jmp (command.args);break;
	case 'jif':
	    line = jif (command.args);break;
	case 'sto':
	    sto (command.args); break;
	case 'res':
	    res (command.args); break;
	case 'get':
	    get (command.args); break;
	case 'rcv':
	    rcv (command.args); break;
	case 'pse':
	    sleep = 100; if (canvas.clickable) {line = arg_list['prev']}; break;
	case 'rcj':
	    line = rcj (command.args); break;
	case 'fun':
	    func_dep.unshift(line);
	    line = fun(command.args);
	    break;
	case 'ret':
	    line = func_dep.splice(0,1)[0]; if (line == []) {died()};break;
	case 'out':
	    out (command.args);break;
	case 'bld':
	    bld (command.args);break;
	case 'inv':
	    inv (command.args);break;
	case 'swp':
	    swp (command.args);break;
	case 'off':
	    off (command.args);break;
	case 'set':
	    set (command.args);break;
	case 'add':
	    add (command.args);break;
	case 'sub':
	    sub (command.args);break;
	case 'mul':
	    mul (command.args);break;
	case 'mod':
	    mod (command.args);break;
	case 'div':
	    div (command.args);break;
	case 'new':
	    opn (command.args);break;
	case 'inc':
	    inc (command.args);break;
	case 'dec':
	    dec (command.args);break;
	case 'shf':
	    shf (command.args);break;
	case 'slp':
	    sleep = slp(command.args);break;
	case 'say':
	    say (command.args);break;
	case 'nop':
	    break;
	case 'end':
	    died(); break;
	default:
	    alert('Bad operation : '+command.op); died();
	}
	if (! stop) {runn = setTimeout(main_loop,sleep)}
    }
    runn = setTimeout(main_loop, 0)
}

function main () {
    canvas = new draw_area('canvas');
    grid = 4;
    canvas.set_grid([grid,grid]);
    canvas.default_colour(off_colour);
    init();
}
