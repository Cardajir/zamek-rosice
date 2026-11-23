"""
Export every photograph on the site for the castellan to review its alt text.

Writes a folder with the photos sorted by the part of the site they appear in,
each named by a running number, and a workbook listing the same numbers with
where the photo is, its current Czech alt text and an empty column for the new
one. The workbook carries the Sanity document and path of every photo on a
hidden sheet, so `read.py` can put the returned texts back.

    python scripts/alt-texty/export.py [out_dir]

Reads the public dataset; needs no token. Default output: tmp/alt-texty/.
"""

from __future__ import annotations

import io
import json
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.drawing.image import Image as XlImage
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

PROJECT = "fhk95ye1"
DATASET = "production"
API = "2026-11-01"
SITE = "https://zamek-rosice.steezy-dev.workers.dev"
UA = {"User-Agent": "zamek-rosice-alt-export"}

PAGE_PARENTS = {
    "none": "",
    "visit": "/navstivte-nas",
    "events": "/akce-a-moznosti",
    "about": "/o-zamku",
    "statutory": "/statutarni-a-povinne-informace",
}

SECTIONS = {
    "homePage": "1 Úvodní stránka",
    "tour": "2 Prohlídky",
    "gallery": "3 Fotogalerie",
    "page": "4 Stránky",
    "post": "5 Aktuality",
}


