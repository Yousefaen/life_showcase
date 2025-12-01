/**
 * Game Logic and State Management
 */

// Poem lines from "The Laughing Heart" by Charles Bukowski
const poemLines = [
    "your life is your life",
    "don't let it be clubbed into dank submission.",
    "be on the watch.",
    "there are ways out.",
    "there is a light somewhere.",
    "it may not be much light but",
    "it beats the darkness.",
    "be on the watch.",
    "the gods will offer you chances.",
    "know them.",
    "take them.",
    "you can't beat death but",
    "you can beat death in life, sometimes.",
    "and the more often you learn to do it,",
    "the more light there will be.",
    "your life is your life.",
    "know it while you have it.",
    "you are marvelous",
    "the gods wait to delight in you."
];

// Interactive objects scattered across 2D world (800x600)
const interactables = [
    { x: 120, y: 450, type: 'stone', lineIndex: 0, discovered: false },
    { x: 250, y: 320, type: 'candle', lineIndex: 1, discovered: false },
    { x: 180, y: 180, type: 'sign', lineIndex: 2, discovered: false },
    { x: 380, y: 420, type: 'flower', lineIndex: 3, discovered: false },
    { x: 450, y: 250, type: 'torch', lineIndex: 4, discovered: false },
    { x: 320, y: 90, type: 'book', lineIndex: 5, discovered: false },
    { x: 580, y: 380, type: 'crystal', lineIndex: 6, discovered: false },
    { x: 520, y: 150, type: 'mirror', lineIndex: 7, discovered: false },
    { x: 680, y: 480, type: 'statue', lineIndex: 8, discovered: false },
    { x: 420, y: 520, type: 'person', lineIndex: 9, discovered: false },
    { x: 620, y: 220, type: 'person', lineIndex: 10, discovered: false },
    { x: 150, y: 520, type: 'person', lineIndex: 11, discovered: false },
    { x: 720, y: 320, type: 'tree', lineIndex: 12, discovered: false },
    { x: 280, y: 560, type: 'star', lineIndex: 13, discovered: false },
    { x: 550, y: 70, type: 'fountain', lineIndex: 14, discovered: false },
    { x: 760, y: 180, type: 'heart', lineIndex: 15, discovered: false },
    { x: 670, y: 560, type: 'sun', lineIndex: 16, discovered: false },
    { x: 90, y: 280, type: 'crown', lineIndex: 17, discovered: false },
    { x: 740, y: 80, type: 'light', lineIndex: 18, discovered: false }
];

// Game state
const gameState = {
    started: false,
    width: 320,
    height: 180,
    cameraX: 0,
    cameraY: 0,
    cameraShake: 0,
    screenFlash: 0,
    poemIndex: 0,
    linesDiscovered: 0,
    textTyping: false,
    textTimer: 0,
    currentText: "",
    targetText: "",
    chapter: 0,
    nearestInteractable: null,
    showInteractPrompt: false,
    hintPulse: 0
};

// Player state
const player = {
    x: 160,
    y: 90,
    w: 12,
    h: 18,
    vx: 0,
    vy: 0,
    speed: 1.5,
    facing: 'down', // down, up, left, right
    frame: 0,
    animTimer: 0,
    stepSoundTimer: 0
};

// Particles system
let particles = [];

// Input state
const keys = {};

class Game {
    constructor() {
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    updatePlayer(delta) {
        player.vx = 0;
        player.vy = 0;

        // RPG-style 4-direction movement
        if (keys['ArrowRight']) {
            player.vx = player.speed;
            player.facing = 'right';
        }
        if (keys['ArrowLeft']) {
            player.vx = -player.speed;
            player.facing = 'left';
        }
        if (keys['ArrowUp']) {
            player.vy = -player.speed;
            player.facing = 'up';
        }
        if (keys['ArrowDown']) {
            player.vy = player.speed;
            player.facing = 'down';
        }

        // Diagonal movement normalization
        if (player.vx !== 0 && player.vy !== 0) {
            player.vx *= 0.707; // 1/sqrt(2)
            player.vy *= 0.707;
        }

        // Bounds checking (world size)
        let worldWidth = 800;
        let worldHeight = 600;

        if (player.x < 0) player.x = 0;
        if (player.x > worldWidth) player.x = worldWidth;
        if (player.y < 0) player.y = 0;
        if (player.y > worldHeight) player.y = worldHeight;

        // Move player
        player.x += player.vx;
        player.y += player.vy;

        // Walking animation
        if (player.vx !== 0 || player.vy !== 0) {
            player.animTimer++;
            if (player.animTimer > 8) {
                player.frame = (player.frame + 1) % 2;
                player.animTimer = 0;

                // Footstep sound
                player.stepSoundTimer++;
                if (player.stepSoundTimer > 15) {
                    audio.playSound('step');
                    player.stepSoundTimer = 0;
                }
            }
        } else {
            player.frame = 0;
            player.stepSoundTimer = 0;
        }
    }

    checkInteractions() {
        // Find nearest interactable (using 2D distance)
        let nearest = null;
        let minDist = 30; // Interaction range

        for (let obj of interactables) {
            if (obj.discovered) continue;

            let dx = player.x - obj.x;
            let dy = player.y - obj.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        }

        gameState.nearestInteractable = nearest;
        gameState.showInteractPrompt = nearest !== null;

        // Check for interaction key press
        if ((keys['Enter'] || keys['z']) && nearest && !gameState.textTyping) {
            this.discoverPoemLine(nearest);
            keys['Enter'] = false;
            keys['z'] = false;
        }
    }

    discoverPoemLine(obj) {
        obj.discovered = true;
        gameState.linesDiscovered++;
        showText(poemLines[obj.lineIndex]);
        audio.playSound('discovery');

        // Camera shake effect
        gameState.cameraShake = 8;

        // Screen flash effect
        gameState.screenFlash = 1.0;

        // Create sparkle particles at discovery - more dramatic
        for (let i = 0; i < 25; i++) {
            particles.push({
                x: obj.x + (Math.random() - 0.5) * 10,
                y: obj.y - 10 + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -1 - Math.random() * 3,
                life: 1.0,
                color: gameState.chapter >= 2 ? '#FFD700' : '#87CEEB',
                size: 2 + Math.random() * 3
            });
        }

        // Create expanding ring particles
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            particles.push({
                x: obj.x,
                y: obj.y - 10,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 0.8,
                color: '#FFFFFF',
                size: 2
            });
        }
    }

