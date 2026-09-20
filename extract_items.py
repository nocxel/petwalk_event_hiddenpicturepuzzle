import os
from PIL import Image, ImageDraw, ImageFilter

def crop_and_style(img, box, out_path, aspect=(1, 1)):
    # box: (left, top, right, bottom)
    w, h = img.size
    cropped = img.crop(box)
    
    # Make it square with slight padding
    cw, ch = cropped.size
    max_dim = max(cw, ch) + 20
    
    # Create RGBA canvas
    canvas = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    
    # Rounded mask for soft cutout look
    mask = Image.new('L', (cw, ch), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (cw, ch)], radius=18, fill=255)
    
    # Paste centered
    offset_x = (max_dim - cw) // 2
    offset_y = (max_dim - ch) // 2
    
    # Add gentle shadow
    shadow = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle(
        [(offset_x, offset_y + 4), (offset_x + cw, offset_y + ch + 4)],
        radius=18,
        fill=(0, 0, 0, 60)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=6))
    
    # White border sticker effect
    border_mask = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_mask)
    bdraw.rounded_rectangle(
        [(offset_x - 3, offset_y - 3), (offset_x + cw + 3, offset_y + ch + 3)],
        radius=21,
        fill=(255, 255, 255, 240)
    )
    
    result = Image.alpha_composite(shadow, border_mask)
    
    # Convert cropped to RGBA and apply mask
    cropped_rgba = cropped.convert('RGBA')
    cropped_rgba.putalpha(mask)
    
    result.paste(cropped_rgba, (offset_x, offset_y), cropped_rgba)
    
    # Resize to standard 240x240
    result = result.resize((240, 240), Image.Resampling.LANCZOS)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    result.save(out_path, 'PNG')
    print(f"Saved {out_path} ({cw}x{ch})")

def main():
    img_path = 'public/images/petwalk_autumn_store.jpg'
    img = Image.open(img_path)
    w, h = img.size
    print(f"Base image size: {w}x{h}")
    
    # 1. 목줄 & 하네스 (페그보드의 핑크 하네스와 목줄들)
    # x: 10% ~ 27%, y: 15% ~ 44%
    leash_box = (int(w * 0.10), int(h * 0.16), int(w * 0.28), int(h * 0.45))
    crop_and_style(img, leash_box, 'public/images/items/leash.png')
    
    # 2. 카시트 (벤치 위 베이지 퀼팅 카시트)
    # x: 60% ~ 81%, y: 42% ~ 68%
    carseat_box = (int(w * 0.605), int(h * 0.425), int(w * 0.81), int(h * 0.68))
    crop_and_style(img, carseat_box, 'public/images/items/carseat.png')
    
    # 3. 이동가방 (바닥 위 카키 펫 캐리어)
    # x: 57% ~ 78%, y: 73% ~ 95%
    carrier_box = (int(w * 0.575), int(h * 0.735), int(w * 0.785), int(h * 0.955))
    crop_and_style(img, carrier_box, 'public/images/items/carrier.png')
    
    # 4. 간식 (카운터 위 간식 병 및 파우치)
    # x: 79.5% ~ 99.5%, y: 65% ~ 97%
    treats_box = (int(w * 0.80), int(h * 0.655), int(w * 0.995), int(h * 0.965))
    crop_and_style(img, treats_box, 'public/images/items/treats.png')
    
    # 5. 장난감 (비숑 앞 바닥의 로프 터그 장난감)
    # x: 24% ~ 42%, y: 77% ~ 91%
    toy_box = (int(w * 0.245), int(h * 0.77), int(w * 0.415), int(h * 0.915))
    crop_and_style(img, toy_box, 'public/images/items/toy.png')

if __name__ == '__main__':
    main()
