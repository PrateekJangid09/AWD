import csv
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
NEW_CSV = ROOT / "data" / "ultimate_seo_websites_final.csv"
CURRENT_CSV = ROOT / "data" / "websites.csv"
OUTPUT_DIR = ROOT / "scripts" / "output"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def create_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")


def has_specific_category(category: str) -> bool:
    cat = (category or "").strip()
    return cat not in ("", "Uncategorized", "Other") and cat.lower() != "other"


def is_valid_official_url(url: str, name: str) -> bool:
    try:
        if not url or not isinstance(url, str) or not url.strip():
            return False
        if not name or not isinstance(name, str):
            return False

        url_lower = url.lower().strip()
        if not url_lower.startswith("http://") and not url_lower.startswith("https://"):
            return False

        platform_domains = [
            "land-book.com",
            "saaslandingpage.com",
            "onepagelove.com",
            "webflow.com/made-in-webflow",
            "webflow.com/@",
            "a1.gallery",
        ]

        for platform in platform_domains:
            if platform in url_lower:
                return False

        url_obj = urlparse(url)
        domain = url_obj.hostname.lower().replace("www.", "") if url_obj.hostname else ""
        domain_parts = domain.split(".") if domain else []
        if not domain_parts:
            return False

        domain_without_tld = domain_parts[0]

        if len(domain_without_tld) > 30:
            return False

        name_slug = create_slug(name)
        if name_slug and len(name_slug) > 15 and len(domain_without_tld) > 20:
            name_slug_start = name_slug[: min(20, len(name_slug))]
            if name_slug_start in domain_without_tld and len(domain_without_tld) > 25:
                return False

        hyphen_count = domain_without_tld.count("-")
        if len(domain_without_tld) > 25 and hyphen_count > 3:
            return False

        return True
    except Exception:
        return False


def normalize_url_key(url: str) -> str:
    try:
        parsed = urlparse(url.strip())
        host = (parsed.hostname or "").lower()
        host = host[4:] if host.startswith("www.") else host
        path = (parsed.path or "").rstrip("/")
        return f"{host}{path}"
    except Exception:
        return ""


def to_bool(value) -> bool:
    if value is None:
        return False
    return str(value).strip().lower() == "true"


def load_current_visible():
    df = pd.read_csv(CURRENT_CSV)
    df = df.fillna("")
    visible = []
    for _, row in df.iterrows():
        name = str(row.get("name", "")).strip()
        url = str(row.get("url", "")).strip()
        category = str(row.get("category", "")).strip()
        hidden = to_bool(row.get("hidden", "false"))
        if hidden:
            continue
        if not name or name == "Unnamed":
            continue
        if not has_specific_category(category):
            continue
        if not is_valid_official_url(url, name):
            continue
        visible.append(
            {
                "name": name,
                "url": url,
                "slug": create_slug(name),
                "url_key": normalize_url_key(url),
            }
        )
    return visible


def load_new_rows():
    df = pd.read_csv(NEW_CSV)
    df = df.fillna("")
    column_map = {
        "Website Name": "name",
        "Official Website": "url",
        "Category": "category",
        "Description": "description",
        "Hidden": "hidden",
    }
    normalized = {}
    for col in df.columns:
        if col in column_map:
            normalized[col] = column_map[col]
        else:
            normalized[col] = col
    df = df.rename(columns=normalized)

    rows = []
    for _, row in df.iterrows():
        name = str(row.get("name", "")).strip()
        url = str(row.get("url", "")).strip()
        category = str(row.get("category", "")).strip()
        description = str(row.get("description", "")).strip()
        hidden = to_bool(row.get("hidden", "false"))
        rows.append(
            {
                "name": name,
                "url": url,
                "category": category,
                "description": description,
                "hidden": hidden,
            }
        )
    return rows


def main():
    if not NEW_CSV.exists():
        raise SystemExit(f"Missing new list CSV: {NEW_CSV}")
    if not CURRENT_CSV.exists():
        raise SystemExit(f"Missing current CSV: {CURRENT_CSV}")

    current_visible = load_current_visible()
    current_url_keys = {row["url_key"] for row in current_visible if row["url_key"]}
    current_slugs = {row["slug"] for row in current_visible if row["slug"]}

    new_rows = load_new_rows()
    existing = []
    missing = []
    invalid = []

    for row in new_rows:
        name = row["name"]
        url = row["url"]
        category = row["category"]
        description = row["description"]
        hidden = row["hidden"]

        if not name or name == "Unnamed":
            invalid.append({**row, "reason": "missing_name"})
            continue
        if not url or not url.startswith(("http://", "https://")):
            invalid.append({**row, "reason": "missing_or_invalid_url"})
            continue
        if not has_specific_category(category):
            invalid.append({**row, "reason": "non_specific_category"})
            continue
        if not is_valid_official_url(url, name):
            invalid.append({**row, "reason": "invalid_official_url"})
            continue

        url_key = normalize_url_key(url)
        slug = create_slug(name)
        if not slug:
            parsed = urlparse(url)
            fallback_name = parsed.hostname.replace("www.", "") if parsed.hostname else "unnamed"
            slug = create_slug(fallback_name)
            row["name"] = fallback_name
            name = fallback_name

        is_live = url_key in current_url_keys or slug in current_slugs
        if is_live:
            existing.append({**row, "slug": slug, "url_key": url_key})
        else:
            missing.append(
                {
                    "name": name,
                    "url": url,
                    "category": category,
                    "description": description,
                    "featured": False,
                    "hidden": hidden,
                    "slug": slug,
                    "url_key": url_key,
                }
            )

    report = {
        "new_total": len(new_rows),
        "current_visible_total": len(current_visible),
        "already_live_count": len(existing),
        "missing_count": len(missing),
        "invalid_count": len(invalid),
    }

    (OUTPUT_DIR / "seo_import_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    def write_csv(path: Path, rows, fieldnames):
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow({k: r.get(k, "") for k in fieldnames})

    write_csv(
        OUTPUT_DIR / "seo_existing.csv",
        existing,
        ["name", "url", "category", "description", "hidden", "slug", "url_key"],
    )
    write_csv(
        OUTPUT_DIR / "seo_missing.csv",
        missing,
        ["name", "url", "category", "description", "featured", "hidden"],
    )
    write_csv(
        OUTPUT_DIR / "seo_invalid.csv",
        invalid,
        ["name", "url", "category", "description", "hidden", "reason"],
    )

    (OUTPUT_DIR / "seo_missing_slugs.txt").write_text(
        "\n".join([m["slug"] for m in missing if m["slug"]]),
        encoding="utf-8",
    )

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
