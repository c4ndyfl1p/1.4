//World variables
mapX = 900;
mapY = 500;

people = []; //contains all of the persons going about our little simulated world
population = 500;

//Disease variables
//quarantineRate = 0.9; //Slider1, Percentage of population under quarantine
infectRange = 25; //Slider2, infection radius
infectRate = 0.01; //Slider 3, probability of transmission
infectPeriod = 1000; //recovery period

//Appearance only
sickColor = '#dd39fa';
healthyColor = '#30964b';
recoveredColor = '#C8C8C8';
bgColor = '#000000';
radius = 7;

//Random Walk variables
twoPI = 2*Math.PI;
minFrames = 20;
maxFrames = 100;
velocity = 80; //max velocity

graphX = 900;
graphY = 185;

running = false;
startDrawingGraph = false;

var counter, graph;

var d, p1, p2;

slider1 = document.getElementById("quarantineRate");

 // testval = testFunctionI

 // function testFunction(x){
 // 	return x;
 // }

//  if (slider1.value !== null){
//  testQuarantineRate = slider1.value * 0.01;
// }
// else{testQuarantineRate = 0.5}

slider2 = document.getElementById("infectRange");
slider3 = document.getElementById("infectRate");

//the basic unit of our simulation
//condemned to be in constant andom walk until death
class Person {
	constructor (x, y, v, age = 1) {
		
		this.age = age;
		this.infected = false;
		this.recovered = false;
		this.color = healthyColor;

		this.x = x;
		this.y = y;
		this.v = v;
		this.r = radius;	

		this.dx = 0;
		this.dy = 0;
		this.dtheta = 0;

		this.angle = 0;
		this.turn();

	}

	turn (dtheta) {

		if (dtheta == undefined) {
			this.dtheta = twoPI * Math.random();
		}

		this.angle += this.dtheta;

		//modulo 2*pi

		if (this.angle > twoPI) {
			while (this.angle > twoPI) {
				this.angle -= twoPI;
			}
		}

		this.framesUntilTurn = Math.round (  minFrames + maxFrames * Math.random()  );

	}

	move (p) {

		if (this.v != 0) {

			if (this.framesUntilTurn  == 0) {
				this.turn();
			}

			this.dx = this.v * Math.cos(this.angle) * p.deltaTime/1000;
			this.dy = this.v * Math.sin(this.angle) * p.deltaTime/1000;

			this.x += this.dx;
			this.y += this.dy;

			//once person reaches edge of map, spawn them on the other side
			if (this.x < 0) {
				this.x = mapX + this.x;
			} else if (this.x > mapX) {
				this.x = this.x - mapX;
			}

			if (this.y < 0) {
				this.y = mapY + this.y;
			} else if (this.y > mapY) {
				this.y = this.y - mapY;
			}


			this.framesUntilTurn -= 1;

		}
	}

	infect () {
		this.infected = true;
		this.color = sickColor;
		this.framesUntilRecovery = infectPeriod;
	}

	disinfect () {
		this.infected = false;
		this.color = recoveredColor;
		this.recovered = true;
	}


	display (p) {
		p.fill(this.color);

    	p.ellipse(this.x, this.y, this.r, this.r);
  	}
}

class Tracker {
	constructor (x, y, susceptible = 0, infected = 0, recovered = 0) {
		this.x = x;
		this.y = y;

		this.susceptible = susceptible;
		this.infected = infected;
		this.recovered = recovered;
	}

	display (p) {
		p.fill(150, 100);
		p.rect(this.x, this.y, 80, 60);
		p.fill(255);

		p.text(`S = ${this.susceptible}`, this.x+10, this.y+20);
		p.text(`I = ${this.infected}`, this.x+10, this.y+35);
		p.text(`R = ${this.recovered}`, this.x+10, this.y+50);
	}
}


class Graph {

	constructor (tracker) {
		this.tracker = tracker;

		this.memory = [ [this.tracker.susceptible, this.tracker.infected, this.tracker.recovered] ];

		//memory = [ [99, 1, 0], [98, 2, 0] ]
		//memory[0][1]

		this.width = graphX;
		this.height = graphY;
		this.feededEvery = 30;
		this.gap = 10;

		this.span = Math.floor(this.width/this.gap);
		this.ratio = this.height/population;

		this.framesUntilFeed = this.feededEvery;
	}

