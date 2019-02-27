var canvas; // Main canvas
var join_points; // List of points available for joining
var sq_size = [10,10]; //Size of initial square
var dtor=0.0175; // Degree to radians

function band(from,to) {
    in_circ(from,to);
    out_circ(from,to);
}

function out_circ(from,to) {
    canvas.draw_q_circ(from,to,true);
    var min = [Math.min(from[0],to[0]),Math.min(from[1],to[1])];
    var max = [Math.max(from[0],to[0]),Math.max(from[1],to[1])];
    var len = [Math.abs(max[0]-min[0]),Math.abs(max[1]-min[1])];
    for (var i = min[0]; i<=max[0];i++){
	for (var j = min[1]; j<=max[1];j++){
	    var ang = Math.atan(j/i), r=Math.sqrt(((i-min[0])**2 + (j-min[1])**2));
	    var R = len[0]*len[1]/Math.sqrt((len[1]*Math.cos(ang))**2 + (len[0]*Math.sin(ang))**2)
	    if (Math.abs(r - R) < 0.01) {join_points[i][j]={h:true,v:true}}
	    else if (r < R) {join_points[i][j]={h:false,v:false}}
	}
    }
    if (len[0] > len[1]) {join_points[len[0]-len[1]][max[1]] = {v:true}}
    else if (len[1] > len[0]) {join_points[max[0]][len[1]-len[0]] = {h:true}}

    join_points[min[0]][max[1]] = {h:false,v:false};
    join_points[max[0]][min[1]] = {h:false,v:false};
    edge_joins(from,to);
}


function in_circ(from,to) {
    canvas.draw_q_circ(from,to);
    edge_joins(from,to);
}

function tri_out(from,to) {
    var min = [Math.min(from[0],to[0]),Math.min(from[1],to[1])];
    var max = [Math.max(from[0],to[0]),Math.max(from[1],to[1])];
    var len = [Math.abs(to[0]-from[0]),Math.abs(to[1]-from[1])];
    var ang = Math.atan(len[0]/len[1])/dtor
    var ll = [max[0],max[1]];
    var up = [max[0],min[1]];
    var ri = [min[0],max[1]];
    canvas.draw_poly([ll,up,ri]);

    for (var i=min[0]; i<=max[0]; i++) {
	for (var j = min[1]; j<=max[1]; j++) {
	    join_points[i][j]= {h:false,v:false}
	}
    }
    join_points[ll[0]][ll[1]] = {v:true}
    edge_joins(up,ri);
}

function tri_in(from,to) {
    var min = [Math.min(from[0],to[0]),Math.min(from[1],to[1])];
    var max = [Math.max(from[0],to[0]),Math.max(from[1],to[1])];
    var len = [Math.abs(to[0]-from[0]),Math.abs(to[1]-from[1])];
    var ang = Math.atan(len[0]/len[1])/dtor
    var ll = [min[0],min[1]];
    var up = [max[0],min[1]];
    var ri = [min[0],max[1]];
    canvas.draw_poly([ll,up,ri]);

    for (var i=min[0]; i<=max[0]; i++) {
	for (var j = min[1]; j<=max[1]; j++) {
	    
	    if (Math.abs(i - (max[0]-((j-min[1])/Math.tan(ang*dtor)))) < 0.01) {
		join_points[i][j]= {h:true,v:true}
	    } else if (i < max[0]-((j-min[1])/Math.tan(ang*dtor))) {
		join_points[i][j]= {h:false,v:false}
	    }
	}
    }
    join_points[up[0]][up[1]] = {v:true}
    join_points[ri[0]][ri[1]] = {h:true}

    edge_joins(up,ri);
}

function rect(from,to) {
    var min = [Math.min(from[0],to[0]),Math.min(from[1],to[1])];
    var max = [Math.max(from[0],to[0]),Math.max(from[1],to[1])];
    var ll = min;
    var ul = [max[0],min[1]];
    var lr = [min[0],max[1]];
    var ur = max;
    canvas.draw_poly([ll,ul,ur,lr]);
    for (var i=ll[0]; i<=ul[0]; i++) {
	for (var j = ll[1]; j<=lr[1]; j++) {
	    join_points[i][j]= {h:false,v:false};
	}
    }
    join_points[ul[0]][ul[1]] = {h:false, v:true};
    join_points[lr[0]][lr[1]] = {h:true, v:false};
    join_points[ur[0]][ur[1]] = {h:true, v:true};
    edge_joins(ul,lr);
}