def get(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r:
        return r.read()


def query(groq: str):
    qs = urllib.parse.urlencode({"query": groq, "perspective": "published"})
    url = f"https://{PROJECT}.api.sanity.io/v{API}/data/query/{DATASET}?{qs}"
    return json.loads(get(url))["result"]


def image_url(ref: str, params: str) -> str:
    # image-<id>-<w>x<h>-<ext>
    _, asset_id, dims, ext = ref.split("-")
    return f"https://cdn.sanity.io/images/{PROJECT}/{DATASET}/{asset_id}-{dims}.{ext}?{params}"


def cs(value) -> str:
    if isinstance(value, dict):
        return (value.get("cs") or "").strip()
    return (value or "").strip() if isinstance(value, str) else ""


def slug_of(doc) -> str:
    s = doc.get("slug") or {}
    if "current" in s:
        return s["current"]
    return (s.get("cs") or {}).get("current", "")


def safe(name: str) -> str:
    """A title usable as a Windows file or folder name."""
    name = re.sub(r'[<>:"/\\|?*„“”\']', "", name)
    name = re.sub(r"\s+", " ", name).strip(" .")
    return name[:60].rstrip(" .")


def find_images(value, path: str, found: list):
    """Every imageWithAlt in a document, in reading order, with its patch path."""
    if isinstance(value, list):
        for i, item in enumerate(value):
            step = f'[_key=="{item["_key"]}"]' if isinstance(item, dict) and "_key" in item else f"[{i}]"
            find_images(item, path + step, found)
    elif isinstance(value, dict):
        if value.get("_type") == "imageWithAlt" and (value.get("asset") or {}).get("_ref"):
            found.append((path, value))
        for key, child in value.items():
            if key != "asset":
                find_images(child, f"{path}.{key}" if path else key, found)


def describe(doc) -> tuple[str, str, list]:
    """Section folder, page URL and the doc's photos as (path, image, where)."""
    t = doc["_type"]
    found: list = []
    if t == "homePage":
        order = ["heroImage", "secondImage", "promos", "cta"]
        for key in order:
            find_images(doc.get(key), key, found)
        rows = []
        for path, img in found:
            if path == "heroImage":
                where = "Úvodní stránka – velká fotka nahoře"
            elif path == "secondImage":
                where = "Úvodní stránka – druhá velká fotka"
            elif path.startswith("cta"):
                where = "Úvodní stránka – fotka u výzvy dole"
            else:
                promo_key = re.match(r'promos\[_key=="([^"]+)"\]', path).group(1)
                promo = next(p for p in doc["promos"] if p["_key"] == promo_key)
                n = [i["_key"] for i in promo["images"]].index(re.search(r'images\[_key=="([^"]+)"\]', path).group(1)) + 1
                where = f"Úvodní stránka – blok „{cs(promo.get('title'))}“, fotka {n} z {len(promo['images'])}"
            rows.append((path, img, where))
        return "", f"{SITE}/", rows

    find_images(doc, "", found)
    title = cs(doc.get("title"))
    slug = slug_of(doc)
    total = len(found)
    if t == "tour":
        url, label = f"{SITE}/navstivte-nas/prohlidky/{slug}", f"Prohlídka „{title}“"
    elif t == "gallery":
        url, label = f"{SITE}/fotogalerie/{slug}", f"Fotogalerie „{title}“"
    elif t == "page":
        url = f"{SITE}{PAGE_PARENTS.get(doc.get('parent'), '')}/{slug}"
        label = f"Stránka „{title}“ (fotka v textu)"
    else:
        url, label = f"{SITE}/aktuality/{slug}", f"Aktualita „{title}“"
    rows = []
    for n, (path, img) in enumerate(found, 1):
        where = f"{label} – hlavní fotka" if t == "post" else f"{label} – fotka {n} z {total}"
        rows.append((path, img, where))
    return title, url, rows


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # Czech names in a Windows console
    out_root = Path(sys.argv[1] if len(sys.argv) > 1 else "tmp/alt-texty")
    stamp = date.today().isoformat()
    name = f"Alt texty – Zámek Rosice {stamp}"
    out = out_root / name
    out.mkdir(parents=True, exist_ok=True)

    docs = query(
        '*[_type in ["homePage","tour","gallery","page","post"]'
        ' && (!defined(language) || language == "cs")]'
    )
    rank = {t: i for i, t in enumerate(SECTIONS)}
    docs.sort(key=lambda d: (rank[d["_type"]], d.get("order") if d.get("order") is not None else 999, cs(d.get("title"))))

    rows = []
    doc_index = defaultdict(int)
    for doc in docs:
        title, url, images = describe(doc)
        if not images:
            continue
        section = SECTIONS[doc["_type"]]
        doc_index[section] += 1
        folder = Path(section)
        if doc["_type"] != "homePage":
            folder = folder / f"{doc_index[section]:02d} {safe(title)}"
        for n, (path, img, where) in enumerate(images, 1):
            rows.append(
                {
                    "doc": doc,
                    "folder": folder,
                    "short": "Úvodní stránka" if doc["_type"] == "homePage" else safe(title),
                    "n": n,
                    "path": path,
                    "img": img,
                    "where": where,
                    "url": url,
                }
            )

    by_asset = defaultdict(list)
    for i, r in enumerate(rows, 1):
        r["id"] = i
        r["ref"] = r["img"]["asset"]["_ref"]
        by_asset[r["ref"]].append(i)
        r["file"] = r["folder"] / f"{i:03d} {r['short']} {r['n']}.jpg"

    print(f"{len(rows)} fotek, {len(by_asset)} různých, stahuji…")
    thumbs = {}
    for r in rows:
        target = out / r["file"]
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes(get(image_url(r["ref"], "w=1600&h=1600&fit=max&fm=jpg&q=85")))
        if r["ref"] not in thumbs:
            thumbs[r["ref"]] = get(image_url(r["ref"], "w=200&h=130&fit=max&fm=jpg&q=70"))
        print(f"  {r['file']}")

    wb = Workbook()
    font = "Arial"
    thin = Side(style="thin", color="BFBFBF")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    wrap = Alignment(wrap_text=True, vertical="top")

    # ---- instructions
    guide = wb.active
    guide.title = "Návod"
    lines = [
        ("Alt texty fotografií – Zámek Rosice", Font(name=font, size=16, bold=True)),
        (f"Stav k {date.today().strftime('%d. %m. %Y')}, {len(rows)} fotografií na webu.", None),
        ("", None),
        ("Co je alt text", Font(name=font, bold=True, size=12)),
        ("Krátký popis toho, co je na fotografii. Čte ho nahlas čtečka obrazovky nevidomým návštěvníkům,", None),
        ("zobrazí se, když se fotka nenačte, a podle něj fotku chápou vyhledávače.", None),
        ("", None),
        ("Jak postupovat", Font(name=font, bold=True, size=12)),
        ("1. Na listu „Fotografie“ najdete každou fotku pod číslem. Stejné číslo má soubor ve složce.", None),
        ("2. Ve sloupci „Současný alt text“ je to, co je na webu teď.", None),
        ("3. Do žlutého sloupce „NOVÝ alt text“ napište lepší popis. Když je současný v pořádku, nechte žluté pole prázdné.", None),
        ("4. Do sloupce „Poznámka“ můžete napsat cokoliv pro nás (např. „fotku bych vyměnil“).", None),
        ("5. Řádky prosím neřaďte ani nemažte – obrázky v tabulce by se rozházely. Soubor nám pak pošlete zpět.", None),
        ("", None),
        ("Jak psát dobrý alt text", Font(name=font, bold=True, size=12)),
        ("• Jednou větou popište, co je na fotce vidět, a co je na ní podstatné (místnost, předmět, událost).", None),
        ("• Nezačínejte slovy „Fotografie…“ ani „Obrázek…“ – čtečka to oznámí sama.", None),
        ("• Ideálně do 125 znaků (sloupec „Znaků“ je spočítá).", None),
        ("• Konkrétně: místo „Zámecký okruh“ raději „Rytířský sál s kazetovým stropem a krbem“.", None),
        ("• Stejná fotka může být na webu víckrát – pak má v tabulce víc řádků, na každém místě může mít jiný popis.", None),
        ("", None),
        ("Příklad", Font(name=font, bold=True, size=12)),
        ("Současný alt text:  Fotografie ze zámku Rosice", None),
        ("NOVÝ alt text:        Renesanční arkádové nádvoří zámku s kamennou balustrádou", None),
        ("", None),
        ("Odkazy na stránky vedou na zkušební verzi nového webu.", Font(name=font, italic=True, color="808080")),
    ]
    for i, (text, f) in enumerate(lines, 1):
        c = guide.cell(row=i, column=1, value=text)
        c.font = f or Font(name=font, size=11)
    guide.column_dimensions["A"].width = 110

    # ---- photos
    ws = wb.create_sheet("Fotografie")
    headers = [
        ("Č.", 6),
        ("Náhled", 30),
        ("Soubor ve složce", 34),
        ("Kde na webu", 34),
        ("Odkaz na stránku", 18),
        ("Popisek pod fotkou (jen pro informaci)", 26),
        ("Současný alt text", 34),
        ("NOVÝ alt text (doplňte)", 46),
        ("Znaků", 8),
        ("Poznámka", 28),
    ]
    head_fill = PatternFill("solid", start_color="3B2F2A")
    fill_in = PatternFill("solid", start_color="FFF2B3")
    for col, (h, w) in enumerate(headers, 1):
        c = ws.cell(row=1, column=col, value=h)
        c.font = Font(name=font, bold=True, color="FFFFFF")
        c.fill = head_fill
        c.alignment = Alignment(wrap_text=True, vertical="center")
        c.border = border
        ws.column_dimensions[get_column_letter(col)].width = w
    ws.cell(row=1, column=8).fill = PatternFill("solid", start_color="C9A227")
    ws.cell(row=1, column=8).font = Font(name=font, bold=True, color="000000")
    ws.row_dimensions[1].height = 32
    ws.freeze_panes = "C2"

    for r in rows:
        row = r["id"] + 1
        same = [x for x in by_asset[r["ref"]] if x != r["id"]]
        where = r["where"] + (f"\n(stejná fotka i u č. {', '.join(map(str, same))})" if same else "")
        values = [
            r["id"],
            None,
            str(r["file"]).replace("/", "\\"),
            where,
            "otevřít stránku",
            cs(r["img"].get("caption")),
            cs(r["img"].get("alt")),
            None,
            f'=IF(H{row}="","",LEN(H{row}))',
            None,
        ]
        for col, v in enumerate(values, 1):
            c = ws.cell(row=row, column=col, value=v)
            c.font = Font(name=font, size=10)
            c.alignment = wrap
            c.border = border
        ws.cell(row=row, column=1).alignment = Alignment(horizontal="center", vertical="top")
        ws.cell(row=row, column=1).font = Font(name=font, size=11, bold=True)
        link = ws.cell(row=row, column=5)
        link.hyperlink = r["url"]
        link.font = Font(name=font, size=10, color="0563C1", underline="single")
        ws.cell(row=row, column=7).font = Font(name=font, size=11)
        h = ws.cell(row=row, column=8)
        h.fill = fill_in
        h.font = Font(name=font, size=11)
        ws.cell(row=row, column=9).alignment = Alignment(horizontal="center", vertical="top")
        ws.row_dimensions[row].height = 104

        pic = XlImage(io.BytesIO(thumbs[r["ref"]]))
        scale = min(200 / pic.width, 130 / pic.height, 1)
        pic.width, pic.height = int(pic.width * scale), int(pic.height * scale)
        ws.add_image(pic, f"B{row}")

    ws.print_title_rows = "1:1"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    wb.active = 1

    # ---- what read.py needs to write the texts back
    data = wb.create_sheet("_data")
    data.append(["id", "docId", "docType", "path", "assetRef", "altCs", "altEn", "altDe"])
    for r in rows:
        alt = r["img"].get("alt") or {}
        data.append([r["id"], r["doc"]["_id"], r["doc"]["_type"], r["path"], r["ref"],
                     alt.get("cs", ""), alt.get("en", ""), alt.get("de", "")])
    data.sheet_state = "veryHidden"

    xlsx = out / f"Alt texty – k doplnění {stamp}.xlsx"
    wb.save(xlsx)

    archive = out_root / f"{name}.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(out.rglob("*")):
            if f.is_file():
                z.write(f, Path(name) / f.relative_to(out))
    print(f"\nHotovo: {out}\nExcel: {xlsx}\nZIP:   {archive}")


if __name__ == "__main__":
    main()
