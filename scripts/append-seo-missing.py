import csv
import re
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CURRENT_CSV = ROOT / "data" / "websites.csv"
MISSING_CSV = ROOT / "scripts" / "output" / "seo_missing.csv"
OUTPUT_DIR = ROOT / "scripts" / "output"
ADJUSTED_CSV = OUTPUT_DIR / "seo_missing_adjusted.csv"
SLUG_MAP_CSV = OUTPUT_DIR / "seo_missing_slug_map.csv"


def create_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")


def load_current_slugs():
    df = pd.read_csv(CURRENT_CSV).fillna("")
    slugs = set()
    for _, row in df.iterrows():
        name = str(row.get("name", "")).strip()
        slug = create_slug(name)
        if slug:
            slugs.add(slug)
    return slugs


def fallback_name_from_url(url: str) -> str:
    try:
        parsed = urlparse(url)
        if parsed.hostname:
            return parsed.hostname.replace("www.", "")
    except Exception:
        pass
    return "unnamed"


def make_unique_name(base_name: str, url: str, used_slugs: set) -> str:
    base_slug = create_slug(base_name)
    if not base_slug:
        base_name = fallback_name_from_url(url)
        base_slug = create_slug(base_name)

    if base_slug not in used_slugs:
        used_slugs.add(base_slug)
        return base_name

    counter = 2
    while True:
        candidate = f"{base_name} {counter}"
        candidate_slug = create_slug(candidate)
        if candidate_slug and candidate_slug not in used_slugs:
            used_slugs.add(candidate_slug)
            return candidate
        counter += 1


def main():
    if not MISSING_CSV.exists():
        raise SystemExit(f"Missing file: {MISSING_CSV}")

    current_slugs = load_current_slugs()
    used_slugs = set(current_slugs)

    df = pd.read_csv(MISSING_CSV).fillna("")
    adjusted_rows = []
    slug_map = []

    for _, row in df.iterrows():
        name = str(row.get("name", "")).strip()
        url = str(row.get("url", "")).strip()
        category = str(row.get("category", "")).strip()
        description = str(row.get("description", "")).strip()
        featured = str(row.get("featured", "")).strip().lower() == "true"
        hidden = str(row.get("hidden", "")).strip().lower() == "true"

        original_slug = create_slug(name)
        unique_name = make_unique_name(name, url, used_slugs)
        final_slug = create_slug(unique_name)

        adjusted_rows.append(
            {
                "name": unique_name,
                "url": url,
                "category": category,
                "description": description,
                "featured": str(featured).lower(),
                "hidden": str(hidden).lower(),
            }
        )
        slug_map.append(
            {
                "original_name": name,
                "original_slug": original_slug,
                "final_name": unique_name,
                "final_slug": final_slug,
                "url": url,
            }
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with ADJUSTED_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["name", "url", "category", "description", "featured", "hidden"]
        )
        writer.writeheader()
        writer.writerows(adjusted_rows)

    with SLUG_MAP_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["original_name", "original_slug", "final_name", "final_slug", "url"]
        )
        writer.writeheader()
        writer.writerows(slug_map)

    with CURRENT_CSV.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["name", "url", "category", "description", "featured", "hidden"]
        )
        for row in adjusted_rows:
            writer.writerow(row)

    print(f"Appended {len(adjusted_rows)} rows to {CURRENT_CSV}")
    print(f"Wrote adjusted CSV: {ADJUSTED_CSV}")
    print(f"Wrote slug map: {SLUG_MAP_CSV}")


if __name__ == "__main__":
    main()
