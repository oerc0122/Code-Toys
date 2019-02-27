var pos; // Declare pos globally

function direction(n,pos,dir) { // See : https://en.wikipedia.org/wiki/Dragon_curve
    // n=k2^m, if k%4=1, turn left; else turn right
    // Performed using bitwise operations for speed (on wiki)
    if ((((n & -n) << 1) & n) != 0) {
	dir = (dir + 3) % 4
    } else {
	dir = (dir + 1) % 4
    }

    switch (dir) {
    case 0:
        pos[0]++;
	break;
    case 1:
        pos[1]++;
	break;
    case 2:
        pos[0]--;
	break;
    case 3:
	pos[1]--;
	break;
    }
    
    return dir;
    }

function update(canvas) {
    // When clicked turn on or off colour
    canvas.rainbow(0.0001); 
    if (!canvas.colour_val) canvas.default_colour('#000000');
}

function reset(canvas) {
    // When clicked reset fractal
    canvas.clear();
    pos = canvas.origin.slice();
}

function main() {
    // Create Draw Area
    var canvas = new draw_area('canvas');
    // Set button to be the reset button
    var button = document.getElementById('reset');
    // In order to not create object reference
    pos = canvas.origin.slice();
    // Set initially to black
    canvas.default_colour('#000000');
    var dir = 0;
    var i = 0;

    // When clicked turn on or off colour
    canvas.canvas.addEventListener("click", function(evt) {update(canvas);}, false );
    // When clicked reset fractal
    button.addEventListener("click", function(evt) {reset(canvas);}, false );
    var DL = document.getElementById('dl');
    canvas.set_download(DL, 'dragon.png');

    // Animate by performing function every ...
    setInterval (function () {
    	for (var j = 1; j <= 10; j ++) { // Do 10 steps between draws
            i++; // Iterate step
            dir = direction(i,pos,dir);
    	    canvas.draw_dot(pos); // Draw position to canvas
    	    if (pos[0] < 0 || pos[1] < 0 || pos[1] > canvas.size[1] || pos[0] > canvas.size[0]) // If we leave the canvas..
    		reset(canvas); // ..Reset
    	}
    },2); // ... 2 microseconds
}
