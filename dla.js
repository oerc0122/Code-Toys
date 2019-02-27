function createArray(length) {
    var arr = new Array(length || 0), i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    
    return arr;
}

function particle(r,origin){
    var angle = 2.0 * Math.PI * Math.random();
    this.origin = origin
    this.pos = [Math.floor(r*Math.sin(angle)) + this.origin[0],Math.floor(r*Math.cos(angle)) + this.origin[1]];
}

particle.prototype = {
    move(){
	var rand= Math.floor(4.*Math.random())+1;
	this.pos[rand%2]+=(Math.ceil(rand/2)==1)?-1:1;
    },
    dist(){
	return Math.sqrt(Math.pow((this.pos[0] - this.origin[0]),2) + Math.pow((this.pos[1] - this.origin[1]),2));
    }
}

function stick(canvas,grid,pos) {
    canvas.draw_dot(pos)
    for (var j=-1;j<=1;j+=2) {
	grid[pos[0]+j][pos[1]]=1; 
	grid[pos[0]][pos[1]+j]=1;
    }
}

function main() {
    var canvas = new draw_area('canvas');
    var grid_max = 300
    canvas.set_grid([grid_max,grid_max]);
    canvas.default_colour('#000000')
//    canvas.rainbow(10.)
    var grid = createArray(grid_max,grid_max);
    stick(canvas,grid,canvas.real_origin);
    var r_spawn = 3., r_kill = 5., r_clus = 0.; 

    var inter = setInterval ( function() {
	part = new particle(r_spawn,canvas.real_origin);
	for (var j=0;j<=50000;j++) {
	    part.move()
	    if (grid[part.pos[0]][part.pos[1]]) {
		stick(canvas,grid,part.pos); 
		r_clus=Math.max(part.dist(),r_clus);
		r_spawn=r_clus+3.;
		r_kill=r_clus+5.;
		break;
	    }
	    if (part.dist() > r_kill) break;
	}
	if (r_kill > grid_max/2-1) {clearInterval(inter);}
    }, 2)

}
