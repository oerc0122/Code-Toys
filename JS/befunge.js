var stop = false;
var locked = false;
var runn; var breaks = [];
var bef_space, befunge, input_bak, bef_bak;

// Done as object for extensibility with parallel Befunge-98
function inst_ptr(pos,dir,col='blue') {
    this.pos = pos!==undefined?pos:new vector([-1,0]);
    this.dir = dir!==undefined?dir:new vector([1,0]);
    this.stack = [];
    this.inst_hist = [];
    this.nstep = 0;
    this.read = false;
    // For multiple stacks
    this.stack_out = document.getElementById('stack')
    this.colour = col
}

function operation(op) {
    this.op = op;
    this.in = [];
    this.out = [];
}

inst_ptr.prototype.stack_push = function() {
    for (var i in arguments) {
	this.stack.push(arguments[i]);
	this.inst_hist[this.nstep].out.push(arguments[i]);
    }
    this.stack_out.value = this.stack.join('\n');
}

inst_ptr.prototype.stack_pop = function() {
    var out = this.stack.pop()||0;
    this.inst_hist[this.nstep].in.push(out);
    this.stack_out.value = this.stack.join('\n');
    return out;
}

inst_ptr.prototype.output = () => document.getElementById('output').value;
inst_ptr.prototype.input  = () => document.getElementById('input').value;
inst_ptr.prototype.output_o = () => document.getElementById('output');
inst_ptr.prototype.input_o  = () => document.getElementById('input');

inst_ptr.prototype.write = function() {for (i in arguments){this.output_o().value += arguments[i]}}

function step(ip) {
    ip.pos = ip.pos.add(ip.dir);
    ip.pos = ip.pos.cycle([80,25]);
    for (var bp in breaks) if (ip.pos.x == breaks[bp].x && ip.pos.y == breaks[bp].y) pause();
    var op = bef_space[ip.pos.y][ip.pos.x];
    // If in string read
    if (ip.read && op != '"') {
	ip.stack_push(op.charCodeAt(0));
	return;
    }
    interp(op, ip);
    console.log(ip.inst_hist);
}

function copyArr(arr) {
    return arr.map(a => a.join('').split(''));
}
    
function output_bef() {
    var out_bef = copyArr(bef_space);
    for (var ip in befunge) {out_bef = colour_pos(out_bef, befunge[ip].pos.vals,befunge[ip].colour)}
    for (var bp in breaks) {out_bef = colour_pos(out_bef, breaks[bp].vals,'red')}
    for (var line in out_bef) {out_bef[line]=out_bef[line].join('')}
    document.getElementById('befunge').innerHTML=beftoHTML(out_bef.join('\n'));
}    

function colour_pos(bef, pos,colour) {
    const surround = ["<spanstyle='background-color:"+colour+"'>","</span>"]
    bef[pos[1]][pos[0]] = surround[0]+bef[pos[1]][pos[0]]+surround[1];
    return bef;
}

function run_step() {
    if (! locked) lock();
    for (var ip in befunge) step(befunge[ip]);
    output_bef();
}

function lencheck() {
    var entry = document.getElementById('befunge');
    var text = entry.innerText.split('\n');
    for (var i in text) {text[i].replace(/\s*$/,'');}
    for (var i=0; i < 25; i++){
	if (text[i] === undefined) {
	    text[i] = new Array(81).join(" ");
	} else if (text[i].length > 80) {
	    text[i+1] = text[i].substr(80,text[i].length)+text[i+1];
	    text[i] = text[i].substr(0,79);
	} else {
	    text[i] = text[i] + new Array(81-text[i].length).join(" ");
	}
    }
    entry.innerHTML = beftoHTML(text.slice(0,25).join('\n'));
}

