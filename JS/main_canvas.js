function draw_area(name) {
    this.canvas_name = name;
    this.canvas = document.getElementById(name);
    if (!(this.canvas.getContext)) throw new Error("Canvas not functioning correctly");
    this.ctx = this.canvas.getContext('2d');
    this.size =   [this.canvas.width,this.canvas.height];
    this.origin = [this.size[0]/2,this.size[1]/2];
    this.real_size = this.size;
    this.spacing = [1,1]; // Size of 1 grid in pixels
    this.real_origin = this.origin;
    this.clickable = false;
    this.subareas = {};
    this.upperleft = [0,0];
    this.min = [0,0];
    this.colour_cycle = false;
    this.cycle_freq = 0;
}


draw_area.prototype.resize = function () {
    this.size =   [this.canvas.width,this.canvas.height];
    this.origin = [this.size[0]/2,this.size[1]/2];
    this.real_size = this.size;
    this.spacing = [1,1]; // Size of 1 grid in pixels
    this.real_origin = this.origin;
}

// Grid control

draw_area.prototype.recalc_properties = function() {
    this.origin = [this.subareas[name].upperleft + this.subareas[name].size[0]/2,this.subareas[name].upperleft + this.subareas[name].size[1]/2];
    this.real_size = this.subareas[name].size;
}

draw_area.prototype.sub_area = function(name,area) {
    this.subareas[name] = new draw_area(this.canvas_name);
    var int_area = order_pos(area);
    this.subareas[name].size = [area[1][0] - area[0][0], area[1][1] - area[0][1]];
    this.subareas[name].upperleft = area[0];
    this.subareas[name].recalc_properties();
}

draw_area.prototype.scale = function (input) {
    return [this.upperleft[0] + (input[0]-this.min[0])*this.spacing[0], this.upperleft[1] + (input[1]-this.min[1])*this.spacing[1]];
}

draw_area.prototype.unscale = function (input) {
    return [(input[0]-this.upperleft[0])/this.spacing[0]+this.min[0], (input[1]-this.upperleft[1])/this.spacing[1]+this.min[1]];
}

draw_area.prototype.set_grid = function(grid_size) {
    // Set size based on grid squares
    this.spacing = [this.size[0]/grid_size[0],this.size[1]/grid_size[1]];
    this.real_origin = [grid_size[0]/2,grid_size[1]/2];
    this.real_size = grid_size;
    this.min = [0,0];
    return;
}

draw_area.prototype.set_range = function(range) {
    // Set size based on ranges of x & y
    this.real_size = [Math.abs(range[1][0]-range[0][0]), Math.abs(range[1][1]-range[0][1])];
    this.min = [Math.min(range[1][0],range[0][0]), Math.min(range[1][1],range[0][1])];
    this.spacing = [this.size[0]/this.real_size[0],this.size[1]/this.real_size[1]];
    this.real_origin = [this.min[0] + this.real_size[0]/2 ,this.min[1] + this.real_size[1]/2];
    return;
}

draw_area.prototype.set_near_real_size = function (in_real_size) {
    // Set to be real size per pixel
    var real_size = [this.size[0]/in_real_size[0] >>> 0,this.size[1]/in_real_size[1] >>> 0];
    if (real_size === undefined) {
	this.real_size = this.size;
    } else {
	this.real_size = real_size;
    }
    this.real_origin = [];
    this.spacing = [];
    for (var i=0; i<2; i++) {
	this.spacing.push(this.size[i]/this.real_size[i]);
    }
    this.real_origin = this.scale(this.origin);
    this.min = [0,0];
    return;
}

draw_area.prototype.set_real_size = function (in_real_size) {
    // Set to be real size per pixel
    var real_size = [this.size[0]/in_real_size[0],this.size[1]/in_real_size[1]];
    if (real_size === undefined) {
	this.real_size = this.size;
    } else {
	this.real_size = real_size;
    }
    this.real_origin = [];
    this.spacing = [];
    for (var i=0; i<2; i++) {
	this.spacing.push(this.size[i]/this.real_size[i]);
    }
    this.real_origin = this.scale(this.origin);
    this.min = [0,0];
    return;
}

