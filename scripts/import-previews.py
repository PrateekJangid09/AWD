#!/usr/bin/env python3
"""Convert extractor preview HTML files into RankBeaver-style canonical records."""

from __future__ import annotations

import base64
import html as html_lib
import io
import json
import re
import zipfile
from pathlib import Path

from PIL import Image

ZIP_PATH = Path("/tmp/awd-html-pack/file")
ROOT = Path("/workspace")
CONTENT = ROOT / "content" / "sites"
PUBLIC = ROOT / "public" / "sites"
REMOVED = ROOT / "content" / "removed-sites.txt"

IGNORE_RAW = """
Make Garden
Jump Seat
Superwhisper
Joost.design
swapsmore.com
april-taylor.com
Backgrounds.supply
oceanx.org
theycallmeguilo.com
Elev8h2o.shop
thecodeflow.co
redflagforcash.com
unseen.co
Poly.app
riact.ai
Expo.dev
heyparker.ai
ousmaneballondor.fr
Tenbinlabs.xyz
Whilst.app
monodeaf.com
tabkitchenbakery.com
Sav.money
oliviercarigan.com
Manuelmoreale.dev
gunespaken.com
cityxofxangels.co
equatorcompany.com
webflow.io
hebbia.com
worldcupnext.com
Mainframe.app
Collabcapitoium
heavenincolor.com
invoicemon.com
isadeburgh.com
withnovu.com
typeform.com
giorgospapadakis.com
gabrielcontassot.com
basedesign.com
ccyran.com
ondastudio.co
jyang.io
greymac.com
angel-estrada.com
studiomaertens.com
Moonsafari.archi
icebergdoc.org
fernandopuente.es
rogierdeboeve.com
designstudios.cc
familytype.co
in4out-agentur.ch
Fedevitale.dev
reed.be
johnbengtsson.com
Grammar.works
turbulent.ca
universalsans.com
hellobala.co
vanholtz.co
frankchimero.com
Thestorage.online
Thebrowser.company
safesecurity.co.uk
Playbit.app
Herei.cam
kaiunta.com
gunespeksen.com
oliviercarignan.com
Sinceyouarrived.world
perplexity.ai
""".strip().splitlines()

TLDS = (
    ".com.au",
    ".co.uk",
    ".com",
    ".org",
    ".net",
    ".io",
    ".ai",
    ".app",
    ".dev",
    ".co",
    ".xyz",
    ".fr",
    ".nl",
    ".it",
    ".es",
    ".ch",
    ".ca",
    ".be",
    ".archi",
    ".online",
    ".company",
    ".works",
    ".shop",
    ".live",
    ".page",
    ".music",
    ".wtf",
    ".ar",
    ".so",
    ".sh",
    ".one",
    ".studio",
    ".agency",
    ".digital",
    ".design",
    ".world",
    ".supply",
    ".cam",
)


def norm(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"^https?://", "", value)
    value = value.removeprefix("www.")
    value = value.split("/")[0]
    return re.sub(r"[^a-z0-9]+", "", value)


IGNORE = {norm(x) for x in IGNORE_RAW if x.strip()}
if REMOVED.exists():
    IGNORE |= {norm(x) for x in REMOVED.read_text().splitlines() if x.strip() and not x.startswith("#")}


def is_ignored(domain: str, name: str) -> bool:
    candidates = {norm(domain), norm(name), norm(domain.split(".")[0]), norm(name.replace(" ", ""))}
    return bool(candidates & IGNORE)


def slug_from_domain(domain: str) -> str:
    host = domain.lower().removeprefix("www.")
    for tld in TLDS:
        if host.endswith(tld):
            host = host[: -len(tld)]
            break
    slug = re.sub(r"[^a-z0-9]+", "-", host).strip("-")
    return slug or re.sub(r"[^a-z0-9]+", "-", domain).strip("-")


def text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = html_lib.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def pills(value: str) -> list[str]:
    found = re.findall(r'<span class="pill">(.*?)</span>', value, re.S)
    return [text(p) for p in found if text(p) and text(p) != "-"]


def conf(value: str) -> float | None:
    m = re.search(r'<span class="conf"[^>]*>(\d+)%</span>', value)
    return int(m.group(1)) / 100 if m else None


def decode_data_uri(uri: str) -> bytes | None:
    if not uri.startswith("data:image"):
        return None
    try:
        header, data = uri.split(",", 1)
        raw = base64.b64decode(data)
        return raw if raw else None
    except Exception:
        return None


def save_image(raw: bytes, dest: Path, max_w: int = 900, quality: int = 72) -> str | None:
    try:
        img = Image.open(io.BytesIO(raw))
        img = img.convert("RGB") if img.mode in ("RGBA", "P", "LA") else img.convert("RGB")
        if img.width > max_w:
            ratio = max_w / img.width
            img = img.resize((max_w, max(1, int(img.height * ratio))), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "WEBP", quality=quality, method=6)
        return dest.name
    except Exception:
        return None


