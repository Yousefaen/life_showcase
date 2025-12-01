/**
 * Audio Engine - Web Audio API
 * Procedural sound generation to avoid external asset loading
 */

class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.connect(this.audioCtx.destination);
            this.masterGain.gain.value = 0.3;
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playSound(type, options = {}) {
        if (!this.initialized || !this.audioCtx) return;

        this.resume();

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        const now = this.audioCtx.currentTime;

        switch(type) {
            case 'voice':
                // Undertale-style text blip
                osc.type = 'square';
                osc.frequency.setValueAtTime(200 + Math.random() * 80, now);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'ambient':
                // Deep atmospheric drone
                osc.type = 'sine';
                osc.frequency.setValueAtTime(110, now);
                osc.frequency.linearRampToValueAtTime(105, now + 3);
                gainNode.gain.setValueAtTime(0.03, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 4);
                osc.start(now);
                osc.stop(now + 4);
                break;

            case 'sparkle':
                // Magical high-pitched effect
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(1400, now + 0.6);
                gainNode.gain.setValueAtTime(0.04, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'interact':
                // Interaction sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(880, now + 0.05);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'discovery':
                // Poem line discovery
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'step':
                // Footstep sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(80 + Math.random() * 20, now);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
        }
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
}

// Global audio instance
const audio = new AudioEngine();
