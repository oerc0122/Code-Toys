var def = 'z^2+c';
var internal = def;
var calc;
var main_canvas;
var runn;
var repeat;
var vars = {colour_method:function(iter,val){},
	    min:[-2.,-2.],
	    max:[2.,2.],
	    maxiter:50, 
	    escape:4.,
	    escapemin:-1.,
	    step:0.,
	    cm:0,
	    cs:0,
	    c:new complex(Math.random()*2-1,Math.random()*2-1),
	    z:new complex(0,0),
	    i:new complex(0,1)
	   };

function funct(str) {return eval('calc = function() {return '+parse(lex(str))+';}')};

function valid_check(str) {
    var re = new RegExp('^('+Object.keys(complex.prototype).join('|')+'|[+*/^0-9icz.\(\)-])+$');
    return re.test(str);
}

function lex(origstr) {
    // Preprocess (Remove WS & Caps)
    var str = origstr.replace(/\s+/g,'').toLowerCase();

    var tokens = [],
    number = '[0-9]+',
    fl = '(?:'+number+'\\.?(?:'+number+')?)'//(?:[eE][+-]?[0-9]{0,3})?
    functions = Object.keys(complex.prototype),
    operations = {"*":"times","/":"div","+":"add","-":"sub","^":"pow"},
    ops   = Object.keys(operations),
    funcre= '(?:'+functions.join('|')+'(?=\\())',
    varre = '(?:(?:[czi](?![a-z])|'+fl+'))',
    opre  = '(?:['+ops.join('\\')+'])',
    bracre= '(?:\\()',
    tokenre = '(?:'+[funcre,varre,opre,bracre].join('|')+')';
    var funcre=new RegExp(funcre), varre=new RegExp(varre),
    opre=new RegExp(opre), bracre=new RegExp(bracre), tokenre=new RegExp(tokenre),
    isOp = function (s) {return opre.test(s)},
    isVar    = function (s) {return varre.test(s)},
    isFunc   = function (s) {return funcre.test(s)},
    isBrac   = function (s) {return bracre.test(s)},
    addToken = function (tokens,s) {if (isOp(s)) {tokens.push({type:'O',value:s})};
				    if (isVar(s)){tokens.push({type:'V',value:s})};
				    if (isFunc(s)){tokens.push({type:'F',value:s})};
				   };
    // Set tokens
    var token;
    while (str) {
	token = str.match(tokenre);
	if (token) {token = token[0]} else {throw new Error('Token not recognised: '+str)};
	addToken(tokens,token);
	if (isBrac(token)){
	    //Parse brackets
	    var depth = 0,brack="",parse = false;
	    for (i in str) {
    		if (str[i]==")") {
		    depth--;
		    if (depth == 0) {
			tokens.push({type:'B',value:lex(brack)});
			token = '('+brack+')';
			break;
		    }
		    else if (depth < 0) {throw new Error('Misaligned bracket')}
		}
    		if (parse) brack+=str[i];
    		if (str[i]=="(") {
		    parse=true;
		    depth++;
		}
	    }
	}
	if (depth > 0) {throw new Error('Misaligned bracket')}
	str = str.replace(token,'');
    }
    return tokens;
}

function resolve (index, tokens, evals) {
    // Remove relevant value from pool to be modified
    var a = tokens.splice(index,1)[0];
    switch (a.type) {
    case "I": 
	// Lower all relevant token indices
	if (a.type == "I") tokens.forEach(element => {if (element.type=="I" && element.value > a.value){element.value--}});
	// Remove relevant value from pool to be modified
	return evals.splice(a.value,1)[0];
    case "V": 
	var o = vars[a.value]?"vars."+a.value:"cmplx("+a.value+")";
	return o;
    case "B": 
    case "O": 
	// We should never be here unless something's gone horribly wrong
	throw new Error('Syntax Error: Misplaced operator: '+a.type+" "+a.value);
    }
}

