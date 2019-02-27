const rules = [function(ant) {ant.dir = (ant.dir+3)%4;},function(ant) {ant.dir = (ant.dir+1)%4;},function(ant) {ant.dir = (ant.dir+2)%4;},function(ant) {return;}]
var first_pass;
var colour_ref = [];
var op_ref = [];
var grid; var run_id =0; var active_id = 1;
var avail_colour = colour_ref.length;
var grid_size = []; const tile_size = 10; const ant_size  = Math.floor((tile_size/2)+1);
var ldraw_ant = ldraw_tile = lrandom_tile = lpbc = stop = true;

function ant (pos) {
    this.dir = Math.floor(4.*Math.random());
    this.pos = pos;
}

ant.prototype.move = function() {
    if (!lpbc) {
	switch(this.dir) {
	case 0:
	    this.pos[0] += 1;
	    if (this.pos[0] > grid_size[0]-1) {this.pos[0] -= 1; this.dir = (this.dir+2)%4}
	    break;
	case 1:
	    this.pos[1] += 1;
	    if (this.pos[1] > grid_size[1]-1) {this.pos[1] -= 1; this.dir = (this.dir+2)%4}
	    break;
	case 2:
	    this.pos[0] -= 1;
	    if (this.pos[0] < 0) {this.pos[0] += 1; this.dir = (this.dir+2)%4}
	    break;
	case 3:
	    this.pos[1] -= 1;
	    if (this.pos[1] < 0) {this.pos[1] += 1; this.dir = (this.dir+2)%4}
	    break;
	}
    } else {
	switch(this.dir) {
	case 0:
	    this.pos[0] += 1;
	    if (this.pos[0] > grid_size[0]-1) {this.pos[0] = 0;}
	    break;
	case 1:
	    this.pos[1] += 1;
	    if (this.pos[1] > grid_size[1]-1) {this.pos[1] = 0;}
	    break;
	case 2:
	    this.pos[0] -= 1;
	    if (this.pos[0] < 0) {this.pos[0] = grid_size[0]-1;}
	    break;
	case 3:
	    this.pos[1] -= 1;
	    if (this.pos[1] < 0) {this.pos[1] = grid_size[1]-1;}
	    break;
	}
    }
}



function grid_p (pos) {
    this.pos = pos;
    this.colour = (lrandom_tile) ? Math.floor(Math.random()*avail_colour) : 0;
}

function draw_ant(ctx,ant) {
    if (!ldraw_ant) return;
    ctx.fillStyle='#000000';
    ctx.fillRect((ant.pos[0]*tile_size)-(ant_size/2),(ant.pos[1]*tile_size)-(ant_size/2),ant_size,ant_size);
}

function draw_tile(ctx,tile) {
    ctx.clearRect((tile.pos[0]*tile_size)-(tile_size/2),(tile.pos[1]*tile_size)-(tile_size/2),tile_size,tile_size);
    if (ldraw_tile) {
	ctx.fillStyle=colour_ref[tile.colour];
    } else {
	ctx.fillStyle = '#FFFFFF';
    }
    ctx.fillRect((tile.pos[0]*tile_size)-(tile_size/2),(tile.pos[1]*tile_size)-(tile_size/2),tile_size,tile_size);
}

function add_rule(forms,str_in) {
    var newdiv = document.createElement("select");
    newdiv.name=str_in;
    newdiv.addEventListener("change",update);
    newdiv.innerHTML = "<option id='tmp' value=''>Select</option><option value='#000000'>Black</option><option value='#FFFFFF'>White</option><option value='#FF0000'>Red</option><option value='#0000FF'>Blue</option><option value='#FFFF00'>Yellow</option><option value='#009900'>Green</option><option value='#00FF00'>Light Green</option><option value='#DDA0DD'>Plum</option><option value='#800080'>Purple</option><option value='#FFA500'>Orange</option><option value='#000080'>Navy</option>";
    forms.appendChild(newdiv);
    var newdiv = document.createElement('select');
    newdiv.name=str_in+"op";
    newdiv.addEventListener("change",update);
    newdiv.innerHTML = "<option value='3'>Do Nothing</option><option value='0'>Turn Left</option><option value='1'>Turn Right</option><option value='2'>Reverse</option>";
    forms.appendChild(newdiv);
    var newdiv = document.createElement("div");
    forms.appendChild(newdiv);
}


function add_selection(colour,op) {
    if (colour === undefined) {colour = 0;} 
    if (op === undefined) {op = 0;} 
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length/2;
    if (i > 20) return;
    add_rule(forms,"rule"+i);
    forms['rule'+i].selectedIndex = colour;
    forms['rule'+i+'op'].selectedIndex = op;
}

