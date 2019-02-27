var grid, stop, canvas;

function grid_type(grid_size) {
    this.size = grid_size;
    this.data = new Array(this.size[0]);
    for (var i = 0; i < this.size[0]; i++) {
	this.data[i] = new Array(this.size[1]);
	this.data[i].fill(0);
    }
}

grid_type.prototype.sum_around = function(pos) {
    var out = 0;
    for (var i = (pos[0]+this.size[0]-1)%this.size[0]; i <= (pos[0]+this.size[0]+1)%this.size[0]; i++) {
	for (var j = (pos[1]+this.size[1]-1)%this.size[1]; j <= (pos[1]+this.size[1]+1)%this.size[1]; j++) {
	out += this.data[i][j];
	}
    }
    out -= this.data[pos[0]][pos[1]];
    return out;
}

grid_type.prototype.copy = function() {
    var out = new grid_type(this.size);
    for (i=0;i<this.size[0];i++) {
	for (j=0;j<this.size[1];j++) {
	    out.data[i][j] = this.data[i][j];
	}
    }   
    return out;
}

grid_type.prototype.copyTo = function(grid) {
    for (i=0;i<Math.min(this.size[0],grid.size[0]);i++) {
	for (j=0;j<Math.min(this.size[1],grid.size[1]);j++) {
	    grid.data[i][j] = this.data[i][j];
	}
    }   
}

Array.prototype.sum = function() {return this.reduce((prev,curr)=> prev+curr)}

grid_type.prototype.sum = function() {return this.data.reduce((prev,curr)=> prev+curr.sum())}

function init_fig8() {
    for (var i = 3; i < 6; i++) {
	for (var j = 3; j < 6; j++) {
	    grid.data[i][j] = 1;
	}
    }
    for (i = 6; i < 9; i++) {
	for (j = 6; j < 9; j++) {
	    grid.data[i][j] = 1;
	}
    }	
}

function update() {
    const kill1 = [0,1,4,5,6,7,8];
    const live0 = [3];
    var next = grid.copy()
    for (i=1;i<grid.size[0]-1;i++) {
	for (j=1;j<grid.size[1]-1;j++) {
	    var curr = grid.data[i][j];
	    var sum = grid.sum_around([i,j])
	    if ((kill1.indexOf(sum) > -1) && curr==1) {	   
		next.data[i][j] = 0;
	    } else if (curr == 1) {
		next.data[i][j] = 1;
	    } else if ((live0.indexOf(sum) > -1) && curr==0) {
		next.data[i][j] = 1;
	    }
	}
    }
    return next
}

function draw(canvas) {
    canvas.clear()
    for (i=1;i<grid.size[0];i++) {
	for (j=1;j<grid.size[1];j++) {
	    if (grid.data[i][j])
		canvas.draw_dot([i,j]);
	    }
    }
}

function fill() {return 1; }
function erase() {return 0; }
function invert(i) {return (i + 1)%2; }
function rand() {return Math.floor(Math.random()*2.)}

function click_draw(pos) {
    if (document.getElementsByName('action')[0].checked) { f = fill;}
    else if (document.getElementsByName('action')[1].checked) { f = erase;}
    else if (document.getElementsByName('action')[2].checked) { f = invert;}
    else if (document.getElementsByName('action')[3].checked) { f = rand;}
    var gpos = [canvas.unscale(pos[0]).map(Math.floor),canvas.unscale(pos[1]).map(Math.floor)]
    for (var i = gpos[0][0]; i <= gpos[1][0]; i++) {
	for  (var j = gpos[0][1]; j<= gpos[1][1]; j++) {
	    grid.data[i][j] = f(grid.data[i][j])
	}
    }
}

function run() {
    var interval = setInterval(function () {
	grid = update(grid,canvas);
	draw(canvas);
	if (stop) clearInterval(interval);
    }, 200)
}

function pause() {
    var interval = setInterval(function () {
 	draw(canvas);
	if (! stop) clearInterval(interval);
    }, 200)
}

function recolour() {canvas.default_colour(document.getElementById('colour').value)}

function change_size() {
    var grid_scale = Number(document.getElementById('scale').value);
    canvas.set_near_real_size([grid_scale,grid_scale]);
    temp = new grid_type(canvas.real_size);
    grid.copyTo(temp);
    return temp;
}

function main() {
    canvas = new draw_area('canvas');
    grid = new grid_type([1,1]);
    grid = change_size();
    recolour();
    init_fig8();

    draw(canvas);
    canvas.set_interactive({func:click_draw});
    pause();
}