function parse(tokens_in) {
    var evals = [];
    var tokens = tokens_in.slice(); // Preserve tokens in
    if (tokens.length == 1 && tokens[0].type == "V") {return vars[tokens[0].value]?"vars."+tokens[0].value:"cmplx("+tokens[0].value+")"};
    
    // Inelegant, but saves on type definition and without stupid functions, with millions of sub equations, will not cause any real issue
    tokens.types  = function () {var arr = []; for (i in this) {arr.push(this[i].type) }; return arr};
    tokens.values = function () {var arr = []; for (i in this) {arr.push(this[i].value)}; return arr};

    var func = {};
    for (i in complex.prototype) {func[i] = "cmp"+i}
    var symb = {
	"^":"cmppow",
	"*":"cmptimes",
	"/":"cmpdiv",
	"+":"cmpadd",
	"-":"cmpsub"
    }

    // Evaluate Brackets first
    var k;
    while ((k=tokens.types().indexOf('B')) != -1) {
	// Add evaluated bracket back into list
	evals.push("("+parse(tokens[k].value)+")"); 
	// Replace current token with index to evaluated location
	tokens[k] = {type:"I", value:evals.length - 1};
    }
    // Evaluate Right-operative functions
    while ((k=tokens.types().indexOf('F')) != -1) {
	// Add eval back
	var f = func[tokens[k].value];
	var a = resolve(k+1, tokens, evals);
	evals.push(f+"("+a+")"); 
	// Replace current token with index to evaluated location
	tokens[k] = {type:"I", value:evals.length - 1};
    }
    // Resolve unary operator
    for (k in tokens) {
	if (tokens[k].type == "O" && tokens[k].value == "-" && !(tokens[k-1].type == "V" || tokens[k-1].type == "I")) {
	    evals.push("cmpsign("+resolve(k+1, tokens, evals)+")");
	    // Replace current token with index to evaluated location
	    tokens[k] = {type:"I", value:evals.length - 1};
	} 
    }
    // Resolve infix operators (op ordered)
    for (op in symb) {
	while ((k=tokens.values().indexOf(op)) != -1) { 
	    var a = resolve(k-1, tokens, evals); 
	    k--;// --k due to shifting
	    var b = resolve(k+1, tokens, evals); 
	    evals.push(symb[op]+"("+a+","+b+")");
	    // Replace current token with index to evaluated location
	    tokens[k] = {type:"I", value:evals.length - 1};
	}
    }
    if (evals.length != 1) throw new Error('Evaluation Error: Evals not completed : '+evals);
    return evals[0];
}

// Iterate standard julia where Z is position and iterated variable
function julia(pos) {
    vars.z = new complex(pos[0],pos[1]);
    for (var i = 0; i < vars.maxiter; i++) {
	vars.z = calc();
	if (vars.z.norm2() >= vars.escape || vars.z.norm2() < vars.escapemin) {
	    break;
	} 
	else if (isNaN(vars.z.norm2())) {return NaN}
    }
    return i;
}

function burning_ship(pos) {
    // Invert relationship making z_0 = c
    var tmp = vars.z = vars.c;
    vars.c = new complex(pos[0],pos[1]);
    for (var i = 0; i < vars.maxiter; i++) {
	vars.z = calc();
	if (vars.z.norm2() >= vars.escape || vars.z.norm2() < vars.escapemin) {
	    break;
	} 
	else if (isNaN(vars.z.norm2())) {return NaN}
    }
    vars.c = tmp;
    return i;
}

function ang(pos) {
    vars.z = new complex(pos[0],pos[1]);
    for (var i = 0; i < vars.maxiter; i++) {
	vars.z = calc();
	vars.z = vars.z.div(cmplx(vars.z.mag()));
	if (vars.z.arg(true) >= vars.escape || vars.z.arg(true) < vars.escapemin) {
	    break;
	} 
	else if (isNaN(vars.z.norm2())) {return NaN}
    }
    return i;
}

// Iterate standard julia where Z is position and iterated variable
function field(pos) {
    vars.z = new complex(pos[0],pos[1]);
    for (var i = 0; i < vars.escapemin; i++) {
	vars.z = calc();
	if (vars.z.norm2() > 1e50) { // Emergency Escapes
	    return vars.maxiter;
	} 
	if (isNaN(vars.z.norm2())) {return NaN}
    }

    if (vars.z.imag > vars.escape) {return vars.maxiter}
    else if (vars.z.imag < -vars.escape) {return 1}
    else {return Math.round(vars.maxiter*(vars.z.imag + vars.escape)/(2*vars.escape))}
	
}

// Button functions for adding and removing colour selectors (need to make names based on occurance in form)
function add_colour(DEFcolour) {
    var col = document.forms["values"];
    col["rem"].disabled = false;
    var newcol = document.createElement("INPUT");
    newcol.type="color";
    newcol.value=DEFcolour?DEFcolour:"#000000";
    newcol.name="colour";
    col["colour_set"].appendChild(newcol);
}