function interp(op, ip) {
    const dirs = {">":new vector([1,0]),"v":new vector([0,1]),"<":new vector([-1,0]),"^":new vector([0,-1])};
    var input = document.getElementById('input').value;
    var output = document.getElementById('output').value;

    ip.inst_hist.push(new operation(op));

    switch(op) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
	ip.stack_push(parseInt(op));
	break;
    case "+":
	ip.stack_push(ip.stack_pop()+ip.stack_pop());
	break;
    case "-":
	ip.stack_push(-ip.stack_pop()+ip.stack_pop());
	break;
    case "*":
	ip.stack_push(ip.stack_pop()*ip.stack_pop());
	break;
    case "/":
	ip.stack_push(ip.stack_pop(),ip.stack_pop());
	var tmp= Math.floor(ip.stack_pop()/ip.stack_pop())
	ip.stack_push(tmp==Infinity||isNaN(tmp)?0:tmp);
	break;
    case "%":
	ip.stack_push(ip.stack_pop(),ip.stack_pop());
	ip.stack_push(ip.stack_pop()%ip.stack_pop());
	break;
    case "`":
	ip.stack_push(ip.stack_pop()<ip.stack_pop()?1:0);
	break;
    case "!":
	ip.stack_push(ip.stack_pop()?0:1);
	break;
    case "\\":
	ip.stack_push(ip.stack_pop(),ip.stack_pop());
	break;
    case ">":
    case "v":
    case "<":
    case "^":
	ip.dir = dirs[op];
	break;
    case "?":
	ip.dir = dirs[Object.keys(dirs)[Math.floor(Math.random()*4.)]];
	break;
    case "|":
	ip.dir = ip.stack_pop()?dirs["^"]:dirs["v"];
	break;
    case "_":
	ip.dir = ip.stack_pop()?dirs["<"]:dirs[">"];
	break;
    case '"':
	ip.read = ! ip.read;
	break;
    case ":":
	ip.stack_push(ip.stack[ip.stack.length-1] || 0);
	break;
    case "$":
	ip.stack_pop();
	break;
    case ".":
	ip.write(ip.stack_pop().toString()+" ");
	break;
    case ",":
	ip.write(String.fromCharCode(ip.stack_pop()));
	break;
    case "#":
	ip.pos = ip.pos.add(ip.dir);
	break;
    case "p":
	bef_space[ip.stack_pop()][ip.stack_pop()] = String.fromCharCode(ip.stack_pop());
	break;
    case "g":
	ip.stack_push(bef_space[ip.stack_pop()][ip.stack_pop()].charCodeAt(0));
	break;
    case "&":
	var test = ip.input().match(/^\s*\d+/)
	if (test == null && ip.input().match(/^$/)){
	    pause();
	    ip.pos = ip.pos.sub(ip.dir);
	    alert('Awaiting input');
	} else if (test == null) {
	    die();
	    alert('Invalid input');
	} else {
	    ip.stack_push(parseInt(test[0].trim()));
	    ip.input_o().value = ip.input().substr(test[0].length,ip.input().length);
	}
	break;
    case "~":
	if (ip.input().match(/^$/)){
	    pause();
	    ip.pos = ip.pos.sub(ip.dir);
	    alert('Awaiting input');
	} else {
	    ip.stack_push(ip.input().charCodeAt(0)||0);
	    ip.input_o().value = ip.input().substr(1,ip.input().length);
	}
	break;
    case "@":
	die();
	break;
    }
    ip.nstep++;
    return ip;
}

function pause() {
    clearInterval(runn);
    var step_butt =document.getElementById('step');
    step_butt.onclick=run_step;
    step_butt.innerHTML="Step";
    stop = true;
}

function die() {
    if (locked) lock();
    pause();
}

function clear_code() {if (locked) die(); document.getElementById('befunge').value = "";}
function clear_out() {document.getElementById('output').value = "";}

function get_file(evt,loc) {
    if (locked) die();
    var file = event.target;
    var reader = new FileReader();
    if (loc == 'befunge') {
	reader.onload = function() {document.getElementById(loc).innerHTML = beftoHTML(reader.result)}
    } else {
	reader.onload = function() {document.getElementById(loc).value = reader.result}
    }
    reader.readAsText(file.files[0]);
    // run_step();
    // die();
}