draw_area.prototype.set_min = function (min) {
    this.min = min;
}

draw_area.prototype.centre_pixel = function (pos,size) {
    if (size === undefined) size = [0,0];
    var out = [];
    out[0] = pos[0] + ((this.spacing[0]-size[0])/2.);
    out[1] = pos[1] + ((this.spacing[1]-size[1])/2.);
    return out;
}

// Colour control

draw_area.prototype.defCol = function(colour) {
    if (colour === undefined) colour = this.colour();
    if (colour === undefined) colour = '#FFFFFF';
    this.ctx.fillStyle = colour;
    this.ctx.strokeStyle = colour;
}

draw_area.prototype.colour_at_point = function (pos, raw) {
    gpos = this.scale(pos);
    gpos = this.centre_pixel(gpos,[0,0]);
    var c = this.ctx.getImageData(gpos[0],gpos[1],1,1).data;
    if (raw) return c;
    return rgb_to_colour(c[0],c[1],c[2]);
}

draw_area.prototype.default_colour = function (colour) {
    this.colour_val = colour;
}

draw_area.prototype.next_col = function() {
    this.i++;
    if (this.colour_list) {return this.colour_list[this.i%this.colour_list.length]};
    return rgb_to_colour(Math.floor(Math.sin(this.frequency*this.i + 0) * 127 + 128),
			    Math.floor(Math.sin(this.frequency*this.i + 2) * 127 + 128),
			    Math.floor(Math.sin(this.frequency*this.i + 4) * 127 + 128));
}

draw_area.prototype.rainbow = function (freq) {
    this.colour_cycle = !this.colour_cycle;
    if (this.colour_cycle) {
	this.frequency = freq;
	this.i = 0;
    } else {
	this.colour_val = undefined;
    }
}

draw_area.prototype.colour = function() {
    if (this.colour_cycle) this.colour_val = this.next_col();
    return this.colour_val;
}

draw_area.prototype.set_colour_range = function(col, ncolour) {
    var step = ncolour / (col.length-1),j=0;
    this.colour_list = [];
    this.i = 0;
    this.colour_cycle= true;
    for (var i = 0;i<col.length-1;i++) {
	var from=colour_to_rgb(col[i]);
	var to=colour_to_rgb(col[i+1]);
	var frequency=[(to[0]-from[0])/step,(to[1]-from[1])/step,(to[2]-from[2])/step];
	for (var iter = 0; iter < step; iter++,j++) {
	    this.colour_list.push(rgb_to_colour(
		Math.floor(from[0]+iter*frequency[0]),
		Math.floor(from[1]+iter*frequency[1]),
		Math.floor(from[2]+iter*frequency[2])
	    ));
	}
    }
}