function rem_colour() {
    var col = document.forms["values"];
    if (document.getElementsByName("colour").length == 3) col["rem"].disabled=true;
    col["colour_set"].removeChild(col["colour_set"].lastChild);
}

// Select colour generation style and method
function update_colour(tmp) {
    
    var forms = document.forms['values'];
    vars.cm = formeval("colour_met",0);
    vars.cs = formeval("colour_style",0);
    switch(vars.cm) {
	case 0:
	vars.colour_method = (iter,val)=>{return iter};
	break;
	case 1:
	vars.colour_method = (iter,val)=>{return Math.floor(vars.maxiter*(Math.PI+val.arg())/(2*Math.PI))};
	break;
	case 2:
	vars.colour_method = (iter,val)=>{return Math.floor((0.8*iter)+(0.2*vars.maxiter*(Math.PI+val.arg())/(2*Math.PI)))};
	break;
	case 3:
	vars.colour_method = (iter,val)=>{return vars.z.imag > 0? 0 : vars.maxiter};
	break;
    }
    if (tmp) {return}
    var col = forms["colour_set"];
    col.innerHTML = "";
    switch(vars.cs) {
	case 0: // 1D
	col.n_butt= 3
	var newcol = document.createElement("BUTTON");
	newcol.type="button";
	newcol.name="add";
	newcol.appendChild(document.createTextNode("Add colour"));
	newcol.onclick=add_colour;
	col.appendChild(newcol)
	var newcol = document.createElement("BUTTON");
	newcol.type="button";
	newcol.name="rem";
	newcol.disabled = false;
	newcol.appendChild(document.createTextNode("Remove colour"));
	newcol.onclick=rem_colour;
	col.appendChild(newcol)
	var newcol = document.createElement("BUTTON");
	newcol.type="button";
	newcol.name="pic";
	newcol.appendChild(document.createTextNode("Colour pick"));
	newcol.onclick=function() {var col = document.forms["values"]["colour_set"];
				   var swatch = new draw_area('swatch');
				   swatch.set_grid([1,vars.maxiter]);
				   while (document.getElementsByName("colour").length) {
				       col.removeChild(col.lastChild);
				   }
				   for (var i = vars.maxiter-1; i>0; i--) {
				       var newcol = document.createElement("INPUT");
				       newcol.type="color";
				       newcol.name="colour";
				       newcol.value=swatch.colour_at_point([0,i]);
				       col.appendChild(newcol);
				   }
				  }
	col.appendChild(newcol)
	col.appendChild(document.createElement("BR"))
	
	add_colour('#000050')
	add_colour('#0000FF')
	add_colour('#64B400')
	add_colour('#FFFF00')
	add_colour('#FF9600')
	add_colour('#FF0000')
	add_colour('#000000')
	add_colour('#FFFFFF')
		
	break;

	case 1: // RGB
	var newcol = document.createElement("INPUT");
	newcol.type="color";
	newcol.name="init";
	newcol.value="#000000";
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="redf";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="greenf";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="bluef";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);
	
	break;
	case 2: // HSV
	var newcol = document.createElement("INPUT");
	newcol.type="color";
	newcol.name="init";
	newcol.value="#000000";
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="huef";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="satf";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="number";
	newcol.name="valf";
	newcol.step=0.000001;
	newcol.min=0;
	newcol.max=1;
	newcol.value=0.1;
	col.appendChild(newcol);

	break;
	case 3: // Original
	var newcol = document.createElement("INPUT");
	newcol.type="range";
	newcol.name="freqs";
	newcol.step=0.000001;
	newcol.min=newcol.step;
	newcol.max=1;
	newcol.value=0.1;
	newcol.onchange=function(){this.form["freqt"].value=this.value};
	col.appendChild(newcol);
	var newcol = document.createElement("INPUT");
	newcol.type="text";
	newcol.name="freqt";
	newcol.min=0.005;
	newcol.max=1;
	newcol.value=0.1;
	newcol.onchange = function(){this.form["freqs"].value=this.value};
	col.appendChild(newcol);
	break;
	case 4: // Random
	break;
    }
}

