"""Build the offline NL distribution layer from eBird's CC BY dataset and Natural Earth.

Requires Node.js and Python mapbox-vector-tile. Run from the repo root:
    python tools/species/build_distribution.py /path/to/download-cache
"""
import concurrent.futures
import json
import math
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import mapbox_vector_tile
from shapely.geometry import box, shape
from shapely.ops import transform

DATASET = "4fa7b334-ce0d-4e88-aaae-2e0c138d049e"
YEARS = "2020,2025"
TILE_EXTENT = 4096
CELL = 64  # ~24 km in NL in a Web Mercator tile at z4
COLUMNS = TILE_EXTENT // CELL
MIN_RECORDS = 5
VIEW_BOX = (505, 605, 890, 1015)
SOURCE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
EXCLUDED = {"dwaalgast", "ontsnapt", "historisch"}
# Keep the original coordinate-based grid for these documented tile discrepancies.
DIRECT_GRID_KEYS = {2481120, 2481121}  # Witvleugelstern, Witwangstern
BASE = dict(datasetKey=DATASET, country="NL", year=YEARS, hasCoordinate="true",
            hasGeospatialIssue="false", occurrenceStatus="PRESENT", license="CC_BY_4_0")


def read(url):
    request = Request(url, headers={"User-Agent": "Birdspot-Library/distribution (GitHub project)"})
    for attempt in range(3):
        try:
            with urlopen(request, timeout=18) as response:
                return response.read()
        except OSError as error:
            if attempt == 2 or isinstance(error, HTTPError) and error.code not in (429, 502, 503, 504):
                raise
            time.sleep((attempt + 1) * 3)


