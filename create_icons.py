from PIL import Image, ImageDraw, ImageFont
import os

# Create 192x192 icon
img_192 = Image.new('RGBA', (192, 192), (8, 145, 178, 255))  # prism-teal color
draw = ImageDraw.Draw(img_192)

# Try to use a default font, fall back to basic if not available
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
except:
    font = ImageFont.load_default()

# Calculate text position to center it
text = "AI"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (192 - text_width) // 2
y = (192 - text_height) // 2

# Draw white text
draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

# Save 192x192 icon
img_192.save('/home/pratikacharya/Desktop/hackathon/public/icon-192.png', 'PNG')

# Create 512x512 icon
img_512 = Image.new('RGBA', (512, 512), (8, 145, 178, 255))
draw_512 = ImageDraw.Draw(img_512)

try:
    font_512 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 200)
except:
    font_512 = ImageFont.load_default()

# Calculate text position for 512x512
bbox_512 = draw_512.textbbox((0, 0), text, font=font_512)
text_width_512 = bbox_512[2] - bbox_512[0]
text_height_512 = bbox_512[3] - bbox_512[1]
x_512 = (512 - text_width_512) // 2
y_512 = (512 - text_height_512) // 2

draw_512.text((x_512, y_512), text, fill=(255, 255, 255, 255), font=font_512)

img_512.save('/home/pratikacharya/Desktop/hackathon/public/icon-512.png', 'PNG')

print("Icons created successfully!")