function gen_colour() {

    var forms = document.forms["values"];
    var col = forms["colour_set"];
    var swatch = new draw_area("swatch");
    var colour = [];

    swatch.set_grid([1,vars.maxiter]);
    swatch.clear()
    
    switch(vars.cs) {
	case 0: // 1D
	var col = document.getElementsByName("colour");
	var step = vars.maxiter / (col.length-1),j=0;
	for (var i = 0;i<col.length-1;i++) {
	    var from=colour_to_rgb(col[i.toString()].value);
	    var to=colour_to_rgb(col[(i+1).toString()].value);
	    var frequency=[(to[0]-from[0])/step,(to[1]-from[1])/step,(to[2]-from[2])/step];
	    for (var iter = 0; iter < step; iter++,j++) {
		colour.push(rgb_to_colour(
		    Math.floor(from[0]+iter*frequency[0]),
		    Math.floor(from[1]+iter*frequency[1]),
		    Math.floor(from[2]+iter*frequency[2])
		));
		swatch.draw_dot([0,vars.maxiter-j], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]+2]);
	    }
	}
	break;
	case 1: // 3D-RGB
	var frequency = [formeval("redf",0.1),formeval("greenf",0.1),formeval("bluef",0.1)];
	var val=colour_to_rgb(forms["init"].value);
	for (var iter = 0; iter < vars.maxiter; iter++) {
	    colour.push(rgb_to_colour(
		Math.floor(Math.sin(val[0] + iter*frequency[0]) * 127 + 128),
		Math.floor(Math.sin(val[1] + iter*frequency[1]) * 127 + 128),
		Math.floor(Math.sin(val[2] + iter*frequency[2]) * 127 + 128)
	    ));
	    swatch.draw_dot([0,vars.maxiter-iter], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]+2]);
	}
	break;
	case 2: // 3D-HSV
	var frequency = [formeval("huef",0.1),formeval("satf",0.1),formeval("valf",0.1)];
	var val=colour_to_hsv(forms["init"].value);
	for (var iter = 0; iter < vars.maxiter; iter++) {
	    colour.push(hsv_to_colour(
		val[0] + iter*frequency[0],
		(Math.sin(val[1] + iter*frequency[1])+1)/2,
		(Math.sin(val[2] + iter*frequency[2])+1)/2
	    ));
	    swatch.draw_dot([0,vars.maxiter-iter], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]+2]);
	}
	break;
	case 3: //Orig
	var frequency = formeval("freqs",0.1);
	for (var val=0,iter = 0; iter < vars.maxiter; val+=frequency,iter++) {
	    colour.push(rgb_to_colour(
		Math.floor(Math.sin(val + 2) * 127 + 128),
		Math.floor(Math.sin(val + 0) * 127 + 128),
		Math.floor(Math.sin(val + 4) * 127 + 128)
	    ));
	    swatch.draw_dot([0,vars.maxiter-iter], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]+2]);
	}
	break;
	case 4: // Rand
	for (var val=0,iter = 0; iter < vars.maxiter; val+=frequency,iter++) {
	    colour.push(rgb_to_colour(
		Math.floor(Math.floor(Math.random()*256)),
		Math.floor(Math.floor(Math.random()*256)),
		Math.floor(Math.floor(Math.random()*256))
	    ));
	    swatch.draw_dot([0,vars.maxiter-iter], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]+2]);
	}
	break;

    }
    colour[vars.maxiter] = "#000000";
    swatch.draw_dot([0,0], colour[colour.length-1],[swatch.spacing[0],swatch.spacing[1]]);
    return colour;
}

// Scaling
function sync_bar(bar) {
    var forms = document.forms["values"];
    if (bar) {
	forms["width"].value = formeval("widthB",500)
	forms["height"].value = formeval("heightB",500)
    } else {
	forms["widthB"].value = formeval("width",500)
	forms["heightB"].value = formeval("height",500)
    }
    forms["SratioW"].value=1
    forms["SratioH"].value=formeval("width")/formeval("height")
}

function scale_to_match(domain) {
    if (domain) {
	var dom_diff = vars.max[1] - vars.min[1];
	var tmp = 0.5*dom_diff*(1-(formeval("ratioH")/formeval("SratioH")));
	vars.min[1] += tmp;
	vars.max[1] -= tmp;
    } else {
	main_canvas.size[1] = formeval("height")*(formeval("SratioH")/formeval("ratioH"))
    }
    formsync();
    formread();
    main_canvas.set_range([vars.min,vars.max]);
    draw();
    return;
}

function dom_reset() {
    vars.min = [-2.,-2.];
    vars.max = [2.,2.];
    formsync();
    formread();
    main_canvas.set_range([vars.min,vars.max]);
    draw();
    return;
}

