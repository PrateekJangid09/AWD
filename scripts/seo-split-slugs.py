import math
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "output" / "seo_missing_adjusted.csv"
OUT_DIR = ROOT / "scripts" / "output" / "seo_slug_batches"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def create_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")


def main():
    df = pd.read_csv(SOURCE).fillna("")
    slugs = [create_slug(n) for n in df["name"]]
    slugs = [s for s in slugs if s]

    batch_size = 200
    total = len(slugs)
    batches = math.ceil(total / batch_size)

    for i in range(batches):
        batch = slugs[i * batch_size : (i + 1) * batch_size]
        (OUT_DIR / f"batch_{i + 1:04d}.txt").write_text("\n".join(batch), encoding="utf-8")

    print(f"Batches: {batches} total_slugs={total}")


if __name__ == "__main__":
    main()
