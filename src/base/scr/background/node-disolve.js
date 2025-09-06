const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext('2d');

const NODE_COUNT = 50;
const CONNECT_RANGE = 100;
const INTERACTION_RANGE = 1000;
const MAX_SPEED = 2;
const REPULSION_FORCE = 100;
const REPULSION_RANGE = 100;
const ALIGNMENT_FORCE = 100;
const OVERLAP_FACTOR = 2;
const NODE_RADIUS_MIN = 5;
const NODE_RADIUS_MAX = 10;
let CENTER_ATTRACT_FORCE = 0.0001;
const MIN_CENTER_ATTRACT_FORCE = 0.0001;

let volumecapture = false;

const constraints = {
	audio: {
		echoCancellation: false,
		noiseSuppression: false,
		autoGainControl: false
	}
};

export function startVolumeCapture() {
	if (!volumecapture) {
		navigator.mediaDevices.getUserMedia(constraints).then(stream => {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const mediaStreamSource = audioContext.createMediaStreamSource(stream);

			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 32;
			let dataArray = new Uint8Array(analyser.frequencyBinCount);

			mediaStreamSource.connect(analyser);

			function updateVolume() {
				analyser.getByteFrequencyData(dataArray);

				let sum = 0;
				dataArray.forEach(val => sum += val);
				const volume = sum / dataArray.length;

				let targetForce = 1 / (volume * 100000);

				CENTER_ATTRACT_FORCE = isFinite(targetForce) ? targetForce : 0.00005;
				if (volumecapture) requestAnimationFrame(updateVolume);
				else {
					CENTER_ATTRACT_FORCE = MIN_CENTER_ATTRACT_FORCE;
					mediaStreamSource.disconnect();
				}
			}
			updateVolume();
		}).catch(error => { console.error('Error accessing microphone:', error); });

		volumecapture = true;
	}
}

export function stopVolumeCapture() {
	if (volumecapture) {
		volumecapture = false;
	}
}

function lerp(a, b, t) { return a + (b - a) * t; }

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasCenterX = canvas.width / 2;
let canvasCenterY = canvas.height / 2;

const nodes = [];
let lines = [];

const colors = [
	"#FF5733", "#C70039", "#900C3F", "#6900B0", "#4100C4",
	"#1E88E5", "#039BE5", "#00BCD4", "#009688", "#4CAF50"
];

function randomIntFromInterval(min, max) {
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
		this.mode = Math.random() < 0.3;
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

		this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
		this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
		this.applyForces();
		this.limitSpeed();
	}
	
	handleCenterAttraction() {
		const dx = canvasCenterX - this.x;
		const dy = canvasCenterY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance > 0) {
			const force = ((this.mode) ? CENTER_ATTRACT_FORCE : 0.0000001) * (distance * distance);
			this.dx += force * dx / distance;
			this.dy += force * dy / distance;
		}
	}

	handleWalls() {
		const wallThickness = 5;

		if (this.x + this.radius > canvas.width - wallThickness || this.x - this.radius < wallThickness) this.dx *= -0.8;
		if (this.y + this.radius > canvas.height - wallThickness || this.y - this.radius < wallThickness) this.dy *= -0.8;
	}


	applyForces() {
	nodes.forEach(other => {
		if (other !== this && this.distanceTo(other) < INTERACTION_RANGE) {
			const distance = this.distanceTo(other);
			const angle = Math.atan2(other.y - this.y, other.x - this.x);
			
			if (distance < REPULSION_RANGE) {
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
		const x = Math.random() * (canvas.width - 10) + 5;
		const y = Math.random() * (canvas.height - 10) + 5;
		const radius = 5 + Math.random() * 5;
		nodes.push(new Node(x, y, radius));
	}
}

createNodes();
animate();