// Form operations
function update (pos) {
    var forms = document.forms["values"];
    
    if ((pos[1][0] - pos[0][0] < 2) || pos[1][1] - pos[0][1] < 2) { // If less than one pixel
    	return;
    } else
	if (Math.abs((pos[1][0] - pos[0][0])/(pos[1][1] - pos[0][1])) - 1 < 0.5 ) { // If almost square
    	    var len = pos[1][0] - pos[0][0];
    	    vars.min = main_canvas.unscale(pos[0]);
    	    vars.max = main_canvas.unscale([pos[0][0]+len,pos[0][1]+len]);
	} else {
    	    vars.max = main_canvas.unscale(pos[1]);
    	    vars.min = main_canvas.unscale(pos[0]);
	}
    forms["rdommax"].value = vars.max[0];
    forms["rdommin"].value = vars.min[0];
    forms["idommax"].value = vars.max[1];
    forms["idommin"].value = vars.min[1];
    forms["ratioW"].value = 1
    forms["ratioH"].value = (vars.max[1] - vars.min[1])/(vars.max[0] - vars.min[0])
    main_canvas.set_range([vars.min,vars.max]);
    formread();
    draw();
    return;
}

function formeval(str,def,form_in) {
    var forms = form_in?form_in:document.forms["values"];
    return (isNaN(Number(forms[str].value))) ?  def : Number(forms[str].value);
}

function URLeval(forms,str,def) {
    return (isNaN(Number(forms[str].value))) ?  def : Number(forms[str].value);
}

function formsync() {
    var forms = document.forms["values"];
    forms["init1"].value = vars.c.real;
    forms["init2"].value = vars.c.imag;
    forms["rdommax"].value = vars.max[0];
    forms["rdommin"].value = vars.min[0];
    forms["idommax"].value = vars.max[1];
    forms["idommin"].value = vars.min[1];
    forms["ratioW"].value = 1;
    forms["ratioH"].value = (vars.max[0] - vars.min[0])/(vars.max[1] - vars.min[1]);

    forms["width"].value = main_canvas.size[0];
    forms["height"].value = main_canvas.size[1];
    sync_bar()

    forms["iter"].value = vars.maxiter;
    forms["func"].value = internal;
    forms["escape"].value = vars.escape;
    forms["escapemin"].value = vars.escapemin;
    forms["typ"].forEach(x => {x.checked=false})
    switch(repeat) {
	case julia:
	forms["typ"][0].checked=true;
	break;
	case burning_ship:
	forms["typ"][1].checked=true;
	break;
	case ang:
	forms["typ"][2].checked=true;
	break;
	case field:
	forms["typ"][3].checked=true;
	break;
	default:
	throw new Error('Bad fractal type selected')
    }

    for (var i in forms["colour_met"]) forms["colour_met"][i].checked=false;
    forms["colour_met"][vars.cm].checked=true;
    for (var i in forms["colour_style"]) forms["colour_style"][i].checked=false;
    forms["colour_style"][vars.cs].checked=true;
    sync_bar();
}

function readURL() {
    var form=window.location.href.split('?')[1].split('&');
    forms={};
    for (var i in form) {var X = form[i].split("=");
			 if (X[0]!="colour") {forms[X[0]]={value:X[1]}}
			 else {
			     if (forms[X[0]] == undefined) forms[X[0]]={value:[]};
			     forms[X[0]].value.push(X[1])
			 }}
    switch (forms["typ"].value) {
	case "jul":
	repeat = julia;
	break;
	case "bur":
	repeat = burning_ship;
	break;
	case "ang":
	repeat = ang;
	break;
	case "fie":
	repeat = field;
	break;
	default:
	throw new Error('No fractal type selected')
    }
    vars.c.real = URLeval(forms,"init1",2.*Math.random()-1.);
    vars.c.imag = URLeval(forms,"init2",2.*Math.random()-1.);
    vars.min = [URLeval(forms,"rdommin",-2.),URLeval(forms,"idommin",-2.)];
    vars.max = [URLeval(forms,"rdommax",2.),URLeval(forms,"idommax",2.)];
    vars.step = [(vars.max[0]-vars.min[0])/main_canvas.size[0],(vars.max[1]-vars.min[1])/main_canvas.size[1]];
    main_canvas.set_range([vars.min,vars.max]);
    vars.maxiter = URLeval(forms,"iter",300);
    vars.escape = URLeval(forms,"escape",4.);
    vars.escapemin = URLeval(forms,"escapemin",-1.);
    internal = unescape(forms["func"].value);
    vars.cm = URLeval(forms,"colour_met",0)
    vars.cs = URLeval(forms,"colour_style",0)
    funct(internal);

    formsync();
    update_colour();
    var vals=document.forms["values"];
    switch(vars.cs) {
	case 0:
	// Remove all colours
	rem_colour();rem_colour(); 
	var col_list =document.getElementsByName("colour")
	while (col_list.length < forms["colour"].value.length) {
	    add_colour(unescape(forms["colour"].value[col_list.length-1]));
	}
	break;
	case 1:
	vals["init"]=forms["init"];
	vals["redf"]=forms["redf"];
	vals["greenf"]=forms["greenf"];
	vals["bluef"]=forms["bluef"];
	break;
	case 2:
	vals["init"]=forms["init"];
	vals["huef"]=forms["huef"];
	vals["satf"]=forms["satf"];
	vals["valf"]=forms["valf"];
	break;
	case 3:
	vals["freqs"]=forms["freqs"];
	break;
	case 4:
	break;
    }

}

