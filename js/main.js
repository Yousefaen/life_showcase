/**
 * Main entry point and initialization
 */

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize renderer
let renderer = null;

// Set up canvas resolution
function initCanvas() {
    canvas.width = gameState.width;
    canvas.height = gameState.height;
    renderer = new Renderer(ctx);
}

// Input handling
window.addEventListener('keydown', (e) => {
    // Prevent default browser behavior for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;
    handleInteraction(e.key);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls setup
function setupTouchControls() {
    // D-pad buttons
    document.querySelectorAll('.d-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-key');
            keys[key] = true;
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-key');
            keys[key] = false;
        });
    });

    // Action button
    const actionBtn = document.querySelector('.action-btn');
    actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['Enter'] = true;
        handleInteraction('Enter');
    });

    actionBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['Enter'] = false;
    });
}

// Start game function
function startGame() {
    const startScreen = document.getElementById('start-screen');
    startScreen.style.opacity = '0';
    startScreen.style.transition = 'opacity 0.5s';

    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 500);

    // Initialize audio
    audio.init();
    audio.resume();

    // Initialize canvas
    initCanvas();

    // Start game state
    gameState.started = true;

    // Play ambient sound
    audio.playSound('ambient');

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(currentTime) {
    // Update game logic
    game.update(currentTime);

    // Render
    if (renderer) {
        renderer.render();
    }

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Initialize on page load
window.addEventListener('load', () => {
    setupTouchControls();

    // Start button
    document.getElementById('startBtn').addEventListener('click', () => {
        startGame();
    });

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        restartGame();
    });

    // Also allow Enter key to start
    window.addEventListener('keydown', (e) => {
        if (!gameState.started && (e.key === 'Enter' || e.key === ' ')) {
            startGame();
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    // Canvas scaling is handled by CSS, but we might want to adjust UI
});

// Prevent context menu on right-click (for mobile long-press)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent scrolling on mobile
document.body.addEventListener('touchmove', (e) => {
    if (gameState.started) {
        e.preventDefault();
    }
}, { passive: false });