def save_favicon(raw: bytes, dest: Path) -> str | None:
    try:
        img = Image.open(io.BytesIO(raw))
        img = img.convert("RGBA")
        img.thumbnail((64, 64))
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "PNG")
        return dest.name
    except Exception:
        return None


def parse_preview(html: str, filename: str) -> dict | None:
    domain = re.sub(r"\.html$", "", filename)
    name_m = re.search(r"<h1>(.*?)</h1>", html, re.S)
    name = text(name_m.group(1)) if name_m else domain
    if is_ignored(domain, name):
        return None

    dom_m = re.search(r'<div class="dom">(.*?)</div>', html, re.S)
    domain = text(dom_m.group(1)) if dom_m else domain
    if is_ignored(domain, name):
        return None

    visit = re.search(r'<a class="visit" href="([^"]+)"', html)
    url = visit.group(1) if visit else f"https://{domain}"
    badge = re.search(r'<span class="idbadge">(.*?)</span>', html)
    site_id = text(badge.group(1)) if badge else None
    desc_m = re.search(r'<p style="margin:0 0 22px[^"]*"[^>]*>(.*?)</p>', html, re.S)
    description = text(desc_m.group(1)) if desc_m else ""

    pairs: dict[str, str] = {}
    for k, v in re.findall(r'<td class="k">(.*?)</td>\s*<td class="v">(.*?)</td>', html, re.S):
        pairs[text(k).lower()] = v

    def pair_pills(key: str) -> list[str]:
        return pills(pairs.get(key, ""))

    def pair_text(key: str) -> str:
        return text(pairs.get(key, ""))

    fonts = []
    for pill in pair_pills("fonts"):
        m = re.match(r"(.+?)\s*\(([^)]+)\)(?:\s*·\s*(\d+)[–-](\d+)px)?", pill)
        if m:
            fonts.append(
                {
                    "name": m.group(1).strip(),
                    "role": m.group(2).strip(),
                    "weights": [],
                    "sizes": [int(m.group(3)), int(m.group(4))] if m.group(3) else [],
                }
            )
        else:
            fonts.append({"name": pill, "role": "body", "weights": [], "sizes": []})

    swatches = []
    for m in re.finditer(r'<span title="(#[0-9a-fA-F]{3,8})\s*·\s*([^"]+)"', html):
        swatches.append({"hex": m.group(1).lower(), "role": m.group(2).strip().lower(), "coverage": 0})

    primary = pair_text("primary").lower()
    if primary.startswith("#") is False:
        primary = re.search(r"#[0-9a-fA-F]{3,8}", primary)
        primary = primary.group(0).lower() if primary else (swatches[2]["hex"] if len(swatches) > 2 else None)

    tech_summary = ""
    tech_block = re.search(
        r'<h2>Tech stack</h2>\s*<div style="font-weight:700[^"]*">(.*?)</div>',
        html,
        re.S,
    )
    if tech_block:
        tech_summary = text(tech_block.group(1))

    pages = {}
    for key in ("homepage", "about", "contact", "pricing", "careers", "blog", "jobs"):
        if key in pairs:
            href = re.search(r'href="([^"]+)"', pairs[key])
            pages[key] = href.group(1) if href else pair_text(key) or None

    email = ""
    em = re.search(r'mailto:([^"]+)"', pairs.get("email", ""))
    if em:
        email = em.group(1)
    else:
        email = pair_text("email")
        if email == "-":
            email = ""

    linkedin = pair_text("linkedin")
    x = pair_text("x")

    fav = re.search(r'<img class="fav" src="(data:image[^"]+)"', html)
    shot = re.search(r'<img class="shot" src="(data:image[^"]+)"', html)
    page_shots = re.findall(
        r'<figure><img src="(data:image[^"]+|)" alt="([^"]*)"', html
    )

    slug = slug_from_domain(domain)
    return {
        "slug": slug,
        "domain": domain,
        "name": name,
        "url": url,
        "site_id": site_id,
        "description": description,
        "pairs": pairs,
        "fonts": fonts,
        "swatches": swatches,
        "primary": primary,
        "tech_summary": tech_summary,
        "pages": pages,
        "email": email,
        "linkedin": None if linkedin in {"", "-"} else linkedin,
        "x": None if x in {"", "-"} else x,
        "fav_uri": fav.group(1) if fav else None,
        "shot_uri": shot.group(1) if shot else None,
        "page_shots": [(src, alt) for src, alt in page_shots if src.startswith("data:image")],
        "style_tags": pair_pills("style"),
        "category": pair_pills("category")[0] if pair_pills("category") else None,
        "subcategory": pair_pills("subcategory")[0] if pair_pills("subcategory") else None,
        "website_type": pair_pills("website type")[0] if pair_pills("website type") else None,
        "audience": pair_pills("audience"),
        "conf_category": conf(pairs.get("category", "")),
        "conf_sub": conf(pairs.get("subcategory", "")),
        "conf_type": conf(pairs.get("website type", "")),
        "conf_aud": conf(pairs.get("audience", "")),
        "framework": pair_pills("framework"),
        "language": pair_pills("language")[0] if pair_pills("language") else None,
        "hosting": pair_pills("hosting"),
        "cdn": pair_pills("cdn"),
        "web_server": pair_pills("web server"),
        "address": pair_text("address") if pair_text("address") not in {"", "-"} else None,
        "completeness": None,
    }


