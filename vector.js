
function calcmag(vec) {
    var out = 0;
    for (var i=0; i<vec.len; i++) {
	out += vec.vals[i]*vec.vals[i];
    }
    return out;
}

function calcunit(vec) {
    var out = [];
    for (var i=0; i<vec.len; i++) {
	out.append(vec.vals[i]/vec.mag);
    }
    return new vector(out);
}

function vector(vals) {
    this.vals = vals;
    this.len = vals.length;
    if (this.len <= 3) {
	this[0] = this.x = vals[0];
	this[1]	= this.y = vals[1];
    }
    if (this.len == 3) {
	this[2] = this.z = vals[2];
    }
    this.mag2 = calcmag(this);
    this.mag = Math.sqrt(this.mag2);
}

function recalc() {
    this.mag2 = calcmag(this);
    this.mag = Math.sqrt(this.mag2);
}    

function vectoarray(a) {
    return a.vals;
}

function veccheck (a,b) {
    if (a.len != b.len) return true;
    return false;
}

function vecmul (a,b) {
    var out = [];
    if (b instanceof vector) {
	if (veccheck(a,b)) return NaN;
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] * b.vals[i]);
	}
    } else {
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] * b);
	}
    }
    return new vector(out);
}

function toInt (a) {
    var out = [];
    for (var i=0; i<a.len; i++) {
	out.push(Math.floor(a.vals[i]));
    }
    return new vector(out);
}

function vecadd (a,b) {
    var out = [];
    if (b instanceof vector) {
	if (veccheck(a,b)) return NaN;
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] + b.vals[i]);
	}
    } else {
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] + b);
	}
    }
    return new vector(out);
}

function vecdiv (a,b) {
    if (b instanceof vector) return NaN;
    var out = [];
    for (var i=0; i<a.len; i++) {
	out.push(a.vals[i] / b);
    }
    return new vector(out);
}

function vecmod (a,b) {
    var out = [];
    if (b instanceof vector) {
	if (veccheck(a,b)) return NaN;
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] % b.vals[i]);
	}
    } else {
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] % b);
	}
    }
    return new vector(out);
}

function vecsub (a,b) {
    var out = []
    if (b instanceof vector) {
	if (veccheck(a,b)) return NaN;
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] - b.vals[i]);
	}
    } else {
	for (var i=0; i<a.len; i++) {
	    out.push(a.vals[i] - b);
	}
    }
    return new vector(out);
}

function vecneg (a) {
    out = a.vals.map(function(e){return -e;});
    return new vector(out);
}

function vecdot (a,b) {
    if (veccheck(a,b)) return NaN;
    var out = 0;
    for (var i=0; i<a.len; i++) {
	out += a.vals[i]*b.vals[i];
    }
    return out;
}

function veccross (a,b) {
    if (a.check(b) && a.len != 3) return NaN;
    var out = [];
    out.push(a.vals[2] * b.vals[3] - a.vals[3] * b.vals[2]);
    out.push(a.vals[3] * b.vals[1] - a.vals[1] * b.vals[3]);
    out.push(a.vals[1] * b.vals[2] - a.vals[2] * b.vals[1]);
    return new vector(out);
}

function veccycle(a,b) {
    if (a.len!=b.length) return NaN;
    var out = [];
    for (var i=0; i<a.len; i++) {
	out.push((a.vals[i]+b[i])%b[i]);
    }
    return new vector(out);
}

vector.prototype = {
    check:    function()  {return veccheck(this,b)},
    toInt:    function()  {return toInt(this)},
    toArray:  function()  {return this.vals},
    toString: function()  {return "("+this.vals.join(',')+")"},
    recalc:   function()  {return recalc(this)},
    neg:      function()  {return vecneg(this)},
    mul:      function(b) {return vecmul(this,b)},
    add:      function(b) {return vecadd(this,b)},
    div:      function(b) {return vecdiv(this,b)},
    mod:      function(b) {return vecmod(this,b)},
    sub:      function(b) {return vecsub(this,b)},
    dot:      function(b) {return vecdot(this,b)},
    cross:    function(b) {return veccross(this,b)},
    cycle:    function(b) {return veccycle(this,b)}
}