	update () {	

		if (graph.framesUntilFeed == 0) {
			this.memory.push( [this.tracker.susceptible, this.tracker.infected, this.tracker.recovered] );

			if (this.memory.length > this.span) {
				this.memory = this.memory.slice(1);
			}

			graph.framesUntilFeed = graph.feededEvery;
		} else {
			graph.framesUntilFeed -= 1;
		}

	}

	draw (p) {

		for (let i = 1; i < this.span; i++) {
			if (this.memory[i] != undefined) {
				//rect(this.x + i, this.y + this.height - this.memory[i][1] * this.height/population, 1, this.memory[i][1] * this.height/population);
				//console.log(this.memory[0][0]);
				if (this.memory.length > 1) {
					p.strokeWeight(2);
					p.stroke(healthyColor);
					p.line(this.gap*(i-1), this.height - this.memory[i-1][0] * this.ratio, this.gap*i, this.height - this.memory[i][0] * this.ratio);
					p.stroke(sickColor);
					p.line(this.gap*(i-1), this.height - this.memory[i-1][1] * this.ratio, this.gap*i, this.height - this.memory[i][1] * this.ratio);
					p.stroke(recoveredColor);
					p.line(this.gap*(i-1), this.height - this.memory[i-1][2] * this.ratio, this.gap*i, this.height - this.memory[i][2] * this.ratio);
					p.noStroke();
				}
			} else {
				break;
			}
		}

	}

}

counter = new Tracker(10, 10);

startButton = document.createElement("button");
startButton.innerHTML = "Go";

document.body.appendChild(startButton);

startButton.onclick = () => {	
	//v = console.log(slider.value *0.01)	
	//console.log(v)

	if (!running) {
		for (let i = 0; i < population; i++) {

		if (Math.random() < (slider1.value*0.01)) {
			people[i] = new Person (mapX * Math.random(), mapY*Math.random(), 0);
		} else {
			people[i] = new Person (mapX * Math.random(), mapY*Math.random(), 0.5*(1 + Math.random()) * velocity);
		}

	}

	}

	//randomly select a single person to infect
	( people[ Math.floor(Math.random()*people.length) ] ).infect();

	counter.susceptible = population-1;
	counter.infected = 1;
	counter.recovered = 0;

	running = true;
	startDrawingGraph = true;

	graph = new Graph(counter);
	graph.update();
}

let worldCanvas = function(p){

	p.setup = function() {
		p.createCanvas(mapX, mapY);
		p.noStroke();
	}

	p.draw = function() {
	//v = console.log(slider.value)

	if ( running ) {
		for (let i = 0; i < population; i++) {
			for (let j = i + 1; j < population; j++) {
				p1 = people[i];
				p2 = people[j];

				if ( (p1.infected || p2.infected) && !(p1.infected && p2.infected) && !(p1.recovered || p2.recovered) ) {
					d = p.dist(p1.x, p1.y, p2.x, p2.y);

					if (d < slider2.value && Math.random() < slider3.value*0.01) {
						if (p1.infected) {
							p2.infect();
						} else {
							p1.infect();
						}

						counter.susceptible -= 1;
						counter.infected += 1;
					}

					//10 frames contact, infected person + sus person
					// infectRate = 0.01
					// 1: 0.2
					// 2: 0.5
					// 3: 0.7
					// 9: 0.009 < 0.01 -> sus person is infected

					//a                                          A
					//a  a   a   a   a   a  a   a   a   a   a    A
				}
			}
		}

		for (person of people) {
			if (person.infected) {
				if (person.framesUntilRecovery > 0) {
					person.framesUntilRecovery -= 1;
				} else {
					person.disinfect();

					counter.infected -= 1;
					counter.recovered += 1;

					if (counter.infected == 0) {
						running = false;
					}

				}
			}

			person.move(p);
		}

		graph.update();

	}

	//Drawing stuff

	p.background(bgColor);

	for (person of people) {
		person.display(p);
	}

	counter.display(p);

	}
}

let graphCanvas = function(p) {
	p.setup = function() {
		p.createCanvas(graphX, graphY);
		p.fill(150, 150, 0);
	}

	p.draw = function() {

		p.background("#f5f5f5");
		
		if (startDrawingGraph) {
			graph.draw(p);
		}
	}
}

let world_canvas = new p5(worldCanvas, "world-canvas");
let graph_canvas = new p5(graphCanvas, "graph-canvas");
