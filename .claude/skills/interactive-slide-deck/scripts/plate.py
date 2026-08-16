"""把去背後的標記合成到深色圓角底板上。

favicon 會出現在淺色與深色分頁列，off-white 線條直接放在透明底上
在淺色分頁會整個消失，所以一定要有自己的底板。
"""

import sys
from PIL import Image, ImageDraw

# 素材底板色。標記是奶白線稿配深色填色、本來就是為深底畫的：放到紙面上
# 輪廓線會整條不見，只剩內部的深色填色變成剪影。所以簡報裡的素材一律墊一塊
# bg-paper 底板（見 SlideBodyView 的 title 與 assets 版型），favicon 沿用同一色。
PLATE = (33, 31, 25, 255)   # --color-paper #211F19
SIZE = 512
RADIUS_RATIO = 0.22         # 圓角半徑佔邊長比例
MARK_RATIO = 0.74           # 標記佔底板比例


def main(src, dst):
    plate = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, SIZE - 1, SIZE - 1], radius=int(SIZE * RADIUS_RATIO), fill=255
    )
    plate.paste(Image.new("RGBA", (SIZE, SIZE), PLATE), (0, 0), mask)

    mark = Image.open(src).convert("RGBA")
    box = mark.getbbox()
    if box:
        mark = mark.crop(box)

    target = int(SIZE * MARK_RATIO)
    scale = min(target / mark.width, target / mark.height)
    mark = mark.resize(
        (max(1, round(mark.width * scale)), max(1, round(mark.height * scale))),
        Image.LANCZOS,
    )

    plate.alpha_composite(
        mark, ((SIZE - mark.width) // 2, (SIZE - mark.height) // 2)
    )
    plate.save(dst)
    print(f"底板 {SIZE}×{SIZE}，標記 {mark.width}×{mark.height}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
