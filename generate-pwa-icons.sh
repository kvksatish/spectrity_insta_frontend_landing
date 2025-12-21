#!/bin/bash

# PWA Icon Generator Script
# This creates placeholder icons for testing. Replace with your actual logo later.

ICONS_DIR="public/icons"

echo "🎨 Generating PWA icons..."

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

# Icon sizes needed for PWA
SIZES=(72 96 128 144 152 192 384 512)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Attempting to use sips (macOS native)..."

    # Create a base icon using macOS native tools
    for size in "${SIZES[@]}"; do
        # Create a simple colored square using sips
        # First create a temporary file with specific size
        python3 -c "
from PIL import Image, ImageDraw, ImageFont
import os

size = $size
img = Image.new('RGB', (size, size), color='#7C3AED')
draw = ImageDraw.Draw(img)

# Draw a simple 'S' in the center
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', int(size * 0.6))
except:
    font = ImageFont.load_default()

text = 'S'
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
position = ((size - text_width) // 2, (size - text_height) // 2 - int(size * 0.05))
draw.text(position, text, fill='white', font=font)

img.save('$ICONS_DIR/icon-${size}x${size}.png')
print(f'✓ Created icon-${size}x${size}.png')
" 2>/dev/null || {
            echo "❌ Could not create icon-${size}x${size}.png (Python PIL not available)"
        }
    done
else
    echo "✓ ImageMagick found, generating icons..."

    # Create a base icon with ImageMagick
    for size in "${SIZES[@]}"; do
        convert -size ${size}x${size} xc:#7C3AED \
            -gravity center \
            -pointsize $((size * 60 / 100)) \
            -fill white \
            -annotate +0+0 'S' \
            "$ICONS_DIR/icon-${size}x${size}.png"
        echo "✓ Created icon-${size}x${size}.png"
    done
fi

echo ""
echo "✅ PWA icons generated successfully!"
echo "📁 Location: $ICONS_DIR"
echo ""
echo "⚠️  IMPORTANT: These are placeholder icons."
echo "   Replace them with your actual logo using:"
echo "   - https://www.pwabuilder.com/imageGenerator"
echo "   - https://favicon.io/"
echo ""
