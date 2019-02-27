var canvas;
var dice;
function Die(faces) {
    if (faces === undefined) {this.faces = []; this.showing = undefined; return;}
    else if (Number.isInteger(faces)) {
	this.faces = []; 
	for (var i = 0; i < faces; i++) {this.faces.push(i);}
    }
    else if (Array.isArray(faces)) this.faces = faces;
    this.showing = this.faces[0];
}
function init_dice() {
    var poss  = ["d","h","v","b","l","2d","p","2h"];
    var diceprob = document.forms['dice-prob']
    var avail_faces = new Array(poss.length);
    diceprob.addEventListener('change',updateSlide,false); 
    for (var i in poss) {
	avail_faces[i]=new Image(); 
	avail_faces[i].src="img/Cjk_"+poss[i]+".png";
	// Create Sliders
	var label = document.createElement("label");
	label.innerHTML=poss[i];
	var input = document.createElement("input");
	input.type = "range";input.min=0; input.max=100; input.step=1; input.value=50; input.id=poss[i];
	var output = document.createElement("input");
	output.type = "number"; output.readOnly = true; output.size="1"; output.value="12"; output.id=poss[i]+"o";
	diceprob.append(label); diceprob.append(input); diceprob.append(output); diceprob.innerHTML+="<br>";
    }
    Die.prototype.avail_faces = avail_faces;
}
Die.prototype.roll = function() {this.showing = this.faces[randInt(this.faces.length)]; return this;}

function updateSlide(evt) {
    if (evt === undefined || (evt.target && evt.target.type == "range")) {
	var diceprob = document.forms['dice-prob'];
	var total_prob = 0;
	for (var i = 0; i < diceprob.elements.length; i+=2) 
	    total_prob += Number(diceprob[i].value);
	var nfaces = canvas.real_size[0]*canvas.real_size[1]*6;
	var calc_faces= 0;
	for (var i = 0; i < diceprob.elements.length; i+=2) {
	    diceprob[i+1].value = Math.round(Number(diceprob[i].value)*nfaces/total_prob,0);
	    calc_faces += Number(diceprob[i+1].value);
	}

	for (var i = 0; i < nfaces-calc_faces; i++) 
	    diceprob[(2*i)+1].value = Number(diceprob[(2*i)+1].value) + 1;
	for (var i = nfaces - calc_faces; i < 0; i++)
	    diceprob[(-2*i)+1].value = Number(diceprob[(-2*i)+1].value) - 1;
    }  
}

function updateBar() {
    var bar = document.getElementById('grid_size');
    document.getElementById('Ngrid_size').value = bar.value;
    var grid = Number(document.getElementById('grid_size').value);
    canvas.set_grid([grid,grid]);
    updateSlide();
    dice = gen_dice(canvas.real_size[0]);
}


function gen_dice(grid) {
    dice = new Array(grid*grid).fill();
    var diceprob = document.forms['dice-prob'];
    var dicelist = document.getElementById('dice-list');
    var faces = [];
    // Build array
    for (var i = 1, j=0; i < 16; i+=2,j++) 
	faces = faces.concat(j.toString().repeat(Number(diceprob[i].value)).split('').map(Number));
    
    faces = random_sort(faces);
    dicelist.innerHTML = "";
    for (var i in dice) {dice[i] = new Die(faces.splice(0,6)); dicelist.innerHTML+=dice[i].faces.toString()+"<br>"}
    return dice;
}

function shuffle() {dice = random_sort(dice);}

function random_sort(list) {
    var copy = [];
    while (list.length != 0) {
	copy.push(list.splice(randInt(list.length),1)[0])
    }
    return copy;
}

function roll() {
    dice = dice.map(x =>x.roll());
}

function draw() {
    var x = canvas.real_size[0];
    var y = canvas.real_size[1];
    for (var i=0;i<x;i++){
	for (var j=0;j<y;j++) {
	    canvas.draw_image([i,j],dice[0].avail_faces[dice[i*x+j].showing]);
	}
    }
}

function main() {
    canvas = new draw_area('canvas');
    init_dice();
    updateBar();
}
