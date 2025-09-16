document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');

    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 7;

    // Game state
    let gameRunning = false;
    let gameOver = false;
    let score = 0;
    let animationId;

    // Snake initial position and velocity
    let snake = [{ x: 10, y: 10 }];
    let velocityX = 0;
    let velocityY = 0;

    // Food initial position
    let foodX;
    let foodY;

    // Colors
    const snakeColor = '#00ffcc';
    const snakeHeadColorStart = '#00ffcc';
    const snakeHeadColorEnd = '#0066ff';
    const foodColor = '#ff0044';
    const gridColor = '#333';

    // Food pulse animation state
    let foodPulse = 0;
    let pulseDirection = 1;

    // Initialize game
    function initGame() {
        snake = [{ x: 10, y: 10 }];
        velocityX = 0;
        velocityY = 0;
        score = 0;
        speed = 7;
        scoreElement.textContent = score;
        gameOver = false;
        gameRunning = false;
        foodPulse = 0;
        pulseDirection = 1;
        generateFood();
    }

    // Generate random food position
    function generateFood() {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);

        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                generateFood();
                return;
            }
        }
    }

    // Animate the food pulse
    function animateFood() {
        foodPulse += 0.02 * pulseDirection;
        if (foodPulse > 0.1 || foodPulse < -0.1) {
            pulseDirection *= -1;
        }
    }

    // Draw food with pulse animation
    function drawFood() {
        ctx.fillStyle = foodColor;
        ctx.save();
        ctx.translate((foodX + 0.5) * gridSize, (foodY + 0.5) * gridSize);
        ctx.scale(1 + foodPulse, 1 + foodPulse);
        ctx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize);
        ctx.restore();
    }

    // Draw grid lines
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;

        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }

    // Move snake
    function moveSnake() {
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        snake.unshift(head);

        if (head.x === foodX && head.y === foodY) {
            score += 10;
            generateFood();
            if (score % 50 === 0) {
                speed += 1;
            }
        } else {
            snake.pop();
        }
    }

    // Draw snake with gradient head
    function drawSnake() {
        snake.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;

            if (index === 0) {
                let gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
                gradient.addColorStop(0, snakeHeadColorStart);
                gradient.addColorStop(1, snakeHeadColorEnd);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = snakeColor;
            }

            ctx.fillRect(x, y, gridSize, gridSize);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
        });
    }

    // Check collisions
    function checkCollisions() {
        const head = snake[0];

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            gameRunning = false;
        }

        for (let i = 4; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                gameRunning = false;
            }
        }
    }

    // Draw game over screen
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '30px Orbitron, Arial';
        ctx.fillStyle = '#00ffcc';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '20px Orbitron, Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.font = '16px Orbitron, Arial';
        ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 50);
    }

    // Main game loop
    function gameLoop() {
        if (gameOver) {
            drawGameOver();
            return;
        }

        if (!gameRunning) return;

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid();

        animateFood();
        drawFood();

        moveSnake();
        drawSnake();

        checkCollisions();

        scoreElement.textContent = score;

        animationId = setTimeout(() => {
            requestAnimationFrame(gameLoop);
        }, 1000 / speed);
    }

    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if ([37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }

        if (!gameRunning) return;

        if (e.keyCode === 37 && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (e.keyCode === 38 && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (e.keyCode === 39 && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        } else if (e.keyCode === 40 && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        }
    });

    // Start button
    startButton.addEventListener('click', () => {
        if (!gameRunning && !gameOver) {
            gameRunning = true;
            velocityX = 1;
            velocityY = 0;
            gameLoop();
        }
    });

    // Restart button
    restartButton.addEventListener('click', () => {
        if (animationId) {
            clearTimeout(animationId);
        }
        initGame();
        gameRunning = true;
        velocityX = 1;
        velocityY = 0;
        gameLoop();
    });

    // Initialize game
    initGame();
    gameLoop(); // Draw initial state
});
