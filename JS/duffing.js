"use strict";

var A = 1.*Math.random();
var B = 1.*Math.random();
var C = 0.5*Math.random();
var D = (50.*Math.random() + 3.);

// var A = 0.;
// var B = -3.;
// var C = 0.3;
// var D = 5.5;
// var h = 0.01;

var h = 0.01;
while (true) {
    var per = Math.floor(750.0*Math.random()) + 250;
    // var per = 1./2.*Math.PI
    var omega = (Math.PI*2.)/(h*per);
    if (per && omega) break;
}


function f2 (x,v,t) {
    return -A*Math.pow(x,3) + B*x - C*v + D*Math.sin(omega*t);
}

function f1(x,v,t) {
    return v;
}

function rk2_1(x,v,t,h) {
    var k11 = h * f1(x,v,t);
    var k22 = h * f2(x,v,t);
    var k1  = h * f1(x + k11, v + k22, t + h);
    var k2  = h * f2(x + k11, v + k22, t + h);

    x +=(k11 + k1)/2.0;
    v +=(k22 + k2)/2.0;
    t +=h;
    return [x,v,t];
}

function draw(ctx,x,v) { 
    var canvas = document.getElementById('canvas');
    var size = [canvas.width/2,canvas.height];
    var centre = [size[0]/2,size[1]/2];
    var draw = [Math.min((x*50.)+centre[0],size[0]),Math.min((v*-1.*50.)+centre[1],size[1])];

    ctx.fillStyle="#000000";
    
    ctx.fillRect(draw[0],draw[1],1,1);

}

function draw_poincare(ctx,prev) {
    var canvas = document.getElementById('canvas');
    var size = [canvas.width,canvas.height];
    var centre = [3*size[0]/4,size[1]/2];

    const colour = ["#FF0000","#00AA00","#0000FF","#000000"];
    for (var i = 0;i < 4; i++){
	if (prev[i]){
	    var draw = [Math.min((prev[i][0]*50.)+centre[0],size[0]),Math.min((prev[i][1]*-1.*50.)+centre[1],size[1])];
	    ctx.clearRect(draw[0]-1,draw[1]-1,3,3);
	    ctx.fillStyle= colour[i];
	    ctx.fillRect(draw[0]-1,draw[1]-1,3,3);
	}
    }
}

function main() {
    var canvas = document.getElementById('canvas');
    if (!(canvas.getContext)) return;
    var size = [canvas.width,canvas.height];
    var centre = [[size[0]/4,size[1]/2],[3*size[0]/4.,size[1]/2]];
    var ctx = canvas.getContext('2d');

    ctx.moveTo(0,centre[0][1]);
    ctx.lineTo(size[0],centre[0][1]);
    ctx.moveTo(centre[0][0],0);
    ctx.lineTo(centre[0][0],size[1]);
    ctx.moveTo(centre[1][0],0);
    ctx.lineTo(centre[1][0],size[1]);
    ctx.stroke();


    var x = 2.;
    var v = 2.;
    var t = 0.;
    var i = 0;
    var prev = [[size[0],size[0]],[size[0],size[0]],[size[0],size[0]]];
    var n = 0;
    console.log(x,v)
    console.log(A,B,C,D,per,omega)

    setInterval (function () {
	i++;
	var out = rk2_1(x,v,t,h);
	x = out[0];
	v = out[1];
	t += h;
	draw(ctx,x,v);
	if (i%per == 0) {
	    prev.shift();
	    prev.push([x,v]);
	    draw_poincare(ctx,prev);
	}
    }, 2)

}
