# PWA Icons

This directory contains the Progressive Web App icons.

## Current Status
- `icon.svg` - Base SVG icon (512x512)

## Required Icons
To make this a fully functional PWA, generate PNG versions:

1. **icon-192x192.png** - Required for PWA
2. **icon-512x512.png** - Required for PWA
3. **apple-touch-icon.png** (180x180) - Required for iOS

## How to Generate
Use an online tool like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick:
```bash
convert -background none -resize 192x192 icon.svg icon-192x192.png
convert -background none -resize 512x512 icon.svg icon-512x512.png
convert -background none -resize 180x180 icon.svg apple-touch-icon.png
```

## Temporary Workaround
For development, the SVG icon can be used. For production, generate proper PNG files.
