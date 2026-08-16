"""把 Codex 產出的圖鎖回專案色票，並自動裁切、置中、輸出正方形 PNG。

生成模型的顏色一定會漂移，所以不信任它的 RGB，只信任它的形狀：
把每個不透明像素吸附到最接近的專案色票，alpha 保留原本的邊緣過渡。
"""

import sys
from PIL import Image

# 兩組色票，key 的意義一致、值相反：
#   paper = 主線稿的顏色      ink = 內部填色的顏色
# 選哪一組看素材最後要放在哪裡，不是看簡報主題是深是亮。
#
# DARK_TOKENS —— 素材放在深色底板上（**現有 12 個素材走這條**）
#   奶白線稿配近黑填色。亮色主題下 SlideBodyView 會在素材底下墊一塊 bg-paper
#   的近黑底板（title 版型 420px 畫框、assets 版型 176px 內層底板），
#   所以生成圖仍然是壓在深色上，用這一組。
#
# ⚠ 這組值「不等於」theme.css 的 --color-icon-*（那組記錄的是既有 12 個素材檔案
#   裡實際有的顏色：#F7F2E7 / #121A21 / #FF6B5A / #C8F04B / #42D7C2）。
#   兩組差一階，接近到吸附後不會出事，但新素材要跟現有的並排展示時，
#   建議用第三個參數指定色票或直接改這裡，不要假設它會吸到 icon token。
DARK_TOKENS = {
    "paper": (244, 240, 230),
    "acid": (246, 255, 112),
    "coral": (255, 117, 87),
    "teal": (97, 232, 210),
    "blue": (120, 167, 255),
    "violet": (181, 140, 255),
    "amber": (255, 179, 71),
    "ink": (10, 10, 9),
}

# LIGHT_TOKENS —— 素材直接放在紙面上，不墊底板（新素材可以走這條）
#   深墨線稿配紙色填色，值全部取自現在的 theme.css。
#   深墨主線稿對 panel 16.22:1、對 ink 14.59:1、對 ink-soft 13.08:1，
#   三個亮色表面都站得住，所以不需要底板。
#
# ⚠ 用這組產的素材「不能」跟現有 12 個並排：一個是深底板上的奶白線稿、
#   一個是紙面上的深墨線稿，放在同一面素材牆會像兩套系統。
#   要嘛整批換掉，要嘛就繼續用 DARK_TOKENS。
LIGHT_TOKENS = {
    "paper": (33, 31, 25),      # --color-paper  #211F19 主線稿
    "acid": (159, 37, 123),     # --color-acid   #9F257B
    "coral": (136, 58, 32),     # --color-coral  #883A20
    "teal": (9, 92, 90),        # --color-teal   #095C5A
    "blue": (42, 55, 150),      # --color-blue   #2A3796
    "violet": (108, 50, 151),   # --color-violet #6C3297
    "amber": (94, 68, 16),      # --color-amber  #5E4410
    "lime": (18, 102, 37),      # --color-lime   #126625
    "ink": (255, 253, 249),     # --color-panel  #FFFDF9 內部填色（紙色）
}

TOKENS = DARK_TOKENS

# 預設是 favicon 標記用的四色。多色插畫要自己指定，尤其是有深色填充的圖 —
# 少了 ink，near-black 的區塊會被吸到最接近的亮色，整張圖會爛掉。
DEFAULT_TOKENS = ("paper", "acid", "coral", "teal")

ALPHA_FLOOR = 8       # 低於此值視為完全透明，不參與吸色
PAD_RATIO = 0.10      # 主體四周留白比例
OUT_SIZE = 512


def build_palette(names, tokens=TOKENS):
    unknown = [name for name in names if name not in tokens]
    if unknown:
        raise SystemExit(f"未知的色票：{', '.join(unknown)}（可用：{', '.join(tokens)}）")
    return [tokens[name] for name in names]


def nearest(rgb, palette):
    return min(
        palette,
        key=lambda p: (p[0] - rgb[0]) ** 2 + (p[1] - rgb[1]) ** 2 + (p[2] - rgb[2]) ** 2,
    )


def main(src, dst, token_names=DEFAULT_TOKENS, tokens=TOKENS):
    palette = build_palette(token_names, tokens)
    img = Image.open(src).convert("RGBA")
    px = img.load()
    w, h = img.size

    snapped = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < ALPHA_FLOOR:
                px[x, y] = (0, 0, 0, 0)
                continue
            key = (r, g, b)
            if key not in snapped:
                snapped[key] = nearest(key, palette)
            nr, ng, nb = snapped[key]
            px[x, y] = (nr, ng, nb, a)

    box = img.getbbox()
    if box is None:
        raise SystemExit("圖片全透明，沒有可裁切的主體")
    subject = img.crop(box)

    side = max(subject.size)
    canvas_side = int(side * (1 + PAD_RATIO * 2))
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    canvas.paste(
        subject,
        ((canvas_side - subject.width) // 2, (canvas_side - subject.height) // 2),
    )

    canvas.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS).save(dst)

    print(f"原始 {w}×{h} → 主體 {subject.size[0]}×{subject.size[1]} → 輸出 {OUT_SIZE}×{OUT_SIZE}")
    which = "LIGHT" if tokens is LIGHT_TOKENS else "DARK"
    print(f"吸附了 {len(snapped)} 種原始顏色到 {which} 色票的 {len(palette)} 色：{', '.join(token_names)}")


if __name__ == "__main__":
    # 用法：normalize.py in.png out.png [paper,acid,coral,teal,blue,ink] [--light]
    #
    #   不加 --light（預設）：深底線稿，素材要墊 bg-paper 底板 —— 現有 12 個都是這種
    #   加 --light         ：紙面線稿，素材直接放在亮色表面上、不需要底板
    #
    # 兩種不要混用在同一面素材牆上，理由見上方 LIGHT_TOKENS 的註解。
    args = [a for a in sys.argv[1:] if a != "--light"]
    tokens = LIGHT_TOKENS if "--light" in sys.argv else DARK_TOKENS
    names = tuple(args[2].split(",")) if len(args) > 2 else DEFAULT_TOKENS
    main(args[0], args[1], names, tokens)