def build_record(parsed: dict, assets: dict) -> dict:
    palette = parsed["swatches"] or (
        [{"hex": parsed["primary"] or "#111111", "role": "primary", "coverage": 0}]
    )
    return {
        "schema_version": "1.0",
        "site_id": parsed["site_id"] or f"AWD-{parsed['slug']}",
        "extractor_version": "2.2.0",
        "identity": {
            "name": parsed["name"],
            "domain": parsed["domain"],
            "url": parsed["url"],
            "slug": parsed["slug"],
            "favicon": assets.get("favicon"),
        },
        "classification": {
            "category": parsed["category"],
            "subcategory": parsed["subcategory"],
            "website_type": parsed["website_type"],
            "audience": parsed["audience"],
            "confidence": parsed["conf_category"],
            "field_confidence": {
                "category": parsed["conf_category"],
                "subcategory": parsed["conf_sub"],
                "website_type": parsed["conf_type"],
                "audience": parsed["conf_aud"],
            },
        },
        "design": {
            "primary_color": parsed["primary"],
            "secondary_color": None,
            "accent_colors": [p["hex"] for p in palette if p["role"] == "accent"],
            "background_colors": [p["hex"] for p in palette if p["role"] in {"background", "surface"}],
            "text_color": next((p["hex"] for p in palette if p["role"] == "text"), None),
            "palette": palette,
            "fonts": parsed["fonts"],
            "style_tags": parsed["style_tags"],
        },
        "technology": {
            "summary": parsed["tech_summary"] or None,
            "builder_cms": [],
            "framework": parsed["framework"],
            "language": parsed["language"],
            "hosting": parsed["hosting"],
            "cdn": parsed["cdn"],
            "storage": [],
            "frontend": [],
            "ecommerce": [],
            "web_server": parsed["web_server"],
        },
        "contact": {
            "email": parsed["email"] or None,
            "on_official_domain": None,
            "other_emails": [],
            "address": parsed["address"],
        },
        "social": {"linkedin": parsed["linkedin"], "x": parsed["x"]},
        "seo": {"title": parsed["name"], "description": parsed["description"]},
        "pages": parsed["pages"],
        "screenshots": {
            "desktop": assets.get("desktop"),
            "pages": assets.get("pages", []),
        },
        "assets": {"favicon": assets.get("favicon")},
        "extraction": {
            "status": "complete",
            "extracted_at": None,
            "completeness": 100 if assets.get("desktop") else 80,
            "extractor_version": "2.2.0",
        },
    }


def main() -> None:
    CONTENT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    zf = zipfile.ZipFile(ZIP_PATH)
    names = [n for n in zf.namelist() if n.startswith("previews/") and n.endswith(".html")]
    imported = 0
    skipped = []
    used_slugs: set[str] = set()

    for i, name in enumerate(sorted(names), 1):
        filename = Path(name).name
        html = zf.read(name).decode("utf-8", errors="replace")
        parsed = parse_preview(html, filename)
        if parsed is None:
            skipped.append(filename)
            continue

        slug = parsed["slug"]
        base = slug
        n = 2
        while slug in used_slugs:
            slug = f"{base}-{n}"
            n += 1
        parsed["slug"] = slug
        used_slugs.add(slug)

        out_dir = PUBLIC / slug
        assets: dict = {"pages": []}
        if parsed["fav_uri"]:
            raw = decode_data_uri(parsed["fav_uri"])
            if raw:
                assets["favicon"] = save_favicon(raw, out_dir / "favicon.png")
        if parsed["shot_uri"]:
            raw = decode_data_uri(parsed["shot_uri"])
            if raw:
                assets["desktop"] = save_image(raw, out_dir / "desktop.webp", max_w=900)
        for src, alt in parsed["page_shots"][:4]:
            raw = decode_data_uri(src)
            if not raw:
                continue
            file_slug = re.sub(r"[^a-z0-9]+", "-", (alt or "page").lower()).strip("-") or "page"
            saved = save_image(raw, out_dir / f"{file_slug}.webp", max_w=720, quality=68)
            if saved:
                assets["pages"].append({"label": alt or "Page", "file": saved})

        record = build_record(parsed, assets)
        (CONTENT / f"{slug}.json").write_text(json.dumps(record, indent=2) + "\n")
        imported += 1
        if imported % 25 == 0:
            print(f"imported {imported}/{len(names)} (skipped {len(skipped)})", flush=True)

    print(json.dumps({"imported": imported, "skipped": skipped, "skipped_count": len(skipped)}, indent=2))


if __name__ == "__main__":
    main()
