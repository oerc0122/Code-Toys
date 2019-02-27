
//Values
var vars={}, params={}, rule = {},draw_rule = {};

var thicken = function(ctx) {
    params.Thickness *= params.Thickness_scale;
    ctx.lineWidth = Math.floor(Math.max(10,params.Thickness));
}

var thin = function(ctx) {
    params.Thickness /= params.Thickness_scale;
    ctx.lineWidth = Math.floor(Math.min(1,params.Thickness));
}

var narrow = function(ctx) {
    vars.angle -= params.Angle_change;
}

var broaden = function(ctx) {
    vars.angle += params.Angle_change;
}

var shorten = function(ctx) {
    params.Distance -= params.Distance_change;
}

var lengthen = function(ctx) {
    params.Distance += params.Distance_change;
}

var restore = function(ctx) {
    vars.pos = vars.saved.pop();
    ctx.moveTo(vars.pos[0][0],vars.pos[0][1]);
}

var save = function() {
    vars.saved.push([[Number(vars.pos[0][0]),Number(vars.pos[0][1])],Number(vars.pos[1])]);
}

var move = function(ctx) {
    vars.pos[0][0] += Math.floor(params.Distance*Math.cos(vars.pos[1]));
    vars.pos[0][1] -= Math.floor(params.Distance*Math.sin(vars.pos[1]));
    ctx.lineTo(vars.pos[0][0],vars.pos[0][1]);
}

var turnl = function() {
    const deg_to_rad = 0.0174532925;
    const two_pi =(2*Math.PI);
    vars.pos[1] -= ((vars.angle*deg_to_rad)%two_pi);
}

var turnr = function() {
    const deg_to_rad = 0.0174532925;
    const two_pi =(2*Math.PI);
    vars.pos[1] += ((vars.angle*deg_to_rad)%two_pi);
}


function update() {
    //Inputs
    var map = document.forms["mapping"];
    var values = document.forms["values"];

    var i;

    num = Object.keys(map).length;
    rule = {};
    for (i = 0; i < num; i+=2 ) {
	if (!map[i]) break;
	rule[String(map[i].value)] = String(map[i+1].value);
    }

    for (i in params) {
	if ( isNaN(Number(values["values"+i].value)) && i != "Seed") {
	    alert("Invalid value for "+i);
	}  else {
	    params[i] =   Number(values["values"+i].value);
	}
    }

    params.Seed = values["valuesSeed"].value;
    ans = params.Seed;
    vars.angle = params.Initial_Angle;

}

function help() {
    var draw_rule_help = {};
    draw_rule_help['+'] = "+ - Turn Right" ;
    draw_rule_help['-'] = "- - Turn Left" ;
    draw_rule_help['F'] = "F - Move" ;
    draw_rule_help['['] = "[ - Save position" ;
    draw_rule_help[']'] = "] - Restore last position" ;
    draw_rule_help['X'] = "X - Do Nothing";
    draw_rule_help['T'] = "T - Thicken line" ;
    draw_rule_help['t'] = "t - Thin line" ;
    draw_rule_help['B'] = "b - Increase Angle on turn by Angle_change" ;
    draw_rule_help['N'] = "n - Decrease Angle on turn by Angle_change" ;
    draw_rule_help['S'] = "s - Shorten next line segment" ;
    draw_rule_help['L'] = "l - Lengthen next line segment" ;

    help = "Draw shapes by changing parameters and setting up mappings between characters. Certain characters have special effect, these are: \n";

    for (i in draw_rule_help) {
	help += draw_rule_help[i]+"\n";
    }
    alert(help);

}

function add_rule() {
    var map = document.forms["mapping"];
    var keys = Object.keys(rule)
    var i = Object.keys(document.forms["mapping"]).length/2

    map.innerHTML += form_command("map"+i,1);
    map.innerHTML += form_command("mapto"+i) + "<br>";
    map["map"+i].value = "A";
    map["mapto"+i].value = "C";

    //Fill values
    for (i=0; i < keys.length; i++) {
	map["map"+i].value = keys[i];
	map["mapto"+i].value = rule[keys[i]];
    }
    

}

