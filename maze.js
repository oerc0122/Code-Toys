var canvas,colour,inter,form,grid,div,hprob,vprob;
function randInt(min, max) {
    if (max === undefined) {max = min; min = 0;}
    return Math.floor(Math.random() * (max - min)) + min;
}

function createArray(length) {
    var arr = new Array(length || 0), i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    
    return arr;
}


function Point(pos,par) {
    this.p = pos;
    this.d = par;
}

function Apoint(pos,dist,heu,parent) {
    this.p = pos;
    this.d = dist*0.8;
    this.h = heu;
    this.f = this.h+this.d;
    this.parent = parent;
}

var D = [function(pos) {return [pos[0]+1, pos[1]]},
	 function(pos) {return [pos[0], pos[1]+1]},
	 function(pos) {return [pos[0]-1, pos[1]]},
	 function(pos) {return [pos[0], pos[1]-1]},
	 function(pos) {return [pos[0], pos[1]]}];


Point.prototype.check_edges = function (OCC) {
    if (OCC !== undefined) OCC = []
    for (var i = 0; i<5; i++){ 
	var check = D[i](this.p);
	if (OCC === undefined) {
	    // If this is where we've come from
	    if (i == this.d) continue;
	    // If outside range	    
	    else if (check.some(x => {return x < 1})  || check.some(x => {return x > canvas.real_size[0]-1})) continue; 
	    if ( grid[check[0]][check[1]] == 1 || (i<4 && grid[check[0]][check[1]]==2)) return false;
	} 
	else {
	    if (check.some(x => {return x < 0})  || check.some(x => {return x > canvas.real_size[0]-1})) continue; 
	    else if (i<4 && grid[check[0]][check[1]] == 1) {OCC.push(check)}
	}
    }
    return OCC || true;
};

Apoint.prototype.check_edges = Point.prototype.check_edges;

function ellers(row, col)  {
    var row_below = []
    if (col > grid.length - 4) {vprob = -1;}
    for (var elem = 0; elem<row.length-1; elem++) {
	path([col,1+2*elem])
	if (row[elem+1] != row[elem] && Math.random() > vprob) { 
	    var tag = row[elem+1]
	    for (var j = 0; j < row.length; j++)
		if (row[j] == tag) 
		    row[j] = row[elem];
	    path([col,2+2*elem])
	}
    }
    path([col,1+2*elem]) // Catch last row
    var old = row[0];
    var count = 0;
    for (var elem = 0; elem<row.length; elem++) {
	row_below[elem] = col*row.length+1+elem; // Set to new set
	if (row[elem] == old) {
	    count++;
	} else {
	    var wall = 0;
	    for (var down = elem-count; down<elem; down++) {
		if (Math.random() > hprob) {
		    row_below[down] = row[down];
	    	    path([col+1,1+2*down]);
	    	    wall++;
		}
	    }
	    if (wall < 1) {
	    	var down = elem - randInt(count)-1;
		row_below[down] = row[down];
	    	path([col+1,1+2*down]);
	    	wall++;
	    }
	    count = 1;
	    old = row[elem];
	}
    }
    // Catch last row
    var wall = 0;
    for (var down = elem-count-1; down<elem; down++) {
	if (Math.random() > hprob) {
	    row_below[down] = row[down];
	    path([col+1,1+2*down]);
	    wall++;
	}
    }
    if (wall < 1) {
	var down = elem - randInt(count)-1;
	row_below[down] = row[down];
	path([col+1,1+2*down]);
	wall++;
    }
    count = 1;
    old = row[elem];
    
    return row_below;
}

function RT(possible) {
    var sel = randInt(0,possible.length);
    sel = possible.splice(sel,1)[0];
    if (sel.check_edges()) {
	path(sel.p);
	path(D[sel.d](sel.p));
	for (var i = 0; i<4; i++){ 
	    var tmp = new Point(D[i](D[i](sel.p)),(i+2)%4)
	    if (tmp.p.some(x => {return x < 1})  || 
		tmp.p.some(x => {return x > canvas.real_size[0]-2})) continue;
	    if (tmp.check_edges()) {
		possible.push(tmp);
		node(tmp.p)
	    }
	}
    } 

}

function CleanMap() {
    var grid_max =canvas.real_size[0]
    for (var i=1; i < grid_max; i++) {
	for (var j=1; j < grid_max; j++) {
	    if (grid[i][j] == 2)
		wall([i,j]);
	}
    }
}

function ClearMap() { // Undo path
    var grid_max =canvas.real_size[0]
    for (var i=1; i < grid_max; i++) {
	for (var j=1; j < grid_max; j++) {
	    if (grid[i][j] == 2)
		path([i,j]);
	}
    }
}