def tile_cells(key, total):
    if not key or total < 15:
        return []
    query = urlencode(dict(BASE, taxonKey=key, srs="EPSG:3857", bin="square", squareSize=CELL))
    tile = read("https://api.gbif.org/v2/map/occurrence/adhoc/4/8/5.mvt?" + query)
    layer = mapbox_vector_tile.decode(tile, default_options={"y_coord_down": True}).get("occurrence", {})
    features = layer.get("features", [])
    if layer.get("extent", TILE_EXTENT) != TILE_EXTENT:
        raise ValueError("unexpected GBIF tile extent")
    counts = {}
    for feature in features:
        x, y = map(min, zip(*feature["geometry"]["coordinates"][0]))
        if x % CELL or y % CELL or (x, y) in counts:
            raise ValueError("unexpected GBIF grid coordinates")
        counts[x, y] = feature["properties"]["total"]
    if key in DIRECT_GRID_KEYS or sum(counts.values()) != total:
        counts = occurrence_cells(key, total)
    left, top, width, height = VIEW_BOX
    return sorted(
        ((y // CELL) * COLUMNS + x // CELL, count)
        for (x, y), count in counts.items()
        if count >= MIN_RECORDS and left < x + CELL / 2 < left + width and top < y + CELL / 2 < top + height
    )


def occurrence_cells(key, total):
    """Reconcile a small tile/search difference using the same occurrence filters."""
    if total > 1000:
        raise ValueError("GBIF tile and occurrence search totals differ")
    records = {}
    for offset in range(0, total, 300):
        query = urlencode(dict(BASE, taxonKey=key, limit=300, offset=offset))
        page = json.loads(read("https://api.gbif.org/v1/occurrence/search?" + query))
        records.update((r["key"], (r["decimalLongitude"], r["decimalLatitude"])) for r in page["results"])
    if len(records) != total:
        raise ValueError("GBIF records do not match the expected total")
    counts = Counter()
    for lon, lat in records.values():
        x, y = tile_xy(lon, lat)
        counts[math.floor(x / CELL) * CELL, math.floor(y / CELL) * CELL] += 1
    return counts


def distribution(species, cache):
    cache_file = cache / f"{species['id']}-counts.json"
    if cache_file.exists():
        return json.loads(cache_file.read_text())
    search = urlencode(dict(BASE, scientificName=species["nameSci"], limit=1))
    result = json.loads(read("https://api.gbif.org/v1/occurrence/search?" + search))
    record = next(iter(result["results"]), {})
    key = record.get("speciesKey")
    data = {"key": key, "count": result["count"], "cells": tile_cells(key, result["count"])}
    cache_file.write_text(json.dumps(data))
    return data


def tile_xy(lon, lat):
    x = ((lon + 180) / 360 * 16 - 8) * TILE_EXTENT
    y = ((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * 16 - 5) * TILE_EXTENT
    return x, y


def map_paths(cache):
    left, top, width, height = VIEW_BOX
    viewport = box(left, top, left + width, top + height)

    def path(feature):
        geometry = transform(tile_xy, shape(feature["geometry"])).intersection(viewport).simplify(1.5)
        if geometry.is_empty:
            return ""
        polygons = [geometry] if geometry.geom_type == "Polygon" else geometry.geoms
        return "".join(
            "M" + "L".join(f"{round(x)} {round(y)}" for x, y in list(ring.coords)[:-1]) + "Z"
            for polygon in polygons if polygon.geom_type == "Polygon"
            for ring in (polygon.exterior, *polygon.interiors)
        )

    def source(name):
        file = cache / (name + ".geojson")
        if not file.exists():
            file.write_bytes(read(SOURCE + file.name))
        return json.loads(file.read_text())["features"]

    countries = source("ne_10m_admin_0_countries")
    paths = {f["properties"]["ADM0_A3"]: path(f) for f in countries
             if f["properties"]["ADM0_A3"] in ("NLD", "BEL", "DEU", "FRA", "GBR")}
    lakes = source("ne_10m_lakes")
    paths["water"] = "".join(path(f) for f in lakes if f["properties"]["name"] in ("IJsselmeer", "Markermeer"))
    return paths


def module_source(paths, data):
    return (
        "// Generated by tools/species/build_distribution.py. See docs/data/SPECIES_DISTRIBUTION.md.\n"
        f"export const GBIF_YEARS = '{YEARS.replace(',', '–')}';\n"
        f"export const MAP_VIEW_BOX = '{' '.join(map(str, VIEW_BOX))}';\n"
        f"export const MAP_CELL = {CELL};\n"
        f"export const MAP_COLUMNS = {COLUMNS};\n"
        f"export const MAP_MIN_RECORDS = {MIN_RECORDS};\n"
        f"export const MAP_PATHS = {json.dumps(paths, sort_keys=True, indent=2)};\n"
        "export const DISTRIBUTION = {\n"
        + "".join(f"  {sid}: {json.dumps(item, separators=(',', ':'))},\n" for sid, item in sorted(data.items()))
        + "};\n"
    )


def main(cache):
    cache.mkdir(parents=True, exist_ok=True)
    species = json.loads(subprocess.check_output([
        "node", "--input-type=module", "-e",
        "import {SPECIES} from './src/data/species.js'; console.log(JSON.stringify(SPECIES));",
    ], text=True))
    paths = map_paths(cache)
    data = {}
    errors = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        jobs = {pool.submit(distribution, s, cache): s["id"] for s in species if s["category"] not in EXCLUDED}
        for i, job in enumerate(concurrent.futures.as_completed(jobs), 1):
            sid = jobs[job]
            try:
                item = job.result()
                if len(item["cells"]) >= 3:
                    data[sid] = [item["key"], item["cells"]]
            except (OSError, ValueError, KeyError) as error:
                errors[sid] = str(error)
            if i % 25 == 0:
                print(f"{i}/{len(jobs)} checked; {len(data)} maps; {len(errors)} errors", flush=True)
    if errors:
        print(json.dumps(errors, indent=2))
        raise SystemExit("Failed queries must be resolved before updating the bundled data.")
    Path("src/data/speciesDistribution.js").write_text(module_source(paths, data))
    print(f"{len(data)} maps of {len(jobs)} eligible species / {len(species)} total")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
