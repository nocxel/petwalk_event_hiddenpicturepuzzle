from PIL import Image, ImageDraw, ImageFilter
from rembg import remove
import os

def process_pure_cutout(img, crop_box, out_path):
    cropped = img.crop(crop_box)
    
    # Use rembg to remove background
    nobg = remove(cropped)
    
    # Get bounding box of non-zero alpha
    bbox = nobg.getbbox()
    if bbox:
        nobg = nobg.crop(bbox)
        
    cw, ch = nobg.size
    target_dim = max(cw, ch) + 24
    
    canvas = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    ox = (target_dim - cw) // 2
    oy = (target_dim - ch) // 2
    
    # Soft drop shadow for UI pop
    alpha = nobg.split()[3]
    shadow = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    shadow_color = Image.new('RGBA', (cw, ch), (0, 0, 0, 90))
    shadow_color.putalpha(alpha)
    shadow.paste(shadow_color, (ox, oy + 4), shadow_color)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=4))
    
    final_img = Image.alpha_composite(canvas, shadow)
    final_img.paste(nobg, (ox, oy), nobg)
    
    final_img = final_img.resize((200, 200), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    final_img.save(out_path, 'PNG')
    print(f"Successfully created pure AI cutout: {out_path}")

def main():
    img = Image.open('public/images/petwalk_autumn_store.jpg')
    w, h = img.size
    
    # 1. 목줄 & 하네스
    process_pure_cutout(
        img,
        (int(w * 0.10), int(h * 0.16), int(w * 0.28), int(h * 0.44)),
        'public/images/items/leash.png'
    )
    
    # 2. 카시트
    process_pure_cutout(
        img,
        (int(w * 0.605), int(h * 0.42), int(w * 0.81), int(h * 0.68)),
        'public/images/items/carseat.png'
    )
    
    # 3. 이동가방
    process_pure_cutout(
        img,
        (int(w * 0.58), int(h * 0.73), int(w * 0.78), int(h * 0.95)),
        'public/images/items/carrier.png'
    )
    
    # 4. 간식
    process_pure_cutout(
        img,
        (int(w * 0.80), int(h * 0.65), int(w * 0.99), int(h * 0.96)),
        'public/images/items/treats.png'
    )
    
    # 5. 장난감
    process_pure_cutout(
        img,
        (int(w * 0.245), int(h * 0.77), int(w * 0.415), int(h * 0.91)),
        'public/images/items/toy.png'
    )

if __name__ == '__main__':
    main()
