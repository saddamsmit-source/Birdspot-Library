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
norm = lambda s: " ".join(str(s).lower().split())
e = {"speciesId": "sp000", "audio": "/x.mp3", "title": "File:x.ogg", "author": "A B", "license": "CC BY 3.0", "kind": "audio"}
ok = oc.audio_record(e, {"page": "p", "sha1": "s", "author": "a  b", "license": "CC BY 3.0"}, norm)
assert ok["rightsMatch"] is True and "sameShot" not in ok and "VERIFIED" not in str(ok), ok
bad = oc.audio_record(e, {"page": "p", "sha1": "s", "author": "Other", "license": "CC BY 3.0"}, norm)
assert bad["rightsMatch"] is False, bad
assert "error" in oc.audio_record(e, None, norm)
# R19-QA author rule: only traceable forms count as equal; empty or different authors never pass.
import commons_intake as ci
am = lambda art, reg, cf=None: oc.author_match({"author": art, "creditFields": cf or {}}, reg, ci.norm_name)
assert am("hedera.baltica from Wrocław, Poland", "hedera.baltica") == (True, "flickr-location-suffix")
assert am("C. Robiller / naturlichter.de ( Hyla meridionalis )", "C. Robiller / naturlichter.de") == (True, "account-suffix")
assert am("Sighmanb", "Sighmanb") == (True, "exact")
assert am("hedera.baltica from Wrocław, Poland", "someone else")[0] is False
assert am("Jan Jansen from Utrecht", "Jansen")[0] is False, "partial name never equal"
assert am("Other Person (account)", "C. Robiller")[0] is False
assert am("hedera.baltica", "hedera.baltica from Wrocław, Poland")[0] is False, "register longer than Commons is not equal"
bl = {"recordist": "Aubrey John Williams", "copyrightHolder": "The British Library Board"}
assert am("", "Aubrey John Williams / The British Library Board", bl) == (True, "recordist+copyright-holder")
assert am("", "Aubrey John Williams", {"recordist": "Aubrey John Williams"}) == (True, "recordist")
assert am("", "Aubrey John Williams / The British Library Board", {"copyrightHolder": "The British Library Board"}) == (False, "commons-author-empty")
assert am("", "Aubrey John Williams / The British Library Board") == (False, "commons-author-empty"), "truly empty author never passes"
assert am("", "Someone Else / The British Library Board", bl)[0] is False
assert am("Sighmanb", "")[0] is False
wt = "{{Information\n|description = x\n}}\n{{Sound\n| recordist = [[w:Aubrey John Williams|Aubrey John Williams]]\n| copyright holder = The British Library Board\n|date=1979-05-20\n}}"
assert ci.credit_fields(wt) == bl, ci.credit_fields(wt)
assert ci.credit_fields("|description = only text") == {}
inf = "{{Information\n|description=x\n|other fields={{Information field|name=Recordist|value=Aubrey John Williams}}{{Information field|name=Copyright holder|value=[[w:British Library|The British Library Board]]}}\n}}"
assert ci.credit_fields(inf) == bl, ci.credit_fields(inf)
assert ci.credit_fields("|performer =\n| permission ={{PermissionTicket|id=1}}") == {}, "empty field must not swallow the next line"
au = oc.audio_record({**e, "author": "Aubrey John Williams / The British Library Board", "license": "CC BY-SA 4.0"},
                     {"page": "p", "sha1": "s", "author": "", "license": "CC BY-SA 4.0", "creditFields": bl}, ci.norm_name)
assert au["rightsMatch"] is True and au["authorRule"] == "recordist+copyright-holder" and "VERIFIED" not in str(au)
print("ORIGCHECK PASS: same shot (full and crop) accepted; other and mirrored image clearly worse", full, crop, diff)
