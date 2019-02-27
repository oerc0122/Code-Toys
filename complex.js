
function complex(real,imag) {
    this.real = Number(real);
    this.imag = Number(imag);
    if (isNaN(this.real) || isNaN(this.imag)) {throw new Error("Bad complex number "+real.toString()+"+"+imag.toString()+"i")};
}


function cmplx (a) {
    if (a instanceof complex) {}
    else if (a.constructor === String) {
	if (a == "i") return new complex(0,1);
	console.log(a)
	var b;
	return new complex((b=a.match(/[+-]?[0-9.]+(?!i)/))[0]?b:0,(b = a.match(/[+-]?[0-9.]+(?=i)/)[0]?b:0));
    }
    else if (a.constructor === Number) {a = new complex(a,0)}
    else if (a.constructor === Array && a.length == 2) {a = new complex(a[0],a[1])}
    return a;
}

function real(N) {if (N instanceof complex) {if (N.imag == 0) {return N.real} else {console.log('Losing imaginary component!')}} else if (N.constructor === Number) {return N}}

function cmpnorm2(A) {return new complex(A.real*A.real + A.imag*A.imag,0)}
function cmpmag(A) {return new complex(Math.sqrt(A.norm2()),0)}
function cmparg(A,rtod) {return new complex(rtod?Math.atan(A.imag/A.real)*57.2958:Math.atan(A.imag/A.real),0)}
function cmpabs(A) {return new complex(Math.abs(A.real),Math.abs(A.imag))}
function cmpadd(A,B){return new complex(A.real+B.real,A.imag+B.imag)}
function cmpsub(A,B){return new complex(A.real-B.real,A.imag-B.imag)}
function cmpsign(A) {return new complex(-A.real,-A.imag)}
function cmpcosh(A) {return new complex(Math.cosh(A.real)*Math.cos(A.imag)-Math.cosh(A.real)*Math.sin(A.imag),0.)}
function cmpsinh(A) {return new complex(Math.sinh(A.real)*Math.cos(A.imag),Math.cosh(A.real)*Math.sin(A.imag))}
function cmpconj(A) {return new complex(A.real,-A.imag)}
function cmptimes(A,B){return new complex(A.real*B.real-A.imag*B.imag,A.real*B.imag+A.imag*B.real)}
function cmpdiv(A,B){return new complex((A.real*B.real + A.imag*B.imag)/B.norm2(), (A.imag*B.real - A.real*B.imag)/B.norm2())}
function cmppow(A,N){
    if (N.constructor === Number || N.constructore === String) {N = cmplx(N)}
    else if (N instanceof complex) {}
    else {throw new Error('Non-numbers not handled')};
    if (A.mag() == 0) return new complex(0,0);
    else if (N.imag == 0 && N.real == Math.round(N.real)) {
	var tmp = new complex(A.real, A.imag);
	for (;N.real > 1;N.real --) {
	    tmp = tmp.times(A);
	}
	return tmp;
    }
    var tmp=Math.log(A.mag());
    return new complex(N.real*tmp - N.imag*A.arg(), N.imag*tmp + A.arg()*N.real).exp()
}
function cmpcos(A) {return new complex(Math.cos(A.real)*Math.cosh(A.imag),-Math.sin(A.real)*Math.sinh(A.imag))}
function cmpsin(A) {return new complex(Math.sin(A.real)*Math.cosh(A.imag),Math.cos(A.real)*Math.sinh(A.imag))}
function cmptan(A) {return cmpsin(A)/cmpcos(A)}
function cmpexp(A) {return new complex(Math.exp(A.real) * Math.cos(A.imag), Math.exp(A.real) * Math.sin(A.imag))}
function cmpln(A) {return new complex(0.5*Math.log(A.norm2()),A.arg())}
function cmpsqrt(A) {return cmppow(A,0.5)}
function isReal(A) {return (A.imag < 0.0000001)}
function isRealInt(A) {return (A.isReal() && A.real == Math.round(A.real))}


function cmpgam(A) {
    var y=new complex(0,0),z = cmplx(A)
    if (z.isRealInt()) {y=1; z.real--;for(;z.real>0;z.real--){y*=z.real}; return y}
    var pi = cmplx(Math.PI);
    var p = [676.5203681218851
	     ,-1259.1392167224028
	     ,771.32342877765313
	     ,-176.61502916214059
	     ,12.507343278686905
	     ,-0.13857109526572012
	     ,9.9843695780195716e-6
	     ,1.5056327351493116e-7
	    ];
    if (z.real < 0.5) {y = pi.times(z).sin(); y = y.times(cmpgam(cmplx(1).sub(z)));return y};
    z.real--;
    x = new complex(0.99999999999980993,0);
    for (var i in p)
	x = x.add(cmplx(p[i]).div(z.add(new complex(1,1))));
    t = cmpadd(z,cmplx(p.length-0.5));
    y = cmplx(2*Math.PI).times(t.pow(z.add(cmplx(0.5)))).times(t.sign().exp()).times(x);
    return y;
}

// def gamma(z):
//     z = complex(z)
//     if z.real < 0.5:
//         y = pi / (sin(pi*z) * gamma(1-z)) ### Reflection formula 
//     else:
//         z -= 1
//         x = 0.99999999999980993
//         for (i, pval) in enumerate(p):
//             x += pval / (z+i+1)
//         t = z + len(p) - 0.5
//         y = sqrt(2*pi) * t**(z+0.5) * exp(-t) * x
//     return drop_imag(y)

complex.prototype = {
    cosh :function() {return cmpcosh(this)},
    sinh :function() {return cmpsinh(this)},
    norm2:function() {return cmpnorm2(this).real},
    arg  :function(rtod) {return cmparg(this,rtod).real},
    abs  :function() {return cmpabs(this)},
    add  :function(B){return cmpadd(this,B)},
    sub  :function(B){return cmpsub(this,B)},
    sign :function() {return cmpsign(this)},
    conj :function() {return cmpconj(this)},
    times:function(B){return cmptimes(this,B)},
    div  :function(B){return cmpdiv(this,B)},
    pow  :function(N){return cmppow(this,N)},
    cos  :function() {return cmpcos(this)},
    sin  :function() {return cmpsin(this)},
    tan  :function() {return cmptan(this)},
    ln   :function() {return cmplog(this)},
    exp  :function() {return cmpexp(this)},
    mag  :function() {return cmpmag(this).real},
    sqrt :function() {return cmpsqrt(this)},
    gam  :function() {return cmpgam(this)},
    isReal:function() {return isReal(this)},
    isRealInt:function() {return isRealInt(this)},
    nul  :function() {return this}
}