function formread(reset) {
    var forms = document.forms["values"];
    if (reset) {forms["init1"].value = forms["init2"].value = "F"}
    switch (forms["typ"].value) {
	case "jul":
	repeat = julia;
	break;
	case "bur":
	repeat = burning_ship;
	break;
	case "ang":
	repeat = ang;
	break;
	case "fie":
	repeat = field;
	break;
	default:
	throw new Error('No fractal type selected')
    }
    main_canvas.canvas.width = formeval("width",500);
    main_canvas.canvas.height = formeval("height",500);
    main_canvas.resize();

    vars.c.real = formeval("init1",2.*Math.random()-1.);
    vars.c.imag = formeval("init2",2.*Math.random()-1.);
    vars.min = [formeval("rdommin",-2.),formeval("idommin",-2.)];
    vars.max = [formeval("rdommax",2.),formeval("idommax",2.)];
    vars.step = [(vars.max[0]-vars.min[0])/main_canvas.size[0],(vars.max[1]-vars.min[1])/main_canvas.size[1]];
    main_canvas.set_range([vars.min,vars.max]);
    vars.maxiter = formeval("iter",300);
    vars.escapemin = formeval("escapemin",0.);
    vars.escape = formeval("escape",4.);
    internal = forms["func"].value;
    vars.cm = formeval("colour_met",0)
    vars.cs = formeval("colour_style",0)
    funct(internal);
}

function rerun(A) {
    formread(A);
    formsync();
    draw();
    return;
}

function draw() {
    var DlButt=document.getElementById('dlButt');
    DlButt.innerHTML="";
    DlButt.removeAttribute('href');
    DlButt.removeAttribute('download');
    var colour = gen_colour();
    var log=document.getElementById('comp');
    clearTimeout(runn)
    main_canvas.clear();
    log.innerHTML ='Calculating... 0%';
    var Px = vars.min[0],j=0;
    var draw_chunk =function () {
	Px += vars.step[0],j++;
	for (var Py = vars.min[1]; Py <= vars.max[1]; Py+=vars.step[1]) {
	    var pos = [Px,Py];
	    var iter = repeat(pos);
	    if (isNaN(iter)) {log.innerHTML="Error in calculation.";clearTimeout(runn);return}
	    main_canvas.draw_dot([Px,Py],colour[vars.colour_method(iter,vars.z)]);
	}
	if (j%(main_canvas.size[0]/10)==0) {log.innerHTML = "Calculating... "+(100*j/main_canvas.size[0])+"%"} 
	if (j < main_canvas.size[0]) {runn = setTimeout(draw_chunk, 0)} else {log.innerHTML ='Done!';DlButt.innerHTML="Click Here to download your fractal";DlButt.href = main_canvas.canvas.toDataURL();DlButt.download = "Julia.png"}
    }
    draw_chunk();

    return;
}

function main() {
    main_canvas = new draw_area('canvas');
    var forms = document.forms["values"];
    repeat = julia;
    update_colour();
    if (window.location.href.match('\\?')) {readURL()}
    formsync();
    funct(internal);
    main_canvas.set_range([vars.min,vars.max]);
    vars.step = [(vars.max[0]-vars.min[0])/main_canvas.size[0],(vars.max[1]-vars.min[1])/main_canvas.size[1]];
    draw();

    main_canvas.set_interactive({func:update,args:undefined});


    return;
}
