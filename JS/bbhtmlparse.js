var brac, open_b, li_elem_patt

function load() {
    document.getElementById('input').value = '[img alt="derp width=250" width=250 height=100]http://nerhghn[/img][b]HI![/b]\n[list style="circle"]\n[*]A\n[*]B\n[/list]';
}


function conv(){
    var main_in=document.getElementById('input').value.toString();
    var test_patt = /\[|\</;
    var bb = test_patt.exec(main_in)=='[';

    init(bb)
    main_in = pre(main_in);
    var res = calc(main_in);

    console.log(res);

}

function init(htmlbb) {
   if (htmlbb) {
	brac         = function (str) { return "["+str+"]";};
	open_b       ="\\[", close_b="\\]", type = "BB";
	li_elem_patt = new RegExp (open_b+"\\*"+close_b+"(.*?)("+open_b+"\\*"+close_b+"|\\n)","g");
    } else {
	brac = function (str) { return "<"+str+">";};
	open_b="\\<", close_b="\\>", type = "HTML";
	li_elem_patt = new RegExp (open_b+"li"+close_b+"(.*?)"+open_b+"li"+close_b,"g");
    }
}

function pre(main_in) {
    var pt_patt  = /([^\[\]<>\n]+)(?![^\[\]<>\n]*[\]>])/g;
    var nl_patt  = new RegExp ('(\\\\n|'+open_b+'br'+close_b+')','g');
    var p_patt   = new RegExp ('('+open_b+'\\s*br\\s*'+close_b+open_b+'\\s*\\/br\\s*'+close_b+'){2}','g');
    main_in = main_in.replace(li_elem_patt,brac("list_element")+"$1"+brac("/list_element"));
    main_in = main_in.replace(nl_patt,brac("br")+brac("/br"));
    main_in = main_in.replace(p_patt,brac("p")+brac("/p"));
    main_in = main_in.replace(pt_patt,brac("plain")+"$1"+brac("/plain"));
    return main_in
}

function calc(main_in) {

    var out = [];
    var curr = 0;
    var all = "(?:.|\n)"
    var main_patt = new RegExp (open_b+"\\s*(\\w+)"+all+"*?"+open_b+"\\s*\\/\\s*\\1\\s*"+close_b);
    var tag_patt = new RegExp (open_b+"\\s*(\\w+)\\s*");
    var att_patt = new RegExp ("(\\w+)=(\\d+|([\\\"']).*?\\3|\\w+)\\s*");
    var cont_patt = new RegExp (open_b+"\\s*(\\w+).*?"+close_b+"("+all+"*?)"+open_b+"\\s*\\/\\s*\\1\\s*"+close_b);
    var brac_tag = new RegExp ("^[^"+close_b+"]");

    while (main_patt.test(main_in)) {
	var input = main_patt.exec(main_in)[0]
	var match = tag_patt.exec(input);
	out.push({format:type, type:match[1], content:"", attributes:{}, sub_layer:false});
	match=cont_patt.exec(input);
	out[curr].content=calc(match[2]);
	if (typeof out[curr].content == typeof []) { out[curr].sub_layer=true; }
	input = input.replace(tag_patt,"");
	while (brac_tag.test(input)) {
	    match=att_patt.exec(input);
	    if (match) {
		out[curr].attributes[match[1]] = match[2].replace(/["']/g,"");
		input = input.replace(att_patt,"");
	    } else {
		alert('Bad '+type+'Code');
		return [];
	    }
	}
	main_in = main_in.replace(main_patt,"");
	curr++;
    }
    if (out.length ==  0) {
	return main_in;
    } else if (out.length == 1 && out[0].type == "plain") {
	return out[0].content;
    } else {
	return out;
    }
}