function flood(target) {
    if (inter) clearInterval(inter);
    canvas.set_colour_range(['#ff0000','#ffffff'],250);
    var exp = [new Point([0,1],10)];
    canvas.draw_dot(exp[0].p);
    var poss = [];
    poss = exp[0].check_edges(true);
    var unexp = []
    for (i in poss) {unexp.push(new Point(poss[i],11))}
    inter= setInterval (function () {
	for (var q = 0; q < grid.length/5; q++){
	    var curr = unexp.splice(0,1)[0]
	    node(curr.p)
	    if (manhat(curr.p,target) == 0) {console.log(curr.d)}
	    canvas.draw_dot(curr.p,canvas.colour_list[curr.d%canvas.colour_list.length])
	    poss = curr.check_edges(true)
	    for (i in poss) {
		if (!unexp.some( x => {return poss[i] == x.p} )) { // Not in explored
		    unexp.push(new Point(poss[i],curr.d+1)) // Add the point and colour it
		}
	    }
	    if (unexp.length < 1) {clearInterval(inter);return}
	}
    },1)    
}

function manhat(a,b) {return Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])}

function binary_search(list, a) {
    if (list.length == 0) {
	return 0;
    }
    else if (list.length == 1) {
	if (a['f'] >= list[0]['f']) return 1;
	else if (a['f'] < list[0]['f']) return 0;
    }
    else {
	var h = list.length
	var l = 0
	while (l < h) {
	    var c = Math.floor((h+l)*0.5)
	    if (list[c] == a) return c;
	    (list[c] > a)?h=c-1:l=c+1;
	}
	return c;
    }

}

function sorted_insert(list, a){
    var compArr = list.map(function(a) {return a.f;});
    var loc = binary_search(compArr,a.f)
    list.splice(loc,0,a)
}

function Astar(target) {
    if (inter) clearInterval(inter);
    var unexp = [];
    var exp = [new Apoint([0,1],100,manhat([0,1],target))]
    node(exp[0].p)
    var poss = [];
    poss = exp[0].check_edges(true);
    for (i in poss) {sorted_insert(unexp,new Apoint(poss[i],10,manhat(poss[i],target),exp[0].p))}
    inter = setInterval(function() {
	// while (true){
	for (var q = 0; q < grid.length/5; q++) {
    	    if (unexp.length == 0) {clearInterval(inter);return "Failed"}
    	    var curr = unexp.splice(0,1)[0];
    	    exp.push(curr)
	    node(curr.p)
    	    poss = curr.check_edges(true)
    	    if(manhat(curr.p,target) == 0 ) {clearInterval(inter); 
					     a = curr
					     canvas.draw_dot(target,'#00ff00')
					     while (a.parent !== undefined) {
						 canvas.draw_dot(a.parent,'#00ff00')
						 a = exp.filter((x) => {return x.p == a.parent})[0]
					     }
					     return "Done"} // We're done
    	    for (i in poss) { 
		for (var x = 0; x<unexp.length; x++) {
    		    if (poss[i] == unexp[x].p && unexp[x].d > curr.d+1) { // If it is, replace it
			unexp.splice(x,1)
			sorted_insert(unexp,new Apoint(poss[i],curr.d+1,manhat(poss[i], target),curr.p))
    		    }
		}
		if (x == unexp.length) 
    		    sorted_insert(unexp,new Apoint(poss[i],curr.d+1,manhat(poss[i], target),curr.p));

    	    }
	}
    },0)
}

function solve() {
    var target = [canvas.real_size[0]-1,canvas.real_size[1]-3];
    ClearMap();
    switch(form['method'].value) {
    case 'flood':
	flood(target)
	break;
    case 'A*':
	Astar(target)
	break;
    }
}

function changeval(Num) {
    if (Num) {
	form['size'].value = form['sizebox'].value
    } else {
	form['sizebox'].value = form['size'].value
    }
}

function wall(pos) {
    canvas.draw_dot(pos,colour['back']);
    grid[pos[0]][pos[1]] = 0
}

function path(pos) {
    canvas.draw_dot(pos,colour['front']);
    grid[pos[0]][pos[1]] = 1
}

function node(pos) {
    canvas.draw_dot(pos,colour['node']);
    grid[pos[0]][pos[1]] = 2
}

