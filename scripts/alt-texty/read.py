"""
Read the workbook the castellan returned and list the alt texts to change.

    python scripts/alt-texty/read.py "<returned>.xlsx" [out.json]

Takes the yellow column ("NOVÝ alt text") of every row that has one and pairs it,
by the number in the first column, with the Sanity document and path stored on
the workbook's hidden `_data` sheet. Rows left empty, or with the same text as
before, are skipped. Notes from the "Poznámka" column are printed so none gets
lost. Writes the changes as JSON for `apply.ts` (default tmp/alt-texty/zmeny.json).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from openpyxl import load_workbook


def text(value) -> str:
    return " ".join(str(value).split()) if value is not None else ""


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # Czech names in a Windows console
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "tmp/alt-texty/zmeny.json")

    wb = load_workbook(src)
    data = {row[0]: row for row in wb["_data"].iter_rows(min_row=2, values_only=True) if row[0]}
    ws = wb["Fotografie"]
    header = [text(c.value) for c in ws[1]]
    col = {name: header.index(name) for name in header}
    c_id = col["Č."]
    c_new = next(i for h, i in col.items() if h.startswith("NOVÝ alt text"))
    c_note = col.get("Poznámka")

    changes, notes, unchanged = [], [], 0
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not isinstance(row[c_id], (int, float)):
            continue
        pid = int(row[c_id])
        if pid not in data:
            sys.exit(f"Řádek č. {pid} není v listu _data – workbook neodpovídá exportu.")
        _, doc_id, doc_type, path, asset, alt_cs, alt_en = data[pid][:7]
        new = text(row[c_new])
        if c_note is not None and text(row[c_note]):
            notes.append((pid, text(row[c_note])))
        if not new:
            continue
        if new == text(alt_cs):
            unchanged += 1
            continue
        changes.append(
            {
                "id": pid,
                "docId": doc_id,
                "docType": doc_type,
                "path": path,
                "assetRef": asset,
                "old": alt_cs or "",
                "new": new,
                "hadTranslation": bool(alt_en),
            }
        )

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(changes, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(changes)} nových alt textů, {unchanged} beze změny → {out}")
    long = [c["id"] for c in changes if len(c["new"]) > 125]
    if long:
        print(f"Delší než 125 znaků: č. {', '.join(map(str, long))}")
    if notes:
        print("\nPoznámky:")
        for pid, note in notes:
            print(f"  č. {pid}: {note}")


if __name__ == "__main__":
    main()
