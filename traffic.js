var canvas, inter, main_grid;

function load() {
    const inits = [{dir:[1,0],colour:"#FF0000"},{dir:[0,1],colour:"#0000FF"}]
    canvas = new draw_area('canvas');
    main_grid = new grid (canvas.size);
    for (var i=1; i < 100; i++) {
	var testpos = new vector ( [ Math.random(), Math.random() ] ).mul(main_grid.size).toInt();
	var init = inits[Math.floor(Math.random()*2)];
	var success = main_grid.add_grain(testpos, init);
	if (! success) {i--;}
    }
    main_grid.draw();
}

function grain(pos, dir, colour) {
    this.pos = pos;
    this.dir = new vector(dir);
    this.colour = colour || '#FF0000';
    this.moved = false;
}

grain.prototype.move = function (grid) {
    var test = this.pos.add(this.dir).mod(grid.size);
    if (grid.data[test.x,test.y] === undefined) {
	grid.data[this.pos.x,this.pos.y] = undefined;
	this.pos = test;
	this.moved = true;
	grid.data[this.pos.x,this.pos.y] = this;
	return true
    }
    else if (grid.data[test.x,test.y].moved) {
	this.moved = true;
	return true
    } else {
	return false
    }
}


function grid (size) {
    this.size = new vector(size);
    this.grains = [];
    this.not_moved = [];
    this.data = [];
}

grid.prototype.reset = function () {
    for (i in this.grains) {
	this.grains[i].moved = false;
	this.not_moved.push(this.grains[i]);
    }
}

grid.prototype.draw = function () {
    canvas.clear()
    for (i in this.grains) 
	canvas.draw_dot(this.grains[i].pos.vals,colour=this.grains[i].colour,[5,5]);
    
}

grid.prototype.step = function () {
    this.reset()
    while (this.not_moved.length > 0) {
	for (i in this.not_moved) {
	    console.log(this.not_moved[i])
	    var success = this.not_moved[i].move(this)
	    if (success) {
		this.not_moved.splice(i,1)
	    }
	}
    }
    this.draw()
}

grid.prototype.add_grain = function (pos, init) {
    if (this.data[pos.x,pos.y] != undefined) {
	return false;
    }
    var new_grain = new grain ( pos, init.dir, init.colour );
    this.data[pos.x,pos.y] = new_grain;
    this.grains.push(new_grain);
    return true;
}

function main () {
    inter = setInterval(main_grid.step(), 1000)
}

function stop () {
    clearInterval(inter)
}