function lock() {
    document.getElementById('befunge').setAttribute('contenteditable',locked);
    locked = !locked;
    var butt = document.getElementById('lock');
    butt.innerHTML = butt.innerHTML=="Lock"?"Unlock":"Lock";

    if (locked) {
	input_bak = document.getElementById('input').value;
	lencheck();
	befunge = [new inst_ptr()];
//	for (var i in befunge) {befunge[i].write("\nNew\n");}
	bef_space = create_bef_space();
	bef_bak = copyArr(bef_space);
    } else {
	befunge = [];
	document.getElementById('input').value = input_bak;
	bef_space = copyArr(bef_bak);
	bef_space = bef_space.map(x=>x.join('')).join('\n').replace(/\s+$/g,'').replace(/\s+\n/g,'\n').split('\n').map(x=>x.split(''))
    }
    output_bef();
}

function download(){
    // From stack overflow
    var textToWrite = document.getElementById('befunge').innerText; 
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

function create_bef_space() {
    var text = document.getElementById('befunge').innerText.split('\n')
    for (var line in text) {text[line] = text[line].split('');}
    var bef_space = new Array(25);
    for (var i = 0; i < 80; i++) {
	bef_space[i] = new Array(80);
	bef_space[i].fill(' ');
    }
    for (var line in text) {
	for (var cha in text[line]) {
	    bef_space[line][cha] = text[line][cha];
	}
    }
    return bef_space;
}

function run(ts) {
    // Clean up any remaining data
    if (ts === undefined) ts = 1;
    if (!stop) lock();
    clearInterval(runn);
    stop = false;
    var step_butt =document.getElementById('step');
    step_butt.onclick=pause;
    step_butt.innerHTML="Pause";
    runn = setInterval(run_step, ts);
}

function beftoHTML(str) {
    return str.replace(/\n/g,'</div><div>').replace(/^/,'<div>').replace(/\&/g,'&amp;').replace(/ /g,'&nbsp;').replace(/spanstyle/g,'span style');
}

function main() {
    document.getElementById('befunge').innerHTML=beftoHTML('~:,:25*-!#v_:"0"-0\`\\\"9"-0`+#v_\n          v       v"bad"<  $<\n          >"dilav">:#,_@');
}

function mouseHandle(evt) {
    // Get selection modified from stack overflow
    if (window.getSelection) {
	var selection = window.getSelection();
	if (selection.type == "Range") {
	    // Only select first character
	    var new_selection = document.createRange();
	    if (selection.anchorOffset >= selection.anchorNode.wholeText.length) {
		new_selection.setStart(selection.anchorNode,selection.anchorOffset-1);
		new_selection.setEnd(selection.anchorNode,selection.anchorOffset);
	    } else {
		new_selection.setStart(selection.anchorNode,selection.anchorOffset);
		new_selection.setEnd(selection.anchorNode,selection.anchorOffset+1);
	    }
	    selection.removeAllRanges();
	    selection.addRange(new_selection);
	}
	var text = selection.toString();
    } else if (document.selection && document.selection.type != "Control") {
	var text = document.selection.createRange().text;
    }
    if (text.match('^.+$')) {
	var ref=text.charCodeAt(0);
	document.getElementById('sel').value=ref==160?32:ref;
	return;
    } else {
	document.getElementById('sel').value='';
	return;
    }
    
}

function breakpoint() {
    var selection = window.getSelection();
    if (selection.type == "Range") {
	var sel = selection.anchorNode;

	var body = sel;
	while (body.parentNode.nodeName == "span") body = body.parentNode;

	var horOffset = selection.anchorOffset;
	while (body.previousSibling != null) {
	    body = body.previousSibling;
	    horOffset += body.nodeType==3?body.length:body.innerText.length;
	}
	
	var body = sel;
	while (body.parentNode.nodeName == "span") body = body.parentNode;
	body = body.parentNode;
	var verOffset = 0;
	while (body.previousSibling != null) {
	    body = body.previousSibling;
	    verOffset += 1;
	}

	var tmp_bp = new vector([horOffset,verOffset])
	for (var bp in breaks) {if (tmp_bp.x == breaks[bp].x && tmp_bp.y == breaks[bp].y) {breaks.splice(bp,1); tmp_bp=0}}
	if (tmp_bp!=0) breaks.push(tmp_bp);
    }
    if (locked) {output_bef()}
    else {lock(); output_bef(); lock()}
}