function cellers(row, col)  {
    var row_below = [];
    if (col > grid.length - 4) {vprob = -1;}
    for (var elem = 0; elem<row.length-1; elem++) {
	pcpath([col,1+2*elem])
	if (row[elem+1] != row[elem] && Math.random() > vprob) { 
	    var tag = row[elem+1]
	    for (var j = 0; j < row.length; j++)
		if (row[j] == tag) 
		    row[j] = row[elem];
	    hcpath([col,2+2*elem],[col,2*elem])
	}
    }
    pcpath([col,1+2*elem]) // Catch last row
    var old = row[0];
    var count = 0;
    for (var elem = 0; elem<row.length; elem++) {
	row_below[elem] = col*row.length+1+elem; // Set to new set
	if (row[elem] == old) {
	    count++;
	} else {
	    var wall = 0;
	    for (var down = elem-count; down<elem; down++) {
		if (Math.random() > hprob) {
		    row_below[down] = row[down];
	    	    vcpath([col,1+2*down],[col+1,1+2*down]);
	    	    wall++;
		}
	    }
	    if (wall < 1) {
	    	var down = elem - randInt(count)-1;
		row_below[down] = row[down];
	    	vcpath([col,1+2*down],[col+1,1+2*down]);
	    	wall++;
	    }
	    count = 1;
	    old = row[elem];
	}
    }
    // Catch last row
    var wall = 0;
    for (var down = elem-count-1; down<elem; down++) {
	if (Math.random() > hprob) {
	    row_below[down] = row[down];
	    vcpath([col,1+2*down],[col+1,1+2*down]);
	    wall++;
	}
    }
    if (wall < 1) {
	var down = elem - randInt(count)-1;
	row_below[down] = row[down];
	vcpath([col,1+2*down],[col+1,1+2*down]);
	wall++;
    }
    count = 1;
    old = row[elem];
    
    return row_below;
}

function circ(pos) {
    ang = pos[1]*2*Math.PI/div;
    rad = (canvas.real_size[0]-pos[0])*canvas.spacing[0]/2;
    return canvas.unscale([canvas.origin[0]+rad*Math.sin(ang),canvas.origin[0]+rad*Math.cos(ang)]);
}

function pcpath(pos) {
    canvas.draw_dot(circ(pos),colour['front'],[5,5])
    grid[pos[0]][pos[1]] = 1
}


function vcpath(posA,posB) {
    canvas.draw_line(circ(posA),circ(posB),colour['front'],1)
    grid[posB[0]][posB[1]] = 1
}

function hcpath(posA,posB) {
    canvas.draw_arc(circ(posA),circ(posB),canvas.real_origin,colour['front'],1)
    grid[posB[0]][posB[1]] = 1
}

function main() {
    canvas = new draw_area('canvas');
    if (inter) clearInterval(inter);
    form = document.getElementsByName("colour")[0];
    colour = {back:form['wall'].value,front:form['path'].value,node:form['node'].value};
    var grid_max = form['size'].value;
    var row = [];
    grid = [];
    for (var i = 0; i<grid_max; i++) {
	row.push(0)
    }
    for (var i = 0; i<grid_max; i++) {
	grid.push(row.slice())
    }
    row = [];
    canvas.set_grid([grid_max,grid_max]);
    canvas.clear()
    canvas.fill(colour['back']);
    canvas.default_colour(colour['front']);

    if (form['circ'].checked) {
	div = Math.min(grid_max,32)
	console.log(circ([1,1]),circ([1,0]))
    	var row_below = []
    	var col = 1
    	for (var i=1; i<grid_max-1; i+=2) {row_below.push(i/2)}
    	inter= setInterval (function () {
    	    var row = row_below
    	    row_below = cellers(row,col)
    	    col += 2
    	    if (col > grid_max-3) {clearInterval(inter);
    				   // for(var i=1; i<4; i++) path([grid_max-i,grid_max-3-(grid_max%2)]);
    				   CleanMap();
    				   return}
    	},2);
    }
    else {
	path([0,1])
	switch (form['algor'].value) {
	case 'RT':
    	    var possible = [new Point([1,1],2)];
    	    for (var i in possible) {canvas.draw_dot(possible[i].p,colour['node']);}
    	    inter= setInterval (function () {
    		RT(possible)
    		if (!possible.length > 0) {clearInterval(inter);
    					   for(var i=1; i<4; i++) path([grid_max-i,grid_max-3]);
    					   CleanMap();
    					   return}
    	    },0);
    	    break;
	case 'Ellers':
	    vprob = form['vprob'].value
	    hprob = form['hprob'].value
    	    var row_below = []
    	    var col = 1
    	    for (var i=1; i<grid_max-1; i+=2) {row_below.push(i/2)}
    	    inter= setInterval (function () {
    		var row = row_below
    		row_below = ellers(row,col)
    		col += 2
    		if (col > grid_max-3) {clearInterval(inter);
    				       for(var i=1; i<4; i++) path([grid_max-i,grid_max-3-(grid_max%2)]);
    				       CleanMap();
    				       return}
    	    },2);
    	    break;
	}
    }
}