    updateChapter() {
        // Determine chapter based on discoveries (not position)
        let discovered = gameState.linesDiscovered;

        if (discovered >= 15) gameState.chapter = 3; // Golden
        else if (discovered >= 10) gameState.chapter = 2; // Crowd
        else if (discovered >= 5) gameState.chapter = 1; // Fireflies
        else gameState.chapter = 0; // Dark
    }

    updateParticles(delta) {
        // Spawn ambient particles based on chapter
        if (gameState.chapter >= 1 && Math.random() < 0.08) {
            particles.push({
                x: gameState.cameraX + Math.random() * gameState.width,
                y: Math.random() * 140,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -0.3 - Math.random() * 0.5,
                life: 1.0,
                color: gameState.chapter === 3 ? '#FFD700' : '#87CEEB',
                size: 1 + Math.random()
            });
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    updateCamera() {
        // Smooth camera follow (center on player)
        let worldWidth = 800;
        let worldHeight = 600;

        let targetCameraX = player.x - gameState.width / 2;
        let targetCameraY = player.y - gameState.height / 2;

        // Clamp camera to world bounds
        targetCameraX = Math.max(0, Math.min(worldWidth - gameState.width, targetCameraX));
        targetCameraY = Math.max(0, Math.min(worldHeight - gameState.height, targetCameraY));

        // Smooth camera movement
        gameState.cameraX += (targetCameraX - gameState.cameraX) * 0.1;
        gameState.cameraY += (targetCameraY - gameState.cameraY) * 0.1;

        // Camera shake decay
        if (gameState.cameraShake > 0) {
            gameState.cameraShake *= 0.9;
            if (gameState.cameraShake < 0.1) gameState.cameraShake = 0;
        }

        // Screen flash decay
        if (gameState.screenFlash > 0) {
            gameState.screenFlash *= 0.85;
            if (gameState.screenFlash < 0.01) gameState.screenFlash = 0;
        }

        // Hint pulse
        gameState.hintPulse += 0.05;
    }

    update(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!gameState.started) return;

        // Only update game logic if not in dialogue
        if (document.getElementById('text-box').style.display !== 'block') {
            this.updatePlayer(this.deltaTime);
            this.checkInteractions();
        }

        this.updateChapter();
        this.updateParticles(this.deltaTime);
        this.updateCamera();

        // Update text typing
        if (gameState.textTyping) {
            gameState.textTimer++;
            if (gameState.textTimer % 2 === 0) {
                if (gameState.currentText.length < gameState.targetText.length) {
                    gameState.currentText += gameState.targetText[gameState.currentText.length];
                    document.getElementById('text-content').innerText = gameState.currentText;
                    audio.playSound('voice');
                } else {
                    gameState.textTyping = false;
                    document.getElementById('next-indicator').style.display = 'block';
                }
            }
        }
    }
}

// Text box management
function showText(text) {
    const textBox = document.getElementById('text-box');
    const nextIndicator = document.getElementById('next-indicator');

    textBox.style.display = 'block';
    nextIndicator.style.display = 'none';
    gameState.targetText = "* " + text;
    gameState.currentText = "";
    gameState.textTyping = true;
    gameState.textTimer = 0;
}

function handleInteraction(key) {
    if (!gameState.started) return;

    if ((key === 'Enter' || key === 'z' || key === ' ') && gameState.textTyping) {
        // Skip to end of text
        gameState.currentText = gameState.targetText;
        gameState.textTyping = false;
        document.getElementById('text-content').innerText = gameState.currentText;
        document.getElementById('next-indicator').style.display = 'block';
    } else if ((key === 'Enter' || key === 'z' || key === ' ') && !gameState.textTyping) {
        const textBox = document.getElementById('text-box');
        if (textBox.style.display === 'block') {
            // Close text box
            textBox.style.display = 'none';
            document.getElementById('next-indicator').style.display = 'none';

            // Check for ending
            if (gameState.linesDiscovered >= poemLines.length) {
                setTimeout(() => {
                    showCompletionScreen();
                }, 1000);
            }
        }
    }
}

function showCompletionScreen() {
    const completionScreen = document.getElementById('completion-screen');
    completionScreen.style.display = 'flex';
    audio.playSound('sparkle');

    // Create final particle burst
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: gameState.cameraX + gameState.width / 2,
            y: gameState.height / 2,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color: '#FFD700',
            size: 2 + Math.random() * 3
        });
    }
}

function restartGame() {
    // Reset game state
    gameState.linesDiscovered = 0;
    gameState.chapter = 0;
    gameState.cameraX = 0;
    gameState.cameraY = 0;
    player.x = 160;
    player.y = 90;
    player.facing = 'down';

    // Reset all interactables
    for (let obj of interactables) {
        obj.discovered = false;
    }

    // Hide completion screen
    document.getElementById('completion-screen').style.display = 'none';

    // Clear particles
    particles = [];
}

// Export game instance
const game = new Game();