function update() {
    var forms = document.forms['values'];
    ldraw_tile   = forms["colour"].checked;
    lrandom_tile = forms["new_random"].checked;
    lpbc         = forms["pbc"].checked;
    ldraw_ant = forms["draw_ant"].checked;
    change_op();
    if (!ldraw_tile) {clear();} else {redraw();}
}

function clear() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

function redraw() {
    for (var x=0; x < grid_size[0]; x++) {
	for (var y=0; y < grid_size[1]; y++) {
	    if (!grid[x][y] === undefined) draw_tile(ctx,grid[x][y]) 
	}
    }
}

function load() {
    var forms = document.forms["values"];
    var ops = document.forms['ops'];
    first_pass = true
    forms['nants'].value = 4;
    forms["colour"].checked = ldraw_tile;
    forms["new_random"].checked = lrandom_tile;
    forms["pbc"].checked = lpbc;
    forms["draw_ant"].checked = ldraw_ant;
    add_selection(1,2);
    add_selection(2,1);
}

function button_stop () {
    stop = true
}

function change_op() {
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length/2;

    colour_ref = [];
    op_ref = [];

    for (var op=0; op < i; op++) {
	if (forms['rule'+op].value == "") continue;
	if (forms['rule'+op].options.namedItem('tmp')) {forms['rule'+op].options.namedItem('tmp').remove();}
	colour_ref.push(forms['rule'+op].value);
	op_ref.push(rules[forms['rule'+op+'op'].value]);
    }

    avail_colour = colour_ref.length;
    if (avail_colour == 0) forms['rule0'].value=1;
}

function main() {

    
    var forms = document.forms["values"];
    var canvas = document.getElementById('canvas');
    if (!(canvas.getContext)) return;
    run_id += 1
    pause = setInterval(
	function() {
	    if (active_id == run_id) {clearInterval(pause)}
	}
	,10 )
    stop = false
    var size = [canvas.width,canvas.height];
    var true_centre = [Math.floor(size[0]/2),Math.floor(size[1]/2)];
    var centre = [Math.floor(true_centre[0]/tile_size),Math.floor(true_centre[1]/tile_size)];
    var ctx = canvas.getContext('2d');
    grid_size = [Math.floor(size[0]/tile_size),Math.floor(size[1]/tile_size)];

    if (first_pass) {
	grid = new Array(grid_size[0]);
	for (var i = 0; i < grid_size[0]; i++) {
	    grid[i] = new Array(grid_size[1]);
	}
    } else {
	for (var i = 0; i < grid_size[0]; i++) {
	    for (var j = 0; j < grid_size[1]; j++) {
		grid[i][j] = undefined
	    }
	}
    }
    change_op();

    nants = Number(forms['nants'].value) ? Math.floor(Number(forms["nants"].value)) : 4;
    if (nants < 1) { nants = 4; }
    forms['nants'].value = nants;
    var ants = []; ants.length=0;
    angle = 2.*Math.PI/nants;

    for (var i=0; i < nants; i++) {
	ants.push(new ant([Math.floor((grid_size[0]/2-3)*Math.cos(i*angle))+centre[0], Math.floor((grid_size[1]/2-3)*Math.sin(i*angle))+centre[1]]));
	grid[ants[i].pos[0]][ants[i].pos[1]] = new grid_p([ants[i].pos[0],ants[i].pos[1]]);
	draw_ant(ctx,ants[i]);
    }

    first_pass = false

    ctx.clearRect(0,0,size[0],size[1]);

    loop = setInterval( function() {
	for (var i=0; i < nants; i++) {
	    if (grid[ants[i].pos[0]][ants[i].pos[1]]) { draw_tile(ctx,grid[ants[i].pos[0]][ants[i].pos[1]]);}
	    ants[i].move();
	    var grid_point = [ants[i].pos[0],ants[i].pos[1]];
	    if (grid[grid_point[0]][grid_point[1]]) {
		op_ref[(grid[grid_point[0]][grid_point[1]].colour)](ants[i]);
		grid[grid_point[0]][grid_point[1]].colour += 1;
		grid[grid_point[0]][grid_point[1]].colour %= avail_colour;
	    } else {
		grid[grid_point[0]][grid_point[1]] = new grid_p([ants[i].pos[0],ants[i].pos[1]]);
		op_ref[grid[grid_point[0]][grid_point[1]].colour](ants[i]);
	    }
	    draw_tile(ctx,grid[grid_point[0]][grid_point[1]]);
	    draw_ant(ctx,ants[i]);
    	}
	if (run_id != active_id || stop) {active_id +=1; clearInterval(loop); }
    }, 50)

}    


