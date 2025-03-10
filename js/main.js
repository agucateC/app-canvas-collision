const canvas = document.getElementById("canvas");
const startButton = document.getElementById("startButton");
let ctx = canvas.getContext("2d");

const window_height = 300;
const window_width = 500;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

const numCircles = 5; // Número de círculos
const circles = [];

const collisionSound = new Audio('sonido/col.mp3');
let animationRunning = false;

class Circle {
    constructor(radius, color, text, speed) {
        let position = getValidPosition(radius);
        this.posX = position.x;
        this.posY = position.y;
        this.radius = radius;
        this.color = color;
        this.borderColor = "black"; 
        this.text = text;
        this.speed = speed;

        let angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.strokeStyle = this.borderColor;
        context.lineWidth = 3;
        context.stroke();
        context.closePath();

        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    update(context) {
        this.draw(context);

        let bounced = false;

        if ((this.posX + this.radius) >= window_width || (this.posX - this.radius) <= 0) {
            this.dx = -this.dx + (Math.random() - 0.5) * 0.5; // Variar dirección tras rebote
            bounced = true;
        }
        if ((this.posY + this.radius) >= window_height || (this.posY - this.radius) <= 0) {
            this.dy = -this.dy + (Math.random() - 0.5) * 0.5; // Variar dirección tras rebote
            bounced = true;
        }

        if (bounced) {
            collisionSound.currentTime = 0;
            collisionSound.play();
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }

    reverseDirection() {
        this.dx = -this.dx + (Math.random() - 0.5) * 0.5;
        this.dy = -this.dy + (Math.random() - 0.5) * 0.5;
    }

    changeColor() {
        this.color = getRandomColor();
        this.borderColor = getRandomColor();
    }
}

function detectCollision(circle1, circle2) {
    let dx = circle1.posX - circle2.posX;
    let dy = circle1.posY - circle2.posY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
}

function getRandomColor() {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

function getValidPosition(radius) {
    let position;
    let isValid;
    
    do {
        isValid = true;
        position = {
            x: Math.random() * (window_width - 2 * radius) + radius,
            y: Math.random() * (window_height - 2 * radius) + radius
        };

        for (let circle of circles) {
            if (detectCollision({ posX: position.x, posY: position.y, radius: radius }, circle)) {
                isValid = false;
                break;
            }
        }
    } while (!isValid);

    return position;
}

// Crear los círculos
for (let i = 0; i < numCircles; i++) {
    let radius = Math.floor(Math.random() * 20) + 20;
    let speed = Math.random() * 2 + 1;
    let circle = new Circle(radius, getRandomColor(), (i + 1).toString(), speed);
    circles.push(circle);
}

function updateCircles() {
    if (!animationRunning) return;
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);

    // Detectar colisiones entre todos los círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (detectCollision(circles[i], circles[j])) {
                circles[i].reverseDirection();
                circles[j].reverseDirection();
                circles[i].changeColor();
                circles[j].changeColor();
                canvas.style.background = getRandomColor();

                // Reproducir sonido al detectar colisión entre círculos
                collisionSound.currentTime = 0;
                collisionSound.play();
            }
        }
    }

    circles.forEach(circle => circle.update(ctx));
}

startButton.addEventListener("click", () => {
    if (!animationRunning) {
        animationRunning = true;
        updateCircles();
    }
});



