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
# F3-REV2-R02: iNaturalist-licentie via API — alleen CC0/CC BY/CC BY-SA, auteur moet in de attributie staan; geen netwerk in de test.
class FakeInat:
    def __init__(self, code, attribution): self.r = {"results": [{"license_code": code, "attribution": attribution}]}
    def get(self, url): assert url.startswith("https://api.inaturalist.org/v1/photos/"); return self.r
class DownInat:
    def get(self, url): raise RuntimeError("offline")
item = {"inatPhotoId": 725640198, "author": "Paul Lewis", "license": "CC BY 4.0"}
assert oc.inat_rights(FakeInat("cc-by", "(c) Paul Lewis, some rights reserved (CC BY)"), item)["rightsMatch"] is True
assert oc.inat_rights(FakeInat("cc-by-nc", "(c) Paul Lewis, some rights reserved (CC BY-NC)"), item)["rightsMatch"] is False, "NC never passes"
assert oc.inat_rights(FakeInat("cc-by", "(c) Someone Else, some rights reserved (CC BY)"), item)["rightsMatch"] is False, "author must match"
assert oc.inat_rights(FakeInat("cc-by-sa", "(c) Paul Lewis"), item)["rightsMatch"] is False, "licence must equal the register"
assert oc.inat_rights(DownInat(), item)["rightsMatch"] is None, "unreachable API claims nothing"
# F3-REV2-R03b: v1 404 -> v2 of de .json-route van de fotopagina; route en waarnemingscontext vastgelegd.
class V1Gone:
    def __init__(self, photo): self.photo, self.urls = photo, []
    def get(self, url):
        self.urls.append(url)
        if url.startswith("https://api.inaturalist.org/v1/photos/"): raise RuntimeError("HTTP Error 404: Not Found")
        if url.startswith("https://api.inaturalist.org/v2/photos/"): raise RuntimeError("HTTP Error 422")
        if url.startswith("https://api.inaturalist.org/v1/observations/"): return {"results": [{"id": 7, "place_guess": "Utrecht, NL", "observed_on": "2020-05-01", "taxon": {"name": "Falco peregrinus"}}]}
        return self.photo
g = V1Gone({"license_code": "cc-by", "attribution": "(c) Paul Lewis, some rights reserved (CC BY)", "observations": [{"id": 7}]})
r = oc.inat_rights(g, item)
assert r["rightsMatch"] is True and r["inat"]["route"].endswith("/photos/725640198.json") and r["inat"]["observation"]["placeGuess"] == "Utrecht, NL", r
assert len(r["inat"]["triedFirst"]) == 2, r
assert oc.inat_rights(V1Gone({"id": 1}), item)["rightsMatch"] is None, "a page without licence data claims nothing"
# F3-REV2-R03c: kandidaat (geen lokaal bestand) en volle-resolutie-uitsnede; SHA-1 van de download wordt gecontroleerd.
import hashlib, io as _io, tempfile as _tf
from PIL import Image as _Im
_buf = _io.BytesIO(); _Im.new("RGB", (400, 300), (120, 80, 40)).save(_buf, "JPEG"); _raw = _buf.getvalue()
class FullCi:
    crop_box = staticmethod(ci.crop_box)
    license_ok = staticmethod(ci.license_ok)
    def get(self, url, binary=False): return _raw
_info = {"url": "u", "sha1": hashlib.sha1(_raw).hexdigest(), "license": "CC BY-SA 4.0", "author": "A", "page": "p", "width": 400, "height": 300}
with _tf.TemporaryDirectory() as _d:
    _d = Path(_d)
    cr = oc.candidate_record(FullCi(), {"id": "c1", "speciesId": "sp009", "title": "File:X.jpg", "fullCrop": [0.25, 0.25, 0.75, 0.75]}, _info, _d)
    assert cr["sha1Verified"] is True and cr["licenseAllowed"] is True and cr["originalSize"] == [400, 300], cr
    assert cr["fullCrop"]["box"] == [100, 75, 300, 225] and _Im.open(_d / "c1_full_crop.jpg").size == (200, 150), "uitsnede op oorspronkelijke resolutie"
    bad = oc.candidate_record(FullCi(), {"id": "c2", "title": "File:Y.jpg"}, {**_info, "sha1": "0" * 40, "license": "CC BY-NC 4.0"}, _d)
    assert bad["sha1Verified"] is False and bad["licenseAllowed"] is False, "afwijkende SHA-1 en NC worden zichtbaar"
    assert oc.candidate_record(FullCi(), {"id": "c3", "title": "File:Z.jpg"}, None, _d)["error"], "onbekende kandidaat claimt niets"
print("ORIGCHECK PASS: same shot (full and crop) accepted; other and mirrored image clearly worse", full, crop, diff)
