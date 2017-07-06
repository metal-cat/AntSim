// rAF
window.requestAnimationFrame = function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(f) {
            window.setTimeout(f,1e3/60);
        }
}();


var canvas       = document.getElementById("terrarium"),
	context      = canvas.getContext("2d"),
	width        = canvas.width,
	height       = canvas.height;
var now;
var then = Date.now();
var delta;

var collisionObjects = [];
var hive;
var ants = [];
var food = [];
var settings = new Settings();

function init(){
	var hivePos = math.matrix([width/2,height/2]);
	hive = new Hive(canvas, hivePos, 12, collisionObjects);
	collisionObjects.push(hive);
	for (var i=0; i< 30; i++){
		var antPos = math.add(math.matrix([rand(-50,50),rand(-50,50)]), hivePos);
		var newAnt = new AntCustom(canvas, antPos, collisionObjects)
		ants.push(newAnt);
		collisionObjects.push(newAnt);
	}
}

function simulate(){
	for (var i = 0; i < ants.length; i++) {
		ants[i].setVisibleObjects(collisionObjects);
		ants[i].iterate();
		ants[i].move(collisionObjects);
	}
	
	for (var i = 0; i < food.length; i++) {
		food[i].decay();
		// remove food if it is "empty"
		if (food[i].isEmpty() && i > -1){
			for (var a =0; a < collisionObjects.length; a++){
				if (collisionObjects[a] == food[i])	
					collisionObjects.splice(a, 1);
			}
			food.splice(i, 1);
		}
	}
	var createFood = Math.floor(rand(0,1.05));
	if (createFood && food.length < 10){
		var foodPos = math.matrix([rand(0,canvas.width),rand(0,canvas.height)]);
		var newFood = new Food(canvas, foodPos, 1000, collisionObjects)
		food.push(newFood);
		collisionObjects.push(newFood);
	}
	
}

function draw(){
	now = Date.now();
	delta = now - then;
	var interval = 1000/settings.getFramesPerSecond()
	if(delta > interval) {
		then = now - (delta % interval);
		simulate();
		
		//Clear screen
		context.clearRect(0, 0, width, height);
		hive.draw();

		for (var i = 0; i < food.length; i++) {
			food[i].draw();
		}
		for (var i = 0; i < ants.length; i++) {
			ants[i].draw();
		}
	}
	
	if (settings.getAutoIterateFrames())
		requestAnimationFrame(draw);
}
	
window.onload = function(){init();draw();requestAnimationFrame(draw);}