function form_command(name,max_len) {
    var out = '<input type="text" name="'+name+'"';
    if (max_len) { out+= ' maxlength="'+String(max_len)+'"' };
//    out += ' onblur="update()"'
    return out+'>';
}


function init() {
    //Inputs
    var map = document.forms["mapping"];
    var values = document.forms["values"];

    var i, j;
    draw_rule['+'] = turnr;
    draw_rule['-'] = turnl;
    draw_rule['F'] = move;
    draw_rule['['] = save;
    draw_rule[']'] = restore;
    draw_rule['X'] = function() {}
    draw_rule['T'] = thicken;
    draw_rule['t'] = thin;
    draw_rule['B'] = broaden;
    draw_rule['N'] = narrow;
    draw_rule['S'] = shorten;
    draw_rule['L'] = lengthen;


    rule  = {X : "F-[[[[X]+X]+F[+FX]+F-X]+F]", F : "FF"};

    vars.pos = []
    vars.saved = []
    vars.pos[1] = 0

    params.Seed = "XT";
    params.Iterations = 6;
    //
    params.Distance = 4;
    params.Distance_change = 1.;
    //
    params.Initial_Angle = 35.;
    params.Angle_change = 20.;
    //
    params.Thickness = 1.;
    params.Thickness_Scale = 1.5;
    //
    params.Orientation = 90.;

    //Create Form
    keys = Object.keys(rule)
    map.innerHTML = "Mappings:<br>";
    for (i=0; i < keys.length; i++) {
	map.innerHTML += form_command("map"+i,1);
	map.innerHTML += form_command("mapto"+i) + "<br>";
    }
    //Fill values
    for (i=0; i < keys.length; i++) {
	map["map"+i].value = keys[i];
	map["mapto"+i].value = rule[keys[i]];
    }

    //Create Form
    keys = Object.keys(params)
    values.innerHTML = "<br>Values:<br>";
    for (i=0; i < keys.length; i++) {
	values.innerHTML += keys[i]+": "+form_command("values"+keys[i]);
	if (i % 2 != 0) values.innerHTML+="<br>"
    }

    //Fill values
    for (i=0; i < keys.length; i++) {
	values["values"+keys[i]].value = params[keys[i]];
    }

    ans = params.Seed
    vars.angle = params.Initial_Angle
}

function draw_rules(ctx,size,str,iter_rule) {

    var origin = [size[0]/2,size[1]];
    ctx.beginPath();
    ctx.moveTo(origin[0],origin[1]);

    var out = [];
    vars.pos = [[origin[0], origin[1]], params.Orientation*0.0174532925];

    for (var i = 0; i<str.length; i++) {
	vars.pos[0][0] = Math.max(1,vars.pos[0][0]);
	vars.pos[0][0] = Math.min(size[0]-1,vars.pos[0][0]);
	vars.pos[0][1] = Math.max(1,vars.pos[0][1]);
	vars.pos[0][1] = Math.min(size[1]-1,vars.pos[0][1]);
	if (iter_rule[str[i]])iter_rule[str[i]](ctx);
    }

    ctx.stroke();
    ctx.closePath();
}


function iterate(str,iter_rule) {
    var out = "";
    var val = "";
    for (var i = 0; i<str.length; i++) {
	val = (iter_rule[str[i]]) ? iter_rule[str[i]] : str[i];
	out += val;
    }
    return out;
}

function solve() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    const size = [canvas.width,canvas.height];

    ctx.clearRect(0,0,size[0],size[1])
    console.log('Calculating...')
    for (var i = 0; i <= params.Iterations; i++) {
	ans = iterate(ans,rule);
    }
    draw_rules(ctx,size,ans,draw_rule);
    console.log('Done!')
}

function main() {
    var canvas = document.getElementById('canvas');
    if (!(canvas.getContext)) return -1;
    init();
    solve();

}
