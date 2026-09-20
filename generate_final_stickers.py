from PIL import Image, ImageDraw, ImageFilter
import os

img = Image.open('public/images/petwalk_autumn_festival.jpg')
w, h = img.size

def make_sticker(crop_box, out_path, label):
    cropped = img.crop(crop_box).convert('RGBA')
    cw, ch = cropped.size
    target_dim = max(cw, ch) + 16
    
    # Circle mask
    mask = Image.new('L', (cw, ch), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.ellipse([(0, 0), (cw, ch)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1))
    
    # White border
    border = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border)
    ox = (target_dim - cw) // 2
    oy = (target_dim - ch) // 2
    bdraw.ellipse([(ox - 4, oy - 4), (ox + cw + 4, oy + ch + 4)], fill=(255, 255, 255, 255))
    
    # Drop shadow
    shadow = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse([(ox - 4, oy - 2), (ox + cw + 4, oy + ch + 6)], fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3))
    
    cropped.putalpha(mask)
    final_img = Image.alpha_composite(shadow, border)
    final_img.paste(cropped, (ox, oy), cropped)
    final_img = final_img.resize((240, 240), Image.Resampling.LANCZOS)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    final_img.save(out_path, 'PNG')
    print(f'Generated {label}: {out_path}')

# Exact crops
make_sticker((185, 715, 290, 805), 'public/images/items/treat_share.png', 'Treat Share')
make_sticker((905, 605, 1005, 705), 'public/images/items/frisbee_catch.png', 'Frisbee Catch')
make_sticker((55, 420, 125, 485), 'public/images/items/carrier_picnic.png', 'Picnic Carrier')
make_sticker((935, 115, 1030, 205), 'public/images/items/car_ride.png', 'Car Ride')
make_sticker((515, 785, 605, 875), 'public/images/items/leash_walk.png', 'Leash Walk')

print('All 5 stickers generated successfully.')
