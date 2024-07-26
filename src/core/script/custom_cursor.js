const lerp = (a, b, t) => (1 - t)* a + t * b

const mouse = {
	current_x_position : 0,
	current_y_position : 0,
	target_x_position : 0,
	target_y_position : 0,
	x_speed : 0,
	y_speed : 0,
	hover : false,
	top : 0,
	left : 0,
	width : 0,
	height : 0
}

const $cursor = document.querySelector(".cursor_zone")
const interactable_link = document.querySelectorAll("[data-link]")

const mouse_function = (e) => {
	if (!mouse.hover) { 
		mouse.target_x_position = e.clientX || e.touches[0].clientX
		mouse.target_y_position = e.clientY || e.touches[0].clientY
	}
}

window.addEventListener("mousemove", mouse_function)
window.addEventListener("touchstart", mouse_function)
window.addEventListener("touchmove", mouse_function)

let timer

interactable_link.forEach((link) => {
	link.addEventListener("mouseenter", () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			$cursor.classList.add("hover")
			mouse.hover = true
			const { x, y, width, height } = link.getBoundingClientRect()
			mouse.target_x_position = x - 15
			mouse.target_y_position = y + 8
			mouse.width = width + 30
			mouse.height = height + 10
		}, 100)
	})
	link.addEventListener("mouseleave", () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			$cursor.classList.remove("hover")
			mouse.hover = false
		}, 100)
	})
});

const request_animation_frame = () => {
	mouse.current_x_position = lerp(mouse.current_x_position, mouse.target_x_position, 1.2)
	mouse.current_y_position = lerp(mouse.current_y_position, mouse.target_y_position, 1.2)
	
	mouse.x_speed = lerp(mouse.x_speed, mouse.target_x_position - mouse.current_x_position, 1.2)
	mouse.y_speed = lerp(mouse.y_speed, mouse.target_y_position - mouse.current_y_position, 1.2)
	
	const speed = Math.abs(mouse.x_speed) > Math.abs(mouse.y_speed) ? mouse.x_speed : -mouse.y_speed
	
	let style
	
	if (!mouse.hover)
	{
		style = {
			width : "30px",
			height : "30px",
			marginLeft : "-15px",
			marginRight : "-15px",
			transform : `
				translate(${mouse.current_x_position}px, ${mouse.current_y_position}px)
				rotate(${45 - speed * 0.2}deg)
				scale(${1 - Math.abs(speed) * 0.001})`
		}
	}
	else {
		style = {
			width : `${mouse.width}px`,
			height : `${mouse.height}px`,
			marginLeft : 0,
			marginRight : 0,
			transform :`
				translate(${mouse.current_x_position}px, ${mouse.current_y_position}px)
				rotate(0deg)
				scale(${1 - Math.abs(speed) * 0.001})`
		}
	}
	Object.assign($cursor.style, style)
	requestAnimationFrame(request_animation_frame)
}
request_animation_frame()