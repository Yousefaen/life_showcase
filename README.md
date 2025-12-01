# LIFE - An Interactive Journey

An interactive web-based game that combines Undertale's aesthetic with Journey's storytelling style to reveal "The Laughing Heart" by Charles Bukowski.

## About

Players control a sprite character exploring a transforming landscape, discovering lines of poetry through interaction with various objects. The game progresses through four atmospheric chapters:

1. **Darkness** - The beginning, dank submission
2. **The Light** - Hope emerges, fireflies appear
3. **The Gods** - The crowd gathers, chances are offered
4. **Delight** - The golden finale, complete illumination

## Features

✨ **Visual**
- Pixel art aesthetic inspired by Undertale
- Four distinct atmospheric chapters with evolving environments
- Dynamic particle system with sparkles, fireflies, and effects
- Camera shake and screen flash on discoveries
- Smooth animations and visual feedback

🎮 **Gameplay**
- 19 interactive objects to discover
- Each object reveals a line from the poem
- Progress tracking with visual progress bar
- Completion screen with restart option

📱 **Mobile Optimized**
- Touch controls (D-pad + action button)
- Responsive design for all screen sizes
- Landscape and portrait mode support
- Safe area support for notched devices
- Works seamlessly on smartphones via QR code

🔊 **Audio**
- Procedurally generated Web Audio API sound effects
- No external audio files needed
- Undertale-style text blips
- Discovery chimes and ambient sounds

## Project Structure

```
life_showcase/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling and animations
├── js/
│   ├── audio.js        # Web Audio API engine
│   ├── game.js         # Game logic and state
│   ├── rendering.js    # Canvas rendering
│   └── main.js         # Initialization and controls
├── vercel.json         # Vercel deployment config
├── package.json        # Project metadata
└── README.md           # This file
```

## Local Development

### Option 1: Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 3: Node.js
```bash
npx http-server
```

## Deployment to Vercel via GitHub

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit: LIFE interactive journey game"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Deploy" (no build configuration needed!)

Vercel will automatically:
- Deploy your site
- Generate a URL (e.g., `your-project.vercel.app`)
- Set up automatic deployments on push

### Step 3: Generate QR Code
1. Copy your Vercel URL
2. Use any QR code generator (e.g., [qr-code-generator.com](https://www.qr-code-generator.com/))
3. Share the QR code for easy mobile access!

## Controls

### Desktop
- **Arrow Keys** - Move left/right
- **Z** or **Enter** - Interact with objects / Advance text

### Mobile
- **D-Pad** - Move left/right (on-screen)
- **Z Button** - Interact with objects / Advance text (on-screen)

## Gameplay Tips

- Walk around and explore the landscape
- Look for glowing objects - they contain poem lines!
- Press Z when the **[Z]** prompt appears
- Watch the progress bar in the top-left corner
- Discover all 19 lines to complete the journey

## Customization

### Changing Colors
Edit `css/styles.css` - modify CSS variables:
```css
:root {
    --bg-color: #050505;
    --accent-yellow: #ffff00;
    --text-white: #ffffff;
}
```

### Adjusting Player Speed
Edit `js/game.js` - modify player speed:
```javascript
const player = {
    speed: 1.8  // Increase for faster movement
}
```

### Adding More Interactables
Edit `js/game.js` - add to `interactables` array:
```javascript
{ x: 500, y: 140, type: 'flower', lineIndex: 3, discovered: false }
```

## Credits

**Poem**: "The Laughing Heart" by Charles Bukowski
**Course**: HBS Crafting Your Life
**Development**: Built with HTML5 Canvas, Web Audio API, and vanilla JavaScript

## License

MIT License - Feel free to use and modify for educational purposes.

---

*"your life is your life / know it while you have it"*
