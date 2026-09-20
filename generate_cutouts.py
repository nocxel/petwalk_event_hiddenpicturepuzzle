from PIL import Image, ImageDraw, ImageFilter
import os

def create_cutout_sticker(img, crop_box, out_path, shape='ellipse', padding=15):
    # crop_box: (x1, y1, x2, y2)
    cropped = img.crop(crop_box).convert('RGBA')
    cw, ch = cropped.size
    
    # Target square size
    target_dim = max(cw, ch) + padding * 2
    canvas = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    
    # Calculate centering offset
    ox = (target_dim - cw) // 2
    oy = (target_dim - ch) // 2
    
    # 1. Create shape mask for cutting out the object
    mask = Image.new('L', (cw, ch), 0)
    mdraw = ImageDraw.Draw(mask)
    
    if shape == 'ellipse':
        mdraw.ellipse([(0, 0), (cw, ch)], fill=255)
    elif shape == 'rounded':
        mdraw.rounded_rectangle([(0, 0), (cw, ch)], radius=int(min(cw, ch) * 0.3), fill=255)
    
    # Smooth the mask edge
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.5))
    
    # 2. White sticker outline border
    border_img = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_img)
    b_margin = 6
    if shape == 'ellipse':
        bdraw.ellipse(
            [(ox - b_margin, oy - b_margin), (ox + cw + b_margin, oy + ch + b_margin)],
            fill=(255, 255, 255, 255)
        )
    elif shape == 'rounded':
        bdraw.rounded_rectangle(
            [(ox - b_margin, oy - b_margin), (ox + cw + b_margin, oy + ch + b_margin)],
            radius=int(min(cw, ch) * 0.3) + b_margin,
            fill=(255, 255, 255, 255)
        )
    
    # 3. Soft drop shadow under the sticker
    shadow_img = Image.new('RGBA', (target_dim, target_dim), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_img)
    if shape == 'ellipse':
        sdraw.ellipse(
            [(ox - b_margin, oy - b_margin + 5), (ox + cw + b_margin, oy + ch + b_margin + 5)],
            fill=(0, 0, 0, 70)
        )
    elif shape == 'rounded':
        sdraw.rounded_rectangle(
            [(ox - b_margin, oy - b_margin + 5), (ox + cw + b_margin, oy + ch + b_margin + 5)],
            radius=int(min(cw, ch) * 0.3) + b_margin,
            fill=(0, 0, 0, 70)
        )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=5))
    
    # Composite: Shadow -> White Border -> Cropped Object (masked)
    cropped.putalpha(mask)
    
    final_img = Image.alpha_composite(shadow_img, border_img)
    final_img.paste(cropped, (ox, oy), cropped)
    
    # Resize to crisp 200x200
    final_img = final_img.resize((200, 200), Image.Resampling.LANCZOS)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    final_img.save(out_path, 'PNG')
    print(f"Generated sticker cutout: {out_path}")

def main():
    img = Image.open('public/images/petwalk_autumn_store.jpg')
    w, h = img.size
    
    # 1. 목줄 & 하네스: 페그보드의 핑크 하네스 + 목줄 중심
    create_cutout_sticker(
        img,
        (int(w * 0.11), int(h * 0.16), int(w * 0.28), int(h * 0.44)),
        'public/images/items/leash.png',
        shape='rounded'
    )
    
    # 2. 카시트: 벤치 위 베이지 퀼팅 카시트 본체
    create_cutout_sticker(
        img,
        (int(w * 0.605), int(h * 0.42), int(w * 0.805), int(h * 0.68)),
        'public/images/items/carseat.png',
        shape='rounded'
    )
    
    # 3. 이동가방: 카펫 위 카키 펫 캐리어
    create_cutout_sticker(
        img,
        (int(w * 0.58), int(h * 0.73), int(w * 0.78), int(h * 0.95)),
        'public/images/items/carrier.png',
        shape='rounded'
    )
    
    # 4. 간식: 테이블 위 간식 병 및 파우치
    create_cutout_sticker(
        img,
        (int(w * 0.80), int(h * 0.65), int(w * 0.99), int(h * 0.96)),
        'public/images/items/treats.png',
        shape='rounded'
    )
    
    # 5. 장난감: 바닥의 알록달록 로프 터그
    create_cutout_sticker(
        img,
        (int(w * 0.245), int(h * 0.77), int(w * 0.415), int(h * 0.91)),
        'public/images/items/toy.png',
        shape='ellipse'
    )

if __name__ == '__main__':
    main()
