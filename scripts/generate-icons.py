"""Generate the app icons in public/ from assets/logo-source.png.

Usage: python3 scripts/generate-icons.py   (requires Pillow: pip install pillow)

The logo has the emblem (clarinet, gold circle, notes) above the "Tick&Tune" text.
Icons use only the emblem, since text is unreadable at home-screen size, centred on the
logo's own cream background.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "logo-source.png"
OUT = ROOT / "public"

# Emblem area in the source (measured once): everything above the text, which starts at y=880.
EMBLEM = (268, 147, 1107, 880)


def emblem_on_square(fill: float) -> Image.Image:
    """Emblem centred on a cream square; `fill` is the share of the side its widest edge takes."""
    source = Image.open(SOURCE).convert("RGB")
    background = source.getpixel((5, 5))
    emblem = source.crop(EMBLEM)
    side = round(max(emblem.size) / fill)
    canvas = Image.new("RGB", (side, side), background)
    canvas.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
    return canvas.resize((1024, 1024), Image.LANCZOS)


def main() -> None:
    icon = emblem_on_square(0.84)
    # Android may crop to a circle; keep the emblem inside the 80 % safe zone.
    maskable = emblem_on_square(0.72)
    outputs = {
        "apple-touch-icon.png": icon.resize((180, 180), Image.LANCZOS),
        "icon-192.png": icon.resize((192, 192), Image.LANCZOS),
        "icon-512.png": icon.resize((512, 512), Image.LANCZOS),
        "icon-maskable-512.png": maskable.resize((512, 512), Image.LANCZOS),
        "favicon-48.png": icon.resize((48, 48), Image.LANCZOS),
    }
    for name, image in outputs.items():
        image.save(OUT / name, optimize=True)
        print(f"wrote public/{name} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