function trap(from,to,ang) {
    var min = [Math.min(from[0],to[0]),Math.min(from[1],to[1])];
    var max = [Math.max(from[0],to[0]),Math.max(from[1],to[1])];
    len = [Math.abs(to[0]-from[0]),Math.abs(to[1]-from[1])]
    var ll = min;
    var ul = [max[0],min[1]];
    var lr = [min[0],max[1]];
    if (len[0] > len[1]) {
	var ur = [Math.round(max[0]-(len[1]/Math.tan(ang*dtor))),max[1]];
	var r_ang = -(ur[1]-ul[1])/(ur[0]-ul[0]);
	for (var i=min[0]; i<=max[0]; i++) {
	    for (var j = min[1]; j<=max[1]; j++) {
		var ext = (max[0]-((j-min[1])/r_ang))
		if (Math.abs(i - ext) < 0.05) {
		    join_points[i][j]= {h:true,v:true}
		} else if (i < ext) {
		    join_points[i][j]= {h:false,v:false}
		}
	    }
	}
	
    } else {
	var ur = [max[0],Math.round(max[1]-(len[0]/Math.tan(ang*dtor)))];
	for (var i=min[0]; i<=max[0]; i++) {
	    for (var j = min[1]; j<=max[1]; j++) {
		var r_ang = -(ur[0]-lr[0])/(ur[1]-lr[1]);
		console.log(r_ang)
		var ext = (max[1]-((i-min[0])/r_ang))
		if (Math.abs(j - ext) < 0.05) {
		    join_points[i][j]= {h:true,v:true}
		} else if (j < ext) {
		    join_points[i][j]= {h:false,v:false}
		}
	    }
	}    
    }
    canvas.draw_poly([ll,ul,ur,lr]);

    join_points[ul[0]][ul[1]] = {h:false, v:true};
    join_points[lr[0]][lr[1]] = {h:true, v:false};
    console.log(ur)
    join_points[ur[0]][ur[1]] = {h:true, v:true};
    edge_joins(ul,lr);
}

function edge_joins(a,b) {
    if (a[0] == 0 || b[0] == 0) {
	if (a[0] == 0 && b[0] == 0) {var x = Math.max(a[1],b[1])}
	else {var x = a[0]==0?a[1]:b[1]}
	for (var i = x+1, j=0;j<2&&i<=sq_size[1];i++,j++) {
	    join_points[0][i]?join_points[0][i].h=true:join_points[0][i]={h:true}
	}}
    if (a[1] == 0 || b[1] == 0) {
	if (a[1] == 0 && b[1] == 0) {var x = Math.max(a[0],b[0])}
	else {var x = a[1]==0?a[0]:b[0]}
	for (var i = x+1, j=0;j<2&&i<=sq_size[0];i++,j++) {
	    join_points[i][0]?join_points[i][0].v=true:join_points[i][0]={v:true}
	}}
}


function draw_joins() {
    var colour;
    for (var i=0; i<=10; i++) {
	for (var j=0; j<=10; j++) {
	    if (join_points[i][j] == undefined) {
		colour = '#000000';
	    } else if (join_points[i][j].h == true && join_points[i][j].v == true) {
		colour = '#00AA00';
	    } else if (join_points[i][j].h == true) {
		colour = '#00AAAA';
	    } else if (join_points[i][j].v == true) {
		colour = '#0000AA';
	    } else {
		colour = '#000000';
	    }
	    canvas.draw_dot([i-0.5,j-0.5],colour,[5,5]);
	}
    }

}

function trick() {
    document.getElementById('butt').innerHTML = "Tricked you";
}

function main() {
    canvas = new draw_area('canvas');

    join_points = []
    for (var i=0; i<=sq_size[0]; i++) {
	join_points[i] = []
	if (i > 0 && i <= 3) { join_points[i][0] = {v:true}}
	for (var j=1; j<=3; j++) {
	    join_points[0][j] = {h:true};
	}
    }

    canvas.set_grid(sq_size);
    canvas.draw_square([0,0],sq_size);
    trap([0,8],[4,0],60)
    out_circ([8,0],[4,2])
    draw_joins();
    
}
