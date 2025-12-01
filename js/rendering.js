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
        // STATIC Iceland sky - light blue with white clouds (no camera movement)
        let skyColor = '#87CEEB'; // Light blue sky
        let horizonColor = '#B0D8F0'; // Lighter at horizon

        // Sky gradient
        let gradient = this.ctx.createLinearGradient(0, 0, 0, gameState.height);
        gradient.addColorStop(0, skyColor);
        gradient.addColorStop(1, horizonColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, gameState.width, gameState.height);

        // STATIC white clouds (no parallax)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 8; i++) {
            let cx = (i * 80) % (gameState.width + 100);
            let cy = 20 + (i % 3) * 15;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 15 + (i % 2) * 5, 0, Math.PI * 2);
            this.ctx.arc(cx + 15, cy, 12, 0, Math.PI * 2);
            this.ctx.arc(cx + 25, cy + 5, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Northern lights effect (subtle, in later chapters)
        if (gameState.chapter >= 2) {
            this.ctx.globalAlpha = 0.15 + gameState.chapter * 0.05;
            let auroraGradient = this.ctx.createLinearGradient(0, 0, 0, gameState.height * 0.5);
            auroraGradient.addColorStop(0, 'rgba(150, 255, 150, 0.2)');
            auroraGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
            auroraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = auroraGradient;
            this.ctx.fillRect(0, 0, gameState.width, gameState.height * 0.5);
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawGround() {
        // MIDGROUND: Yellow-green grass with rocks (1x parallax - side-scrolling)
        let camX = gameState.cameraX;

        // Base ground (yellow-green grass) - playable area
        this.ctx.fillStyle = '#8FBC4F'; // Yellow-green grass
        this.ctx.fillRect(0, gameState.height * 0.5, gameState.width, gameState.height * 0.3);

        // Darker grass patches for texture (1x parallax, infinite scrolling)
        this.ctx.fillStyle = '#7DA83E';
        for (let i = 0; i < 30; i++) {
            let x = (i * 50 - camX) % (gameState.width + 150) - 75;
            let y = gameState.height * 0.5 + (i % 5) * 12;
            this.ctx.fillRect(x, y, 35, 15);
        }

        // Grey rocks scattered on grass (1x parallax, infinite scrolling)
        this.ctx.fillStyle = '#888888';
        for (let i = 0; i < 25; i++) {
            let rx = (i * 60 - camX) % (gameState.width + 150) - 75;
            let ry = gameState.height * 0.55 + (i % 5) * 10;
            this.ctx.fillRect(rx, ry, 10 + (i % 3) * 4, 7);
            // Rock highlight
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.fillRect(rx + 1, ry + 1, 3, 2);
            this.ctx.fillStyle = '#888888';
        }
    }

    drawSea() {
        // FOREGROUND: Sea with FAST parallax (1.5x speed) - very foreground
        let camX = gameState.cameraX;
        let camY = gameState.cameraY;

        // Sea base (darker blue)
        this.ctx.fillStyle = '#2E5A8F';
        this.ctx.fillRect(0, gameState.height * 0.8, gameState.width, gameState.height * 0.2);

        // Water waves (fast parallax)
        this.ctx.fillStyle = '#4A7AB8';
        for (let i = 0; i < 10; i++) {
            let wx = (i * 70 - camX * 1.5) % (gameState.width + 100) - 50;
            let wy = gameState.height * 0.82 + Math.sin(Date.now() / 500 + i) * 3;
            this.ctx.beginPath();
            this.ctx.arc(wx, wy, 25, 0, Math.PI, false);
            this.ctx.fill();
        }

        // White foam on waves
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 8; i++) {
            let fx = (i * 80 + 20 - camX * 1.5) % (gameState.width + 100) - 50;
            let fy = gameState.height * 0.81 + Math.sin(Date.now() / 400 + i) * 2;
            this.ctx.fillRect(fx, fy, 15, 3);
        }
    }

    drawEnvironment() {
        const camX = gameState.cameraX;
        const camY = gameState.cameraY;

        // BACKGROUND LAYER: Distant mountains with SLOW parallax (0.2x speed)
        this.ctx.fillStyle = '#6B7280'; // Grey mountains
        for (let i = 0; i < 8; i++) {
            let mx = (i * 120 - camX * 0.2) % (gameState.width + 200) - 100;
            let mh = 40 + (i % 3) * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(mx, gameState.height * 0.4);
            this.ctx.lineTo(mx + 60, gameState.height * 0.4 - mh);
            this.ctx.lineTo(mx + 120, gameState.height * 0.4);
            this.ctx.fill();

            // White snow caps
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.moveTo(mx + 40, gameState.height * 0.4 - mh * 0.7);
            this.ctx.lineTo(mx + 60, gameState.height * 0.4 - mh);
            this.ctx.lineTo(mx + 80, gameState.height * 0.4 - mh * 0.7);
            this.ctx.fill();
            this.ctx.fillStyle = '#6B7280';
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
            let screenY = obj.y;  // STATIC Y position (no vertical animation)

            if (screenX < -50 || screenX > gameState.width + 50) continue;

            if (obj.discovered) {
                // Draw faded/discovered state
                this.ctx.globalAlpha = 0.3;
            } else {
                // No pulsing - items are static
                this.ctx.globalAlpha = 1.0;
            }

            this.drawInteractable(screenX, screenY, obj.type);

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
                this.ctx.fillText('Tap', screenX, obj.y - 22);
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
            case 'signpost': // Wooden direction sign
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x - 2, y - 20, 4, 20); // Post
                this.ctx.fillStyle = '#a0743d';
                this.ctx.fillRect(x - 10, y - 25, 20, 6); // Sign board
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '8px VT323';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('→', x, y - 21);
                break;

            case 'cairn': // Stacked stones
                this.ctx.fillStyle = '#666';
                this.ctx.fillRect(x - 6, y - 8, 12, 8);
                this.ctx.fillStyle = '#777';
                this.ctx.fillRect(x - 5, y - 14, 10, 6);
                this.ctx.fillStyle = '#555';
                this.ctx.fillRect(x - 4, y - 18, 8, 4);
                break;

            case 'hiker': // Person with backpack
                this.ctx.fillStyle = '#8b4513'; // Brown backpack
                this.ctx.fillRect(x - 5, y - 15, 10, 8);
                this.ctx.fillStyle = '#f5c99b'; // Skin
                this.ctx.beginPath();
                this.ctx.arc(x, y - 18, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#4a90e2'; // Blue jacket
                this.ctx.fillRect(x - 4, y - 12, 8, 8);
                this.ctx.fillStyle = '#333'; // Legs
                this.ctx.fillRect(x - 4, y - 4, 3, 6);
                this.ctx.fillRect(x + 1, y - 4, 3, 6);
                break;

            case 'plane_wreck': // Crashed plane piece
                this.ctx.fillStyle = '#999'; // Metal
                this.ctx.fillRect(x - 12, y - 10, 24, 8);
                this.ctx.fillStyle = '#666';
                this.ctx.fillRect(x - 10, y - 12, 8, 4); // Wing piece
                this.ctx.fillStyle = '#f00'; // Red stripe
                this.ctx.fillRect(x - 12, y - 8, 24, 2);
                // Damage marks
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(x - 5, y - 9, 3, 3);
                break;

            case 'lighthouse': // Tall lighthouse
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x - 4, y - 25, 8, 25); // Tower
                this.ctx.fillStyle = '#f00'; // Red top
                this.ctx.fillRect(x - 5, y - 28, 10, 4);
                this.ctx.fillStyle = '#ff0'; // Light
                this.ctx.beginPath();
                this.ctx.arc(x, y - 26, 3, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'weather_station': // Meteorological equipment
                this.ctx.fillStyle = '#ddd';
                this.ctx.fillRect(x - 6, y - 15, 12, 15); // Box
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(x - 5, y - 14, 10, 2); // Vents
                this.ctx.fillRect(x - 5, y - 10, 10, 2);
                this.ctx.fillStyle = '#0a0'; // Green light
                this.ctx.fillRect(x - 2, y - 6, 4, 2);
                // Antenna
                this.ctx.fillStyle = '#888';
                this.ctx.fillRect(x - 1, y - 22, 2, 8);
                break;

            case 'geothermal_vent': // Steam coming from ground
                this.ctx.fillStyle = '#666'; // Rock base
                this.ctx.fillRect(x - 8, y - 6, 16, 6);
                // Steam
                for(let i = 0; i < 4; i++) {
                    this.ctx.fillStyle = `rgba(200, 200, 220, ${0.5 - i * 0.1})`;
                    this.ctx.fillRect(x - 3 + i, y - 10 - i * 3, 6 - i, 4);
                }
                break;

            case 'telescope': // Observatory telescope
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(x - 8, y - 8, 16, 6); // Base
                this.ctx.fillStyle = '#666';
                // Angled telescope
                this.ctx.fillRect(x - 2, y - 18, 4, 12);
                this.ctx.fillStyle = '#88f'; // Lens
                this.ctx.fillRect(x - 3, y - 19, 6, 2);
                break;

            case 'viking_statue': // Norse warrior statue
                this.ctx.fillStyle = '#888'; // Stone
                this.ctx.fillRect(x - 6, y - 22, 12, 22); // Body
                this.ctx.beginPath();
                this.ctx.arc(x, y - 24, 5, 0, Math.PI * 2);
                this.ctx.fill();
                // Horned helmet
                this.ctx.fillRect(x - 7, y - 28, 3, 4);
                this.ctx.fillRect(x + 4, y - 28, 3, 4);
                // Shield
                this.ctx.fillStyle = '#c8102e';
                this.ctx.beginPath();
                this.ctx.arc(x - 8, y - 14, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'tourist': // Tourist with camera
                this.ctx.fillStyle = '#f5c99b'; // Skin
                this.ctx.beginPath();
                this.ctx.arc(x, y - 18, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#e74c3c'; // Red shirt
                this.ctx.fillRect(x - 5, y - 14, 10, 10);
                this.ctx.fillStyle = '#333'; // Camera
                this.ctx.fillRect(x + 4, y - 12, 4, 3);
                this.ctx.fillStyle = '#666'; // Lens
                this.ctx.fillRect(x + 7, y - 11, 2, 1);
                break;

            case 'globe': // World globe monument
                this.ctx.fillStyle = '#4a90e2'; // Blue ocean
                this.ctx.beginPath();
                this.ctx.arc(x, y - 14, 8, 0, Math.PI * 2);
                this.ctx.fill();
                // Green continents
                this.ctx.fillStyle = '#2ecc71';
                this.ctx.fillRect(x - 4, y - 16, 6, 4);
                this.ctx.fillRect(x + 1, y - 12, 4, 3);
                // Stand
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x - 2, y - 6, 4, 6);
                break;

            case 'ice_sculpture': // Ice/crystal formation
                this.ctx.fillStyle = '#b3e5fc'; // Light blue ice
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - 20);
                this.ctx.lineTo(x - 6, y - 10);
                this.ctx.lineTo(x - 3, y - 8);
                this.ctx.lineTo(x, y - 14);
                this.ctx.lineTo(x + 3, y - 8);
                this.ctx.lineTo(x + 6, y - 10);
                this.ctx.closePath();
                this.ctx.fill();
                // Shine
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x - 2, y - 16, 2, 4);
                break;

            case 'flag_pole': // Icelandic flag
                this.ctx.fillStyle = '#666'; // Pole
                this.ctx.fillRect(x - 1, y - 28, 2, 28);
                // Flag (Iceland colors: blue, white, red)
                this.ctx.fillStyle = '#02529c'; // Blue
                this.ctx.fillRect(x + 1, y - 26, 12, 8);
                this.ctx.fillStyle = '#fff'; // White cross
                this.ctx.fillRect(x + 1, y - 22, 12, 2);
                this.ctx.fillRect(x + 4, y - 26, 2, 8);
                this.ctx.fillStyle = '#dc1e35'; // Red cross
                this.ctx.fillRect(x + 1, y - 21, 12, 1);
                this.ctx.fillRect(x + 5, y - 26, 1, 8);
                break;

            case 'abandoned_car': // Old car wreck
                this.ctx.fillStyle = '#8b0000'; // Rusty red
                this.ctx.fillRect(x - 10, y - 8, 20, 8); // Body
                this.ctx.fillRect(x - 6, y - 12, 12, 5); // Roof
                // Windows
                this.ctx.fillStyle = '#4a90e2';
                this.ctx.fillRect(x - 5, y - 11, 4, 3);
                this.ctx.fillRect(x + 1, y - 11, 4, 3);
                // Wheels
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(x - 8, y, 3, 3);
                this.ctx.fillRect(x + 5, y, 3, 3);
                break;

            case 'bench': // Park bench
                this.ctx.fillStyle = '#8b4513'; // Wood
                // Backrest
                this.ctx.fillRect(x - 10, y - 14, 20, 2);
                // Seat
                this.ctx.fillRect(x - 10, y - 8, 20, 3);
                // Legs
                this.ctx.fillRect(x - 9, y - 5, 2, 5);
                this.ctx.fillRect(x + 7, y - 5, 2, 5);
                // Support
                this.ctx.fillRect(x - 9, y - 14, 2, 7);
                this.ctx.fillRect(x + 7, y - 14, 2, 7);
                break;

            case 'ruins': // Ancient stone structure
                this.ctx.fillStyle = '#777'; // Grey stone
                this.ctx.fillRect(x - 12, y - 12, 8, 12); // Left wall
                this.ctx.fillRect(x + 4, y - 18, 8, 18); // Right wall (taller)
                this.ctx.fillRect(x - 12, y - 16, 24, 4); // Top beam (broken)
                // Weathering
                this.ctx.fillStyle = '#999';
                this.ctx.fillRect(x - 11, y - 11, 6, 2);
                this.ctx.fillRect(x + 5, y - 10, 6, 2);
                break;

            case 'whale_bones': // Large whale skeleton
                this.ctx.fillStyle = '#e0e0e0'; // Bone white
                // Skull
                this.ctx.fillRect(x - 8, y - 12, 10, 8);
                // Ribs
                for(let i = 0; i < 4; i++) {
                    this.ctx.fillRect(x + 2 + i * 3, y - 10, 2, 8);
                }
                // Vertebrae
                this.ctx.fillRect(x + 14, y - 6, 4, 4);
                this.ctx.fillRect(x + 18, y - 4, 3, 3);
                break;

            case 'hot_spring': // Geothermal pool
                this.ctx.fillStyle = '#4fc3f7'; // Turquoise water
                this.ctx.beginPath();
                this.ctx.ellipse(x, y - 6, 12, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Steam
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                for(let i = 0; i < 3; i++) {
                    this.ctx.fillRect(x - 6 + i * 6, y - 12 - i * 2, 4, 3);
                }
                // Rocks around edge
                this.ctx.fillStyle = '#666';
                this.ctx.fillRect(x - 13, y - 8, 4, 4);
                this.ctx.fillRect(x + 9, y - 8, 4, 4);
                break;

            case 'viewpoint': // Scenic viewpoint platform
                this.ctx.fillStyle = '#8b4513'; // Wood deck
                this.ctx.fillRect(x - 12, y - 4, 24, 4);
                // Railing
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(x - 12, y - 10, 2, 6);
                this.ctx.fillRect(x + 10, y - 10, 2, 6);
                this.ctx.fillRect(x - 12, y - 10, 24, 2);
                // Sign
                this.ctx.fillStyle = '#2196f3';
                this.ctx.fillRect(x - 6, y - 16, 12, 8);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '8px VT323';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('VIEW', x, y - 10);
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
        let screenX = player.x - gameState.cameraX;
        let screenY = player.y;  // Y is not affected by camera (no Y scrolling)

        this.ctx.save();
        this.ctx.translate(screenX, screenY);

        // Draw based on facing direction
        if (player.facing === 'left' || player.facing === 'right') {
            // Side view
            let flip = player.facing === 'left';
            if (flip) {
                this.ctx.translate(player.w, 0);
                this.ctx.scale(-1, 1);
            }

            // Hair
            this.ctx.fillStyle = '#4a3728';
            this.ctx.fillRect(1, 0, 10, 3);
            this.ctx.fillRect(1, 0, 2, 6);

            // Head
            this.ctx.fillStyle = '#f5c99b';
            this.ctx.fillRect(2, 0, 8, 6);

            // Eye (side view - one eye visible)
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(7, 2, 1, 1);

            // Glasses (side view)
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(6, 2, 3, 2);

        } else {
            // Front/back view
            // Hair
            this.ctx.fillStyle = '#4a3728';
            this.ctx.fillRect(1, 0, 10, 3);

            // Head
            this.ctx.fillStyle = '#f5c99b';
            this.ctx.fillRect(2, 0, 8, 6);

            if (player.facing === 'down') {
                // Front view - eyes and glasses
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(3, 2, 1, 1);
                this.ctx.fillRect(7, 2, 1, 1);

                // Glasses
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(2, 2, 3, 2);
                this.ctx.fillRect(6, 2, 3, 2);
                this.ctx.fillRect(5, 2, 1, 1);
            } else {
                // Back view - back of head
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fillRect(2, 1, 8, 5);
            }
        }

        // Body (Black t-shirt)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(2, 6, 8, 8);

        // T-shirt highlights
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(2, 6, 8, 1);

        // Legs (Blue jeans - animated)
        this.ctx.fillStyle = '#2c5aa0';
        if (player.frame === 0) {
            this.ctx.fillRect(3, 14, 2, 4);
            this.ctx.fillRect(7, 14, 2, 4);
        } else {
            this.ctx.fillRect(2, 14, 2, 4);
            this.ctx.fillRect(8, 14, 2, 4);
        }

        // Jeans highlights
        this.ctx.fillStyle = '#3d6eb8';
        if (player.frame === 0) {
            this.ctx.fillRect(3, 14, 1, 1);
            this.ctx.fillRect(7, 14, 1, 1);
        } else {
            this.ctx.fillRect(2, 14, 1, 1);
            this.ctx.fillRect(8, 14, 1, 1);
        }

        this.ctx.restore();
    }

    drawUI() {
        // UI removed per user request - no trackers/counters visible
    }

    render() {
        this.clear();
        this.applyShake();

        // Layer order: Sky → Mountains (slow) → Grass+Rocks (normal) → Player → Sea (fast)
        this.drawBackground();      // Static sky
        this.drawEnvironment();     // Mountains (0.2x parallax)
        this.drawGround();          // Grass + rocks (1x parallax)
        this.drawInteractables();   // Items on grass
        this.drawParticles();       // Effects
        this.drawPlayer();          // Player sprite
        this.drawSea();             // Sea in foreground (1.5x parallax)

        this.removeShake();

        this.drawUI();

        // Screen flash effect
        if (gameState.screenFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${gameState.screenFlash * 0.5})`;
            this.ctx.fillRect(0, 0, gameState.width, gameState.height);
        }
    }
}
