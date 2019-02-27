var progress = 0.
var level = 1.

function draw() {
    var canvas = document.getElementById('canvas');
    if (!(canvas.getContext)) return;
    var size = [canvas.width,canvas.height];
    var ctx = canvas.getContext('2d');
    const colour = ['#0000FF','#0000AF','#00FF00','#00AF00','#FF0000','#AF0000','#00AFFF','#AF00FF','#FFFF00','#FF00FF'];
    ctx.fillStyle=(colour[Math.floor(progress/1000)%colour.length]);
    ctx.clearRect(1,1,size[0]-1,size[1]-1);
    ctx.strokeRect(0,0,size[0],size[1]);
    ctx.fillRect(1,1,progress%1000,size[1]-1);
}

function inc() {
    var count = document.getElementById('counter');
    progress += 10./level;
    level = (Math.floor(progress/1000)+1.);
    if (progress % 1000 < 300./level) {
	var ding = "  Ding!";} else {var ding = " ";}
    count.innerHTML = "Level:"+level+ding;
    draw();
}


function main() {
    var canvas = document.getElementById('canvas');
    if (!(canvas.getContext)) return;
    var size = [canvas.width,canvas.height];
    var ctx = canvas.getContext('2d');
    
    ctx.strokeRect(0,0,size[0],size[1]);
    document.addEventListener('mousemove', function (evt) {inc();}, false);

}
