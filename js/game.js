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

// 19 UNIQUE Interactive objects in STRICT LEFT-TO-RIGHT ORDER
// Player starts at x=160, items placed linearly across world
// Y position: 110 (middle of grass area, STATIC - no vertical movement)
const interactables = [
    // Line 0: "your life is your life"
    { x: 250, y: 110, type: 'signpost', lineIndex: 0, discovered: false },

    // Line 1: "don't let it be clubbed into dank submission"
    { x: 400, y: 110, type: 'cairn', lineIndex: 1, discovered: false },

    // Line 2: "be on the watch"
    { x: 550, y: 110, type: 'hiker', lineIndex: 2, discovered: false },

    // Line 3: "there are ways out"
    { x: 700, y: 110, type: 'plane_wreck', lineIndex: 3, discovered: false },

    // Line 4: "there is a light somewhere"
    { x: 850, y: 110, type: 'lighthouse', lineIndex: 4, discovered: false },

    // Line 5: "it may not be much light but"
    { x: 1000, y: 110, type: 'weather_station', lineIndex: 5, discovered: false },

    // Line 6: "it beats the darkness"
    { x: 1150, y: 110, type: 'geothermal_vent', lineIndex: 6, discovered: false },

    // Line 7: "be on the watch"
    { x: 1300, y: 110, type: 'telescope', lineIndex: 7, discovered: false },

    // Line 8: "the gods will offer you chances"
    { x: 1450, y: 110, type: 'viking_statue', lineIndex: 8, discovered: false },

    // Line 9: "know them"
    { x: 1600, y: 110, type: 'tourist', lineIndex: 9, discovered: false },

    // Line 10: "take them"
    { x: 1750, y: 110, type: 'globe', lineIndex: 10, discovered: false },

    // Line 11: "you can't beat death but"
    { x: 1900, y: 110, type: 'ice_sculpture', lineIndex: 11, discovered: false },

    // Line 12: "you can beat death in life, sometimes"
    { x: 2050, y: 110, type: 'flag_pole', lineIndex: 12, discovered: false },

    // Line 13: "and the more often you learn to do it"
    { x: 2200, y: 110, type: 'abandoned_car', lineIndex: 13, discovered: false },

    // Line 14: "the more light there will be"
    { x: 2350, y: 110, type: 'bench', lineIndex: 14, discovered: false },

    // Line 15: "your life is your life"
    { x: 2500, y: 110, type: 'ruins', lineIndex: 15, discovered: false },

    // Line 16: "know it while you have it"
    { x: 2650, y: 110, type: 'whale_bones', lineIndex: 16, discovered: false },

    // Line 17: "you are marvelous"
    { x: 2800, y: 110, type: 'hot_spring', lineIndex: 17, discovered: false },

    // Line 18: "the gods wait to delight in you"
    { x: 2950, y: 110, type: 'viewpoint', lineIndex: 18, discovered: false }
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
    x: 160,  // X position in world
    y: 110,  // Y position in world (middle of grass area)
    w: 12,
    h: 18,
    vx: 0,
    vy: 0,
    speed: 1.5,
    facing: 'right', // down, up, left, right
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

        // Side-scroller movement: left/right for world, up/down within grass bounds
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

        // Move player
        player.x += player.vx;
        player.y += player.vy;

        // HARD Y-AXIS BOUNDARIES (grass midground only)
        // Grass layer is at gameState.height * 0.5 to 0.8
        // In pixel coordinates at 180px height: 90px to 144px
        let grassTop = 95;      // Can't walk into mountains
        let grassBottom = 135;   // Can't walk into sea

        if (player.y < grassTop) player.y = grassTop;
        if (player.y > grassBottom) player.y = grassBottom;

        // X-axis bounds (world extends horizontally)
        let worldWidth = 3200;  // Wide horizontal world
        if (player.x < 0) player.x = 0;
        if (player.x > worldWidth) player.x = worldWidth;

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
        // SIDE-SCROLLER CAMERA: Follow X only, Y is fixed
        let worldWidth = 3200;

        let targetCameraX = player.x - gameState.width / 2;

        // Clamp camera to world bounds (X only)
        targetCameraX = Math.max(0, Math.min(worldWidth - gameState.width, targetCameraX));

        // Smooth camera movement (X only)
        gameState.cameraX += (targetCameraX - gameState.cameraX) * 0.1;

        // Y camera is FIXED (no vertical scrolling)
        gameState.cameraY = 0;

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
    player.y = 110;
    player.facing = 'right';

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
