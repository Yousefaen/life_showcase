/**
 * Rendering Engine - All drawing functions
 */

class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    clear() {
        this.ctx.clearRect(0, 0, gameState.width, gameState.height);
    }

    applyShake() {
        if (gameState.cameraShake > 0) {
            this.shakeOffsetX = (Math.random() - 0.5) * gameState.cameraShake;
            this.shakeOffsetY = (Math.random() - 0.5) * gameState.cameraShake;
            this.ctx.save();
            this.ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
        }
    }

    removeShake() {
        if (gameState.cameraShake > 0) {
            this.ctx.restore();
        }
    }

    drawBackground() {
        // Background color based on chapter
        let bgColor = '#050505'; // Dark
        if (gameState.chapter === 3) bgColor = '#1a1a0d'; // Golden tint
        else if (gameState.chapter === 2) bgColor = '#0a0a0a';
        else if (gameState.chapter === 1) bgColor = '#080808';

        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, gameState.width, gameState.height);
    }

    drawGround() {
        // Ground
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 148, gameState.width, 32);

        // Ground details
        this.ctx.fillStyle = '#111';
        for (let i = 0; i < 20; i++) {
            let x = (i * 50 - gameState.cameraX % 50);
            this.ctx.fillRect(x, 148, 2, 32);
        }
    }

    drawEnvironment() {
        const camX = gameState.cameraX;

        // Pillars in dark chapter
        if (gameState.chapter <= 1) {
            this.ctx.fillStyle = '#0d0d0d';
            for (let i = 0; i < 8; i++) {
                let px = 100 + i * 180 - camX;
                if (px > -50 && px < gameState.width + 50) {
                    this.ctx.fillRect(px, 40, 25, 108);
                    // Pillar shadow
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(px + 25, 40, 3, 108);
                    this.ctx.fillStyle = '#0d0d0d';
                }
            }
        }

        // Torches/lights
        if (gameState.chapter >= 1) {
            for (let i = 0; i < 20; i++) {
                let lx = 400 + i * 150 - camX;
                if (lx > -20 && lx < gameState.width + 20) {
                    // Post
                    this.ctx.fillStyle = '#333';
                    this.ctx.fillRect(lx, 100, 4, 48);

                    // Flame
                    let flicker = 0.6 + Math.random() * 0.4;
                    this.ctx.fillStyle = `rgba(255, 180, 50, ${flicker})`;
                    this.ctx.beginPath();
                    this.ctx.arc(lx + 2, 98, 5 + Math.random() * 3, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Glow
                    let gradient = this.ctx.createRadialGradient(lx + 2, 98, 0, lx + 2, 98, 20);
                    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
                    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(lx - 18, 78, 40, 40);
                }
            }
        }

        // The crowd/gods
        if (gameState.chapter >= 2) {
            for (let i = 0; i < 15; i++) {
                let nx = 1400 + i * 80 - camX;
                if (nx > -30 && nx < gameState.width + 30) {
                    this.drawNPC(nx, 136, i % 3);
                }
            }
        }

        // Final light
        if (gameState.chapter === 3) {
            let endX = 3000 - camX;
            let gradient = this.ctx.createRadialGradient(endX, 80, 10, endX, 80, 300);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, gameState.width, gameState.height);
        }
    }

    drawNPC(x, y, variant) {
        // Simple humanoid figures
        this.ctx.save();

        let colors = ['#888', '#aaa', '#666'];
        this.ctx.fillStyle = colors[variant];

        // Head
        this.ctx.beginPath();
        this.ctx.arc(x, y - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Body
        this.ctx.fillRect(x - 3, y - 4, 6, 10);

        // Arms (slightly animated)
        let armOffset = Math.sin(Date.now() / 500 + variant) * 2;
        this.ctx.fillRect(x - 5, y - 2 + armOffset, 2, 6);
        this.ctx.fillRect(x + 3, y - 2 - armOffset, 2, 6);

        this.ctx.restore();
    }

    drawInteractables() {
        for (let obj of interactables) {
            let screenX = obj.x - gameState.cameraX;

            if (screenX < -30 || screenX > gameState.width + 30) continue;

            if (obj.discovered) {
                // Draw faded/discovered state
                this.ctx.globalAlpha = 0.3;
            } else {
                // Pulse effect for undiscovered items
                let pulse = Math.sin(gameState.hintPulse + obj.x * 0.01) * 0.1 + 1.0;
                this.ctx.globalAlpha = pulse * 0.9;
            }

            this.drawInteractable(screenX, obj.y, obj.type);

            // Interaction prompt - enhanced
            if (gameState.nearestInteractable === obj && !obj.discovered) {
                let promptAlpha = 0.8 + Math.sin(Date.now() / 200) * 0.2;
                this.ctx.globalAlpha = promptAlpha;
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '14px VT323';
                this.ctx.textAlign = 'center';

                // Add shadow to text
                this.ctx.shadowColor = '#000';
                this.ctx.shadowBlur = 4;
                this.ctx.fillText('[Z]', screenX, obj.y - 22);
                this.ctx.shadowBlur = 0;

                // Enhanced glowing effect with multiple rings
                for (let i = 3; i > 0; i--) {
                    let ringAlpha = 0.2 - (i * 0.05);
                    let ringSize = 15 + i * 5 + Math.sin(Date.now() / 300) * 3;
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${ringAlpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, obj.y - 10, ringSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Sparkle particles around interactable
                for (let i = 0; i < 4; i++) {
                    let angle = (Date.now() / 500 + i * Math.PI / 2);
                    let sparkX = screenX + Math.cos(angle) * 20;
                    let sparkY = obj.y - 10 + Math.sin(angle) * 20;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillRect(sparkX, sparkY, 1, 1);
                }
            }

            this.ctx.globalAlpha = 1.0;
        }
    }

    drawInteractable(x, y, type) {
        this.ctx.save();

        switch(type) {
            case 'stone':
                this.ctx.fillStyle = '#555';
                this.ctx.fillRect(x - 6, y - 8, 12, 8);
                break;
            case 'candle':
                this.ctx.fillStyle = '#ddd';
                this.ctx.fillRect(x - 2, y - 10, 4, 10);
                this.ctx.fillStyle = '#ff0';
                this.ctx.fillRect(x - 1, y - 12, 2, 2);
                break;
            case 'sign':
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x - 2, y - 15, 4, 15);
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(x - 8, y - 20, 16, 8);
                break;
            case 'flower':
                this.ctx.fillStyle = '#2d5';
                this.ctx.fillRect(x - 1, y - 8, 2, 8);
                this.ctx.fillStyle = '#f5f';
                this.ctx.beginPath();
                this.ctx.arc(x, y - 10, 3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'torch':
                this.ctx.fillStyle = '#654';
                this.ctx.fillRect(x - 2, y - 15, 4, 15);
                this.ctx.fillStyle = '#fa0';
                this.ctx.beginPath();
                this.ctx.arc(x, y - 16, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'book':
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x - 5, y - 8, 10, 8);
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(x - 5, y - 8, 10, 8);
                break;
            case 'crystal':
                this.ctx.fillStyle = '#0ff';
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - 12);
                this.ctx.lineTo(x - 4, y - 4);
                this.ctx.lineTo(x + 4, y - 4);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case 'mirror':
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(x - 6, y - 15, 12, 15);
                this.ctx.fillStyle = '#aaf';
                this.ctx.fillRect(x - 5, y - 14, 10, 12);
                break;
            case 'statue':
                this.ctx.fillStyle = '#777';
                this.ctx.fillRect(x - 4, y - 18, 8, 18);
                this.ctx.beginPath();
                this.ctx.arc(x, y - 20, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'person':
                this.drawNPC(x, y - 5, 1);
                break;
            case 'tree':
                this.ctx.fillStyle = '#654';
                this.ctx.fillRect(x - 3, y - 15, 6, 15);
                this.ctx.fillStyle = '#2a2';
                this.ctx.beginPath();
                this.ctx.arc(x, y - 18, 8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'star':
                this.ctx.fillStyle = '#ff0';
                this.drawStar(x, y - 10, 5, 5, 2);
                break;
            case 'fountain':
                this.ctx.fillStyle = '#888';
                this.ctx.fillRect(x - 8, y - 8, 16, 8);
                this.ctx.fillStyle = '#59f';
                for(let i = 0; i < 3; i++) {
                    this.ctx.fillRect(x - 4 + i * 3, y - 12 - Math.random() * 4, 2, 4);
                }
                break;
            case 'heart':
                this.ctx.fillStyle = '#f55';
                this.drawHeart(x, y - 10, 6);
                break;
            case 'sun':
                this.ctx.fillStyle = '#fd0';
                this.ctx.beginPath();
                this.ctx.arc(x, y - 10, 6, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'crown':
                this.ctx.fillStyle = '#fd0';
                this.ctx.fillRect(x - 6, y - 8, 12, 4);
                this.ctx.fillRect(x - 5, y - 12, 2, 4);
                this.ctx.fillRect(x - 1, y - 12, 2, 4);
                this.ctx.fillRect(x + 3, y - 12, 2, 4);
                break;
            case 'light':
                let gradient = this.ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 15);
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - 15, y - 25, 30, 30);
                break;
        }

        this.ctx.restore();
    }

    drawStar(x, y, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y - outerRadius);

        for (let i = 0; i < spikes; i++) {
            this.ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            this.ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }

        this.ctx.lineTo(x, y - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawHeart(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 4);
        this.ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size / 2, y + size / 4);
        this.ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size, x, y + size);
        this.ctx.bezierCurveTo(x, y + size, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        this.ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
        this.ctx.fill();
    }

    drawParticles() {
        for (let p of particles) {
            let screenX = p.x - gameState.cameraX;

            if (screenX < 0 || screenX > gameState.width) continue;

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;

            if (p.size > 1) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(screenX, p.y, p.size, p.size);
            }
        }
        this.ctx.globalAlpha = 1.0;
    }

    drawPlayer() {
        let x = player.x - gameState.cameraX;
        let y = player.y;

        this.ctx.save();

        // Flip if facing left
        if (player.facing === -1) {
            this.ctx.translate(x + player.w, y);
            this.ctx.scale(-1, 1);
            x = 0;
        } else {
            this.ctx.translate(x, y);
            x = 0;
        }

        // Head (Skin tone)
        this.ctx.fillStyle = '#f5c99b';
        this.ctx.fillRect(x + 2, y, 8, 6);

        // Hair (Brown)
        this.ctx.fillStyle = '#4a3728';
        this.ctx.fillRect(x + 1, y, 10, 3); // Top of head
        this.ctx.fillRect(x + 1, y, 2, 6); // Left sideburns
        this.ctx.fillRect(x + 9, y, 2, 6); // Right sideburns

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 3, y + 2, 1, 1);
        this.ctx.fillRect(x + 7, y + 2, 1, 1);

        // Glasses frames
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x + 2, y + 2, 3, 2); // Left lens frame
        this.ctx.fillRect(x + 6, y + 2, 3, 2); // Right lens frame
        this.ctx.fillRect(x + 5, y + 2, 1, 1); // Bridge

        // Body (Black t-shirt)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + 2, y + 6, 8, 8);

        // T-shirt highlights for depth
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(x + 2, y + 6, 8, 1);

        // Legs (Blue jeans - animated)
        this.ctx.fillStyle = '#2c5aa0'; // Blue jeans color
        if (player.frame === 0) {
            this.ctx.fillRect(x + 3, y + 14, 2, 4);
            this.ctx.fillRect(x + 7, y + 14, 2, 4);
        } else {
            this.ctx.fillRect(x + 2, y + 14, 2, 4);
            this.ctx.fillRect(x + 8, y + 14, 2, 4);
        }

        // Jeans highlights
        this.ctx.fillStyle = '#3d6eb8';
        if (player.frame === 0) {
            this.ctx.fillRect(x + 3, y + 14, 1, 1);
            this.ctx.fillRect(x + 7, y + 14, 1, 1);
        } else {
            this.ctx.fillRect(x + 2, y + 14, 1, 1);
            this.ctx.fillRect(x + 8, y + 14, 1, 1);
        }

        this.ctx.restore();
    }

    drawUI() {
        // Progress indicator with bar
        let progress = gameState.linesDiscovered;
        let total = poemLines.length;
        let progressPercent = progress / total;

        // Progress bar background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(8, 8, 80, 14);

        // Progress bar fill
        let barColor = gameState.chapter >= 2 ? '#FFD700' : '#87CEEB';
        this.ctx.fillStyle = barColor;
        this.ctx.fillRect(10, 10, 76 * progressPercent, 10);

        // Progress text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '12px VT323';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${progress}/${total}`, 48, 18);

        // Chapter name with background
        let chapterName = ['Darkness', 'The Light', 'The Gods', 'Delight'][gameState.chapter];
        this.ctx.textAlign = 'right';

        // Measure text width for background
        let textWidth = this.ctx.measureText(chapterName).width;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(gameState.width - textWidth - 12, 8, textWidth + 4, 14);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText(chapterName, gameState.width - 10, 18);
    }

    render() {
        this.clear();
        this.applyShake();

        this.drawBackground();
        this.drawEnvironment();
        this.drawGround();
        this.drawInteractables();
        this.drawParticles();
        this.drawPlayer();

        this.removeShake();

        this.drawUI();

        // Screen flash effect
        if (gameState.screenFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${gameState.screenFlash * 0.5})`;
            this.ctx.fillRect(0, 0, gameState.width, gameState.height);
        }
    }
}
