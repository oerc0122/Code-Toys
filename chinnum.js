const exps = {1:"",10:"\u5341",100:"\u767E",1000:"\u5343",10000:"\u842c",1e8:"\u5104",1e12:"\u5146",1e16:"\u4eac"}
const nums = {1:"\u4e00",2:"\u4e8c",3:"\u4e09",4:"\u56db",5:"\u4e94",6:"\u516d",7:"\u4e03",8:"\u516b",9:"\u4e5d"}
const vals = Object.keys(exps).reverse()
var num, chinnum, scale, prec;

function roundint(val_in, prec) {
    var temp = Math.pow(10,Math.min(Math.floor(Math.log10(val_in)),scale-prec+1))
    var val =  val_in / temp
    val = Math.floor(val)*temp
    return val;
}

function main () {
    update()
    num = roundint(Math.floor(Math.random()*9*Math.pow(10,scale)),prec);

    chinnum = decompose(num)
    if (!document.getElementById('chin').checked) {
	document.getElementById('num').innerText = chinnum
    } else {
	document.getElementById('num').innerText = num.toLocaleString('en-US')
    }	

    if (document.getElementById('read').checked) {
	var message = new SpeechSynthesisUtterance(chinnum)
	message.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Chinese_(Mandarin)'; })[0];
	message.pitch = 2
	message.rate = 0.4
	message.lang = "zn-cmn"
	message.volume = 0.6
	window.speechSynthesis.speak(message)
    }
}

function update () {
    scale = document.getElementById('scale').value
    document.getElementById('scaleD').value = scale
    prec = document.getElementById('prec').value
    document.getElementById('precD').value = prec
}

function reveal () {
    if (!document.getElementById('chin').checked) {
	document.getElementById('num').innerText = chinnum+"\n"+num.toLocaleString('en-US')
    } else {
	document.getElementById('num').innerText = num.toLocaleString('en-US')+"\n"+chinnum
    }
}

function decompose (number) {
    var out = ""
    for (var i in vals) {
	var div = parseInt(vals[i])
	if (number >= div) {
	    if ( number < 10 ) {
		out+=nums[number]
		break
	    } else {
		out+=decompose(Math.floor(number/div))+exps[div]
		number%=div
	    }
	}
    }
    return out
}