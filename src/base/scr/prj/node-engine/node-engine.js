class Node {
    constructor(x, y, radius = 30, text = "Node") {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.text = text;
        this.inputs = [];
        this.outputs = [];
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "lightgray";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x, this.y);

        const connectorRadius = 5;
        const inputX = this.x - this.radius - 10;
        const outputX = this.x + this.radius + 10;
        const inputYStart = this.y - this.radius / 2;
        const outputYStart = this.y - this.radius / 2;

        for (let i = 0; i < this.inputs.length; i++) {
            ctx.beginPath();
            ctx.arc(inputX, inputYStart + i * 15, connectorRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "green";
            ctx.fill();
            ctx.stroke();
        }

        for (let i = 0; i < this.outputs.length; i++) {
            ctx.beginPath();
            ctx.arc(outputX, outputYStart + i * 15, connectorRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.stroke();
        }
    }

    addInput() {
        this.inputs.push(null);
    }

    addOutput() {
        this.outputs.push(null);
    }

    connect(outputNode, inputIndex) {
        if (outputNode instanceof Node && inputIndex >= 0 && inputIndex < outputNode.inputs.length) {
            this.outputs.push({ target: outputNode, inputIndex: inputIndex });
        }
    }
}

class NodeGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.nodes = [];
        this.selectedNode = null;
        this.isDragging = false;
        this.buttons = [];
        this.createButtons();
        this.animationFrameId = null;
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.redraw();
    }

    createButtons() {
        const buttonX = 20;
        const buttonY = 20;
        const buttonWidth = 80;
        const buttonHeight = 30;

        this.buttons.push({
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            text: "Add Node",
            action: () => this.handleAddNodeButtonClick()
        });
    }

    drawButtons() {
        for (const button of this.buttons) {
            this.ctx.fillStyle = "lightgray";
            this.ctx.fillRect(button.x, button.y, button.width, button.height);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect(button.x, button.y, button.width, button.height);

            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
        }
    }

    addNode(x, y) {
        const newNode = new Node(x, y);
        this.nodes.push(newNode);
        return newNode;
    }

    redraw() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const node of this.nodes) {
            node.draw(this.ctx);
        }
        this.drawConnections();
        this.drawButtons();
        this.animationFrameId = requestAnimationFrame(this.redraw.bind(this));
    }

    drawConnections() {
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 2;

        for (const sourceNode of this.nodes) {
            for (const connection of sourceNode.outputs) {
                if (connection && connection.target instanceof Node) {
                    const startX = sourceNode.x + sourceNode.radius + 10;
                    const startY = sourceNode.y - sourceNode.radius / 2 + connection.inputIndex * 15;

                    const endX = connection.target.x - connection.target.radius - 10;
                    const endY = connection.target.y - connection.target.radius / 2 + connection.inputIndex * 15;

                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            }
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= node.radius) {
                this.selectedNode = node;
                this.isDragging = true;
                node.offsetX = x - node.x;
                node.offsetY = y - node.y;
                break;
            }
        }

        for (const button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                button.action();
                break;
            }
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.selectedNode) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.selectedNode.x = x - this.selectedNode.offsetX;
            this.selectedNode.y = y - this.selectedNode.offsetY;
            this.redraw();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.selectedNode = null;
    }

    handleAddNodeButtonClick() {
        const x = 100;
        const y = 100;
        this.addNode(x, y);
    }

    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        this.stopAnimation();
        this.canvas.removeEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.removeEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.removeEventListener("mouseup", this.handleMouseUp.bind(this));
    }
}

// Example usage:
const canvas = document.getElementById("graph-visualizer"); // Make sure you have a canvas element with this ID
const nodeGraph = new NodeGraph(canvas);

// Example nodes and connections (you can add more):
const node1 = nodeGraph.addNode(50, 50);
node1.addOutput();
node1.addOutput();

const node2 = nodeGraph.addNode(250, 150);
node2.addInput();
node2.addInput();

node1.connect(node2, 0);
node1.connect(node2, 1);