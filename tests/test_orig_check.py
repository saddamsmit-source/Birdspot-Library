"""origcheck (F3-R12): same-shot rule on synthetic images (full, cropped, different shot)."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools" / "media"))
import orig_check as oc
rng = np.random.default_rng(3)
src = Image.fromarray((rng.random((600, 900)) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(6)).convert("RGB")
full = oc.compare(src, src.resize((450, 300))); assert full["mode"] == "full" and full["r"] >= oc.SAME_MIN_R, full
crop = oc.compare(src, src.crop((300, 0, 750, 600)).resize((300, 400))); assert crop["mode"] == "crop" and crop["r"] >= oc.SAME_MIN_R, crop
other = Image.fromarray((rng.random((600, 900)) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(6)).convert("RGB")
diff = oc.compare(src, other); assert diff["r"] < oc.SAME_MIN_R, diff
mirrored = oc.compare(src, src.transpose(Image.FLIP_LEFT_RIGHT)); assert mirrored["r"] < oc.SAME_MIN_R, mirrored
print("ORIGCHECK PASS: same shot (full and crop) accepted; other and mirrored image clearly worse", full, crop, diff)
