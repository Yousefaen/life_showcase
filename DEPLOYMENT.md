# Quick Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Steps

1. **Push to GitHub**
   ```bash
   # In your project directory
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy" (that's it!)

3. **Your game is live!**
   - Vercel will give you a URL like: `https://your-project.vercel.app`
   - Share this URL or create a QR code for mobile access

## 📱 Create QR Code

1. Copy your Vercel URL
2. Go to https://www.qr-code-generator.com/
3. Paste your URL
4. Download the QR code
5. Print or share digitally!

## 🧪 Test Locally First

### Option 1: Python
```bash
python -m http.server 8080
```
Open http://localhost:8080

### Option 2: Node.js
```bash
npx http-server -p 8080
```
Open http://localhost:8080

### Option 3: VS Code
- Install "Live Server" extension
- Right-click index.html → "Open with Live Server"

## 🎮 Testing Checklist

- [ ] Game loads without errors
- [ ] Start button works
- [ ] Player can move left and right
- [ ] Can interact with objects (press Z near them)
- [ ] Text appears and advances
- [ ] Progress bar updates
- [ ] All 19 lines can be discovered
- [ ] Completion screen appears at the end
- [ ] Restart button works
- [ ] Mobile controls work (test on phone or resize browser)
- [ ] Sound works (enable in browser if needed)

## 🔧 Troubleshooting

### Port already in use
Try a different port:
```bash
python -m http.server 3000
```

### Audio not working
- Check browser console for errors
- Ensure user interaction happened before audio plays
- Some browsers block audio until user clicks something

### Mobile controls not showing
- Test on actual mobile device
- Or use browser DevTools mobile emulator
- Controls only appear on touch devices

## 📝 Custom Domain (Optional)

After deploying to Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's DNS instructions

## 🎨 Pre-Deployment Customization

Before deploying, you can customize:

1. **Player colors** - `js/rendering.js` (drawPlayer function)
2. **Game speed** - `js/game.js` (player.speed)
3. **Chapter names** - `js/rendering.js` (drawUI function)
4. **Text colors** - `css/styles.css` (CSS variables)

---

**Ready to deploy?** Just push to GitHub and import to Vercel!
