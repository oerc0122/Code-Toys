var inter;
var canvas;
var h = 0.01;

function spiral(wheel,t) {

    var X = 0.;
    var Y = 0.;
    
    for (var i=0;i<wheel.length-1;i++) {
	var ang = (50*t/wheel[i]);
	var a = (wheel[i]+wheel[i+1]);
	X += a*Math.sin(ang);
	Y += a*Math.cos(ang);
    }
    X+=wheel[wheel.length-1]*Math.sin(50*t/wheel[wheel.length-1])
    Y+=wheel[wheel.length-1]*Math.cos(50*t/wheel[wheel.length-1])
    return [X+canvas.origin[0],Y+canvas.origin[1]];

}

function add_rule(forms,str_in) {
    var newdiv = document.createElement("input");
    newdiv.type="text";
    newdiv.name=str_in;
    newdiv.addEventListener("change",rerun);
    forms.appendChild(newdiv);
    var newdiv = document.createElement("div");
    forms.appendChild(newdiv);
}

function add_selection(wheel) {
    if (wheel == undefined) wheel = 0
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length;
    if (i > 20) return;
    add_rule(forms,"wheel"+i);
   
    forms['wheel'+i].value = wheel;

}

function remove_selection() {
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length-1;
    console.log(forms,i);
    forms["wheel"+i].parentNode.removeChild(forms["wheel"+i]);
    console.log(forms);
}


function formeval(str,def) {
    return isNaN(Number(str)) ?  def : Number(str);
}


function read_form(restart) {
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length;
    wheel=[];
    for (var w=0; w < i; w++) {
	if (restart) {forms["wheel"+w].value = "random"}
	wheel.push(formeval(forms["wheel"+w].value,100*Math.random()));
    }
}

function sync_form() {
    var forms = document.forms['ops'];
    var i = Object.keys(forms).length;
    for (var w=0; w < i; w++) {
	forms["wheel"+w].value = wheel[w];
    }
}

function stop() {
    clearInterval(inter);
}

function rerun(restart) {
    
    clearInterval(inter);
    var colour = hsv_to_rgb(Math.random(),0.5,0.5)
    colour = rgb_to_colour(colour[0],colour[1],colour[2]);
    canvas.default_colour(colour);
    read_form(restart);
    sync_form();
    var out = spiral(wheel,t);
    var prev= out

    canvas.clear();
    canvas.ctx.moveTo(out[0],out[1]);
    var t = 0.;

    inter = setInterval (function () {
	for (var i=1; i <=50; i++) {
	    out = spiral(wheel,t);
	    t += h;
	    canvas.draw_line(prev,out);
	    prev= out;
	}
    }, 20)
}

function main() {
    canvas = new draw_area('canvas');
    var colour = hsv_to_rgb(Math.random(),0.5,0.5)
    colour = rgb_to_colour(colour[0],colour[1],colour[2]);
    canvas.default_colour(colour);

    wheel = [100*Math.random(),100*Math.random()];
    for (var i=0;i<wheel.length;i++) {add_selection(wheel[i])}
    var t = 0.;
    var out = spiral(wheel,t);
    var prev= out
    inter = setInterval (function () {
    	for (var i=1; i <=50; i++) {
    	    out = spiral(wheel,t);
    	    t += h;
    	    canvas.draw_line(prev,out);
    	    prev= out
    	}
    }, 20)


}
