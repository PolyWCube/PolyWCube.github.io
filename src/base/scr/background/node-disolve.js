const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext('2d');

const NODE_COUNT = 100;
const CONNECT_RANGE = 50;
const INTERACTION_RANGE = 1000;
const MAX_SPEED = 4;
const REPULSION_FORCE = 10;
const ALIGNMENT_FORCE = 5;
const OVERLAP_FACTOR = 2;
const NODE_RADIUS_MIN = 5;
const NODE_RADIUS_MAX = 10;
let CENTER_ATTRACT_FORCE = 0.0000005;

navigator.mediaDevices.getUserMedia({ audio: true })
.then(stream => {
    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    mediaStreamSource.connect(analyser);
    
    function updateVolume() {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
		let force = 1 / (volume * 10000);
		if (isFinite(force)) CENTER_ATTRACT_FORCE = force;
		else CENTER_ATTRACT_FORCE = 0.00005;
		
		console.log(volume);
        
        requestAnimationFrame(updateVolume);
    }
    
    updateVolume();
})
.catch(error => {
    console.error('Error accessing microphone:', error);
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasCenterX = canvas.width / 2;
let canvasCenterY = canvas.height / 2;

const nodes = [];
let lines = [];

//Colors Array for visual distinction
const colors = [
  "#FF5733", "#C70039", "#900C3F", "#6900B0", "#4100C4",
  "#1E88E5", "#039BE5", "#00BCD4", "#009688", "#4CAF50"
];

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = NODE_RADIUS_MIN + Math.random() * (NODE_RADIUS_MAX - NODE_RADIUS_MIN);
        this.dx = (Math.random() - 0.5) * MAX_SPEED;
        this.dy = (Math.random() - 0.5) * MAX_SPEED;
        this.colorIndex = randomIntFromInterval(0, colors.length - 1);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[this.colorIndex];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    move() {
		this.handleCenterAttraction();
        this.x += this.dx;
        this.y += this.dy;

        // Constrain to canvas
        this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
        this.applyForces();
        this.limitSpeed();
    }
	
	handleCenterAttraction() {
		const dx = canvasCenterX - this.x;
		const dy = canvasCenterY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance > 0) {  // Avoid division by zero
			const force = CENTER_ATTRACT_FORCE * (distance * distance);
			this.dx += force * dx / distance;
			this.dy += force * dy / distance;
		}
	}


    handleWalls() {
        const wallThickness = 5;

        if (this.x + this.radius > canvas.width - wallThickness || this.x - this.radius < wallThickness) {
            this.dx *= -0.8;
            this.visualFeedback();
        }
        if (this.y + this.radius > canvas.height - wallThickness || this.y - this.radius < wallThickness) {
            this.dy *= -0.8;
            this.visualFeedback();
        }
    }


	applyForces() {
    nodes.forEach(other => {
        if (other !== this && this.distanceTo(other) < INTERACTION_RANGE) {
            const distance = this.distanceTo(other);
            const angle = Math.atan2(other.y - this.y, other.x - this.x);

            // Apply repulsion force within the interaction range
            const repulsionRange = 50; // Define the repulsion range
            if (distance < repulsionRange) {
                const force = REPULSION_FORCE / (distance * distance);
                this.dx -= force * Math.cos(angle);
                this.dy -= force * Math.sin(angle);
            }
        }
    });
}

    limitSpeed() {
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (speed > MAX_SPEED) {
            const factor = MAX_SPEED / speed;
            this.dx *= factor;
            this.dy *= factor;
        }
    }

    distanceTo(otherNode) {
        return Math.sqrt((this.x - otherNode.x) * (this.x - otherNode.x) + (this.y - otherNode.y) * (this.y - otherNode.y));
    }
}

function updateConnections() {
    lines = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].distanceTo(nodes[j]) <= CONNECT_RANGE) {
                const lineWidth = 1 + Math.max(0, 2 - nodes[i].distanceTo(nodes[j]) / CONNECT_RANGE);
                lines.push(new Line(nodes[i], nodes[j], lineWidth));
            }
        }
    }
}

class Line {
    constructor(startNode, endNode, lineWidth) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.lineWidth = lineWidth;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.startNode.x, this.startNode.y);
        ctx.lineTo(this.endNode.x, this.endNode.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }
}

function animate() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	canvasCenterX = canvas.width / 2;
	canvasCenterY = canvas.height / 2;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
    nodes.forEach(node => node.move());
    nodes.forEach(node => node.draw());
    updateConnections();
    lines.forEach(line => line.draw());
    requestAnimationFrame(animate);
}

function createNodes() {
    for (let i = 0; i < NODE_COUNT; i++) {
        const x = Math.random() * (canvas.width - 10) + 5; // prevent nodes from going off screen
        const y = Math.random() * (canvas.height - 10) + 5;
        const radius = 5 + Math.random() * 5;
        nodes.push(new Node(x, y, radius));
    }
}

createNodes();
animate();