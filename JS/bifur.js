var canvas;
var vars = new variables();

function variables () {
    this.range = [2.5,4.];
    this.steps = 1500;
    this.step  = (this.range[1]-this.range[0])/this.steps
    this.axis  = [0.,1.];
    this.const = [];
    this.vars = [];
    this.indep = 0.;
    this.init  = 0.6;
    this.iters = 1000;
    this.sample= 1000;
}

function load () {
    canvas = new draw_area('canvas');
    canvas.default_colour('#0000FF')
}

function run () {
    canvas.clear()
    canvas.set_range([
	[vars.range[0],vars.axis[0]],
	[vars.range[1],vars.axis[1]]
    ]);
    vars.indep=vars.range[0]; 
    var inter = setInterval(function(){
	vars.indep+=vars.step;
	if (vars.indep>=vars.range[1]) {
	    clearInterval(inter);
	    console.log('Done');
	}
	vars.vars = vars.init
	iter(logistic_map, vars.vars, vars.iters, vars.sample);
    }, 10)

}

function iter (func, variables, iters, sample) {
    for (var iter = 1; iter < vars.iters; iter++) {
	variables = func( vars.indep, variables );
    }
    for (var iter = 1; iter < vars.sample; iter++) {
	variables = func( vars.indep, variables );
	canvas.draw_dot([vars.indep,vars.axis[1]-variables],'#FF0000',[1,1],1)
    }
}

function logistic_map (r, x) {
    return r * x * ( 1. - x );
}

function duffing ( vars, variables ) {
    
}

function rk2(x,v,t,h) {
    var k11 = h * f1(x,v,t);
    var k22 = h * f2(x,v,t);
    var k1  = h * f1(x + k11, v + k22, t + h);
    var k2  = h * f2(x + k11, v + k22, t + h);

    x +=(k11 + k1)/2.0;
    v +=(k22 + k2)/2.0;
    t +=h;
    return [x,v,t];
}

function f2 (x,v,t) {
    return -vars.consts[0]*Math.pow(x,3) + vars.consts[1]*x - vars.consts[2]*v + vars.indep*Math.sin(omega*t);
}

function f1(x,v,t) {
    return v;
}