draw_area.prototype.set_colour_list = function(list) {
    this.i = 0;
    if (list == undefined) {this.colour_cycle = false;this.colour_list=list; return};
    list_in = typeof list=="String"?[list]:list;
    if (! list_in.every(x => {return x.match(/^#[0-9A-Fa-f]{6}$/)})) {throw new Error('Bad colour in colour list '+list_in)}
    this.colour_list = list_in;
    this.colour_cycle= true;
}

function colour_to_hsv(colour) {
    var tmp = colour_to_rgb(colour);
    return rgb_to_hsv(tmp[0],tmp[1],tmp[2]);
}

function hsv_to_colour(h,s,v) {
    var tmp = hsv_to_rgb(h,s,v);
    return rgb_to_colour(tmp[0],tmp[1],tmp[2]);
}

function rgb_to_hsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsv_to_rgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r, g, b].map(x=>{return Math.round(x*255)});
}

function byte2Hex(n){
    var value = n.toString(16);
    return "00".substring(value.length) + value;
}

function rgb_to_colour(r,g,b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function colour_to_rgb(colour) {
    return [parseInt(colour.slice(1,3),16),parseInt(colour.slice(3,5),16),parseInt(colour.slice(5,7),16)];
}

// Basic Shape Drawing

draw_area.prototype.draw_dot = function (pos, colour, size, nocentre) {
    if (size === undefined) size = this.spacing;
    var gpos = this.scale(pos);
    if (nocentre != 1) gpos = this.centre_pixel(gpos,size);
    if ((colour === undefined && this.colour_val === undefined) || colour == '#FFFFFF') {
	this.ctx.clearRect(gpos[0],gpos[1],size[0],size[1]);
    } else {
	this.defCol(colour);
	this.ctx.fillRect(gpos[0],gpos[1],size[0],size[1]);
    }
    return;
}

draw_area.prototype.draw_image = function(pos,image,size) {
    if (size === undefined) size = this.spacing;
    var gpos = this.scale(pos);
    gpos = this.centre_pixel(gpos,size);
    this.ctx.drawImage(image,gpos[0],gpos[1],size[0],size[1]);
}

draw_area.prototype.draw_line = function (from_in, to_in, colour, thickness) {
    if (thickness === undefined) thickness = 1;
    var from = this.scale(from_in);
    var to = this.scale(to_in);
    from = this.centre_pixel(from,[thickness,thickness]);
    to = this.centre_pixel(to,[thickness,thickness]);
    this.defCol(colour);
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.moveTo(from[0],from[1]);
    this.ctx.lineTo(to[0],to[1]);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
    return;
}

draw_area.prototype.draw_square = function(from_in,to_in,colour,thickness,fill) {
    this.defCol(colour);
    var from = this.scale(from_in);
    var to = this.scale(to_in);
    if (thickness === undefined) thickness = 1;
    this.ctx.lineWidth = thickness;
    this.ctx.rect(from[0],from[1],to[0],to[1]);
        if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;
}

draw_area.prototype.draw_poly = function(vertex_in,colour,thickness,fill) {
    this.defCol(colour);
    var vertex = [];
    for (var i in vertex_in) {vertex[i] = this.scale(vertex_in[i])}
    if (thickness === undefined) thickness = 1;
    this.ctx.lineWidth = thickness;
    this.ctx.moveTo(vertex[0][0],vertex[0][1]);
    this.ctx.beginPath();
    for (var i in vertex) {this.ctx.lineTo(vertex[i][0],vertex[i][1])}
    this.ctx.closePath();
    if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;
}

draw_area.prototype.draw_q_circ = function (from_in, to_in, conv, colour, thickness, fill) {
    this.defCol(colour);
    var from = this.scale(from_in);
    var to = this.scale(to_in);
    if (conv) {var cen = [Math.max(from[0],to[0]),Math.max(from[1],to[1])]}
    else {var cen = [Math.min(from[0],to[0]),Math.min(from[1],to[1])]}
    var r = Math.max(Math.abs(to[1]-cen[1]),Math.abs(to[0]-cen[0]));
    if (thickness === undefined) thickness = 1;
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.moveTo(from[0],from[1]);
    this.ctx.arcTo(cen[0],cen[1],to[0],to[1],r);
    if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;

}

draw_area.prototype.draw_arc = function (from_in, to_in, cen, colour, thickness, fill) {
    this.defCol(colour);
    if (thickness === undefined) thickness = 1;
    var from = this.scale(from_in);
    var to = this.scale(to_in);
    var cen = this.scale(cen);
    from = this.centre_pixel(from,[thickness,thickness]);
    to = this.centre_pixel(to,[thickness,thickness]);
    start = Math.atan((from[1]-cen[1])/(from[0]-cen[0]));
    if (start == 0) {start= 1/start>0?0:Math.PI}
    end = Math.atan(Math.abs(to[1]-cen[1])/(to[0]-cen[0]));
    if (end == 0) {end= 1/end>0?0:Math.PI}
    rad = Math.sqrt(Math.pow(cen[0]-from[0],2) + Math.pow(cen[1]-from[1],2));
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.arc(cen[0],cen[1],rad,start,end);
    if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;
}

draw_area.prototype.draw_s_circ = function (from_in, to_in, colour, thickness, fill) {
    this.defCol(colour);
    var from = this.scale(from_in);
    var to = this.scale(to_in);
    var cen = [];
    var rad;
    cen[0] = (from[0] + to[0])/2;
    cen[1] = (from[1] + to[1])/2;
    start = Math.atan((from[1]-cen[1])/(from[0]-cen[0]));
    rad = Math.sqrt(Math.pow(cen[0]-from[0],2) + Math.pow(cen[1]-from[1],2));
    if (thickness === undefined) thickness = 1;
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    if (from[0] > to[0] || (from[0] == to[0] && from[1] > to[1])) {  // Differentiate positive and negative 0s
	this.ctx.arc(cen[0],cen[1],rad,start,start+Math.PI);
    } else {
	this.ctx.arc(cen[0],cen[1],rad,start+Math.PI,start);
    }
    if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;
}

draw_area.prototype.draw_circ = function (centre_in, rad, colour, thickness, fill) {
    this.defCol(colour);
    if (rad === undefined) rad = Math.min(this.spacing[0],this.spacing[1])/2;
    var cen = this.scale(centre_in);
    if (thickness === undefined) thickness = 1;
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.arc(cen[0],cen[1],rad,0,2*Math.PI);
    if (fill) {
	this.ctx.fill();
    } else {
	this.ctx.stroke();
    }
    this.ctx.lineWidth = 1;
}

draw_area.prototype.draw_overlay = function(data,colour,transparency) {
    if (data.length != this.real_size[0] || data[0].length != this.real_size[1]) return false;
    if (colour === undefined) colour = this.colour();
    if (colour === undefined) return false;
    if (transparency === undefined) {
	transparency = 1.;
    }  else {
	maxmin = data.maxmin();
	var scale = transparency/(maxmin.max-maxmin.min);
    }

    for (var i = 0; i < this.real_size[0]; i++) {
	for (var j = 0; j < this.real_size[1]; j++) {
	    this.ctx.globalAlpha = (data[i][j] - maxmin.min)*scale;
	    this.draw_dot([i,j],colour);
	}
    }
    this.ctx.global_transparency = 1.;
}

draw_area.prototype.fill = function (colour) {
    this.defCol(colour);
    this.ctx.fillRect(0,0,this.size[0],this.size[1]);
    return;
}

draw_area.prototype.clear = function () {
    this.ctx.clearRect(0,0,this.size[0],this.size[1]);
    return;
}

// Mouse control

draw_area.prototype.set_interactive = function (op, set) {
    var pos = [];
    if (set !== undefined && (set && this.clickable || !set && !this.clickable)) {return;}
    function md(evt) {pos[0] = get_clicked_pixel(evt,this);}
    function mu(evt) {pos[1] = get_clicked_pixel(evt,this); pos = order_pos(pos); this.clicked=true;if(op){op.func(pos,op.args);}}
    if (this.clickable) {
	this.clickable = false;
	this.clicked = false;
	this.canvas.removeEventListener('mousedown',md);
	this.canvas.removeEventListener('mouseup',mu);
    } else {
	this.clickable = true;
	this.canvas.addEventListener('mousedown', md, false);
	this.canvas.addEventListener('mouseup', mu, false);
    }
}


draw_area.prototype.set_download = function (DLObj, name) {
    if (name === undefined) name = 'download.png';
    DLObj.download = name;
    da = this.canvas
    function putimage(evt) {
	DLObj.href = da.toDataURL();
    }
    putimage();
    DLObj.addEventListener('click',putimage,false);
}

function order_pos (pos) {
    var out_pos = [];
    out_pos.push([Math.min(pos[0][0],pos[1][0]),Math.min(pos[0][1],pos[1][1])]);
    out_pos.push([Math.max(pos[0][0],pos[1][0]),Math.max(pos[0][1],pos[1][1])]);
    return out_pos;
}

function get_clicked_pixel (evt,canvas) {
    var rect = canvas.getBoundingClientRect();
    var pos = [];
    pos[0] = (evt.clientX-rect.left)*canvas.width/(rect.right -rect.left) >>> 0;
    pos[1] = (evt.clientY-rect.top )*canvas.height/(rect.bottom-rect.top ) >>> 0;
    return pos;
}
