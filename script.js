document.addEventListener('DOMContentLoaded', () => {
	const overlay = document.getElementById('transitionOverlay');
	setTimeout(() => { overlay.classList.add('shrink'); }, 100);
	const transitionLinks = document.querySelectorAll('.transition-link');
	transitionLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			const targetUrl = link.getAttribute('href');
			if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('mailto:')) {
				e.preventDefault();
				overlay.classList.remove('shrink');
				overlay.classList.add('grow');
				setTimeout(() => { window.location.href = targetUrl; }, 800);
			}
		});
	});
	const isBlogPage = document.querySelector('.blog-scroll-container') !== null;
	const cards = document.querySelectorAll('.floating-card');
	const padding = 80;
	let cardStates = [];
	let draggedCard = null;
	let highestZ = 10;
	if (!isBlogPage && cards.length > 0) {
		cards.forEach((card, index) => {
			const cardWidth = card.offsetWidth || 290;
			const cardHeight = card.offsetHeight || 230;
			const maxX = window.innerWidth - cardWidth - padding;
			const maxY = window.innerHeight - cardHeight - padding;
			const initialX = Math.random() * (maxX - padding) + padding;
			const initialY = Math.random() * (maxY - 120) + 120;
			const state = {
				id: index,
				element: card,
				x: initialX,
				y: initialY,
				w: cardWidth,
				h: cardHeight,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3,
				rotate: (Math.random() - 0.5) * 5,
				isDragging: false,
				offsetX: 0,
				offsetY: 0
			};
			cardStates.push(state);
			card.style.left = `0px`;
			card.style.top = `0px`;
			card.style.zIndex = index + 1;
			const startDrag = (e) => {
				draggedCard = state;
				state.isDragging = true;
				highestZ++;
				card.style.zIndex = highestZ;
				const clientX = e.clientX || (e.touches && e.touches.clientX);
				const clientY = e.clientY || (e.touches && e.touches.clientY);
				state.offsetX = clientX - state.x;
				state.offsetY = clientY - state.y;
				state.vx = 0;
				state.vy = 0;
			};
			card.addEventListener('mousedown', startDrag);
			card.addEventListener('touchstart', startDrag, { passive: true });
		});
		window.addEventListener('mousemove', (e) => {
			if (!draggedCard) return;
			draggedCard.x = e.clientX - draggedCard.offsetX;
			draggedCard.y = e.clientY - draggedCard.offsetY;
		});
		window.addEventListener('touchmove', (e) => {
			if (!draggedCard || !e.touches.length) return;
			draggedCard.x = e.touches.clientX - draggedCard.offsetX;
			draggedCard.y = e.touches.clientY - draggedCard.offsetY;
		}, { passive: false });
		const stopDrag = () => {
			if (draggedCard) {
				draggedCard.isDragging = false;
				draggedCard.vx = (Math.random() - 0.5) * 0.4;
				draggedCard.vy = (Math.random() - 0.5) * 0.4;
				draggedCard = null;
			}
		};
		window.addEventListener('mouseup', stopDrag);
		window.addEventListener('touchend', stopDrag);
	}
	function resolveCollisions() {
		if (isBlogPage || cardStates.length === 0) return;
		for (let i = 0; i < cardStates.length; i++) {
			let c1 = cardStates[i];
			c1.w = c1.element.offsetWidth || 290;
			c1.h = c1.element.offsetHeight || 230;
			for (let j = i + 1; j < cardStates.length; j++) {
				let c2 = cardStates[j];
				c2.w = c2.element.offsetWidth || 290;
				c2.h = c2.element.offsetHeight || 230;
				let c1CenterX = c1.x + c1.w / 2;
				let c1CenterY = c1.y + c1.h / 2;
				let c2CenterX = c2.x + c2.w / 2;
				let c2CenterY = c2.y + c2.h / 2;
				let dx = c2CenterX - c1CenterX;
				let dy = c2CenterY - c1CenterY;
				let minDistX = (c1.w + c2.w) / 2 + 15;
				let minDistY = (c1.h + c2.h) / 2 + 15;
				if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
					let overlapX = minDistX - Math.abs(dx);
					let overlapY = minDistY - Math.abs(dy);
					if (overlapX < overlapY) {
						let pushX = overlapX * 0.05;
						if (dx > 0) {
							if (!c2.isDragging) c2.x += pushX;
							if (!c1.isDragging) c1.x -= pushX;
						} else {
							if (!c2.isDragging) c2.x -= pushX;
							if (!c1.isDragging) c1.x += pushX;
						}
						let temp = c1.vx; c1.vx = c2.vx; c2.vx = temp;
					} else {
						let pushY = overlapY * 0.05;
						if (dy > 0) {
							if (!c2.isDragging) c2.y += pushY;
							if (!c1.isDragging) c1.y -= pushY;
						} else {
							if (!c2.isDragging) c2.y -= pushY;
							if (!c1.isDragging) c1.y += pushY;
						}
						let temp = c1.vy; c1.vy = c2.vy; c2.vy = temp;
					}
				}
			}
		}
	}
	function moveCards() {
		if (isBlogPage || cardStates.length === 0) return;
		resolveCollisions();
		cardStates.forEach((state) => {
			if (!state.isDragging) {
				state.x += state.vx;
				state.y += state.vy;
			}
			const maxX = window.innerWidth - state.w - padding;
			const maxY = window.innerHeight - state.h - 90;
			if (state.x <= padding) { state.vx = Math.abs(state.vx); state.x = padding; }
			if (state.x >= maxX) { state.vx = -Math.abs(state.vx); state.x = maxX; }
			if (state.y <= 90) { state.vy = Math.abs(state.vy); state.y = 90; }
			if (state.y >= maxY) { state.vy = -Math.abs(state.vy); state.y = maxY; }
			state.element.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.rotate}deg)`;
		});
	}
	const canvas = document.getElementById('bgCanvas');
	if (canvas) {
		const ctx = canvas.getContext('2d');
		let particles = [];
		const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
		const connectionDistance = 110; 
		let mouse = { x: null, y: null, radius: 140 };
		window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
		window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
		function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);
		class Particle {
			constructor() {
				this.x = Math.random() * canvas.width;
				this.y = Math.random() * canvas.height;
				this.baseX = this.x;
				this.baseY = this.y;
				this.size = Math.random() * 1.5 + 1;
				this.vx = (Math.random() - 0.5) * 0.3;
				this.vy = (Math.random() - 0.5) * 0.3;
			}
			update() {
				this.baseX += this.vx; this.baseY += this.vy;
				if (this.baseX < 0 || this.baseX > canvas.width) this.vx *= -1;
				if (this.baseY < 0 || this.baseY > canvas.height) this.vy *= -1;
				if (mouse.x !== null && mouse.y !== null) {
					let dx = mouse.x - this.x;
					let dy = mouse.y - this.y;
					let distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < mouse.radius) {
						let force = (mouse.radius - distance) / mouse.radius;
						this.x -= (dx / distance) * force * 5;
						this.y -= (dy / distance) * force * 5;
						return;
					}
				}
				this.x += (this.baseX - this.x) * 0.08;
				this.y += (this.baseY - this.y) * 0.08;
			}
			draw() {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
				ctx.fill();
			}
		}
		function initParticles() {
			particles = [];
			for (let i = 0; i < particleCount; i++) particles.push(new Particle());
		}
		initParticles();
		function drawLines() {
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					let dx = particles[i].x - particles[j].x;
					let dy = particles[i].y - particles[j].y;
					let distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < connectionDistance) {
						let opacity = (connectionDistance - distance) / connectionDistance * 0.1;
						ctx.strokeStyle = 'rgba(255, 255, 255, ${opacity})';
						ctx.lineWidth = 0.6;
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.stroke();
					}
				}
			}
		}
	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach(p => {
			p.update();
			p.draw();
		});
		drawLines();
		moveCards();
		requestAnimationFrame(animate);
	}
requestAnimationFrame(animate);
}});
