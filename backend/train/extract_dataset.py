"""
PulmoScan AI — Dataset Extraction & Standardization Script

Extracts the IQ-OTH/NCCD Lung Cancer CT dataset from 'archive (1).zip'
and organizes images into a clean 3-class structure:
  - Normal
  - Benign
  - Malignant
"""

import os
import shutil
import zipfile
from collections import defaultdict


def extract_and_organize(zip_path: str = "archive (1).zip", output_dir: str = "backend/data"):
    if not os.path.exists(zip_path):
        print(f"Error: {zip_path} not found.")
        return

    os.makedirs(output_dir, exist_ok=True)
    for split in ["train", "val", "test"]:
        for cls in ["Normal", "Benign", "Malignant"]:
            os.makedirs(os.path.join(output_dir, split, cls), exist_ok=True)

    print(f"Extracting dataset from '{zip_path}'...")
    z = zipfile.ZipFile(zip_path)
    members = z.namelist()

    stats = defaultdict(int)

    for m in members:
        if not m.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        parts = m.split("/")
        lower_path = m.lower()

        # Determine split
        if "/train/" in lower_path:
            target_split = "train"
        elif "/valid/" in lower_path or "/val/" in lower_path:
            target_split = "val"
        elif "/test/" in lower_path or "test cases" in lower_path:
            target_split = "test"
        else:
            target_split = "train"

        # Determine class: 3-class mapping
        if "normal" in lower_path:
            target_class = "Normal"
        elif "bengin" in lower_path or "benign" in lower_path:
            target_class = "Benign"
        elif any(
            mal in lower_path
            for mal in [
                "malignant",
                "adenocarcinoma",
                "large.cell.carcinoma",
                "squamous.cell.carcinoma",
            ]
        ):
            target_class = "Malignant"
        else:
            continue

        filename = os.path.basename(m)
        if not filename:
            continue

        dest_dir = os.path.join(output_dir, target_split, target_class)
        dest_path = os.path.join(dest_dir, filename)

        # Avoid collision
        idx = 1
        base, ext = os.path.splitext(filename)
        while os.path.exists(dest_path):
            dest_path = os.path.join(dest_dir, f"{base}_{idx}{ext}")
            idx += 1

        with z.open(m) as src, open(dest_path, "wb") as dst:
            shutil.copyfileobj(src, dst)

        stats[f"{target_split}/{target_class}"] += 1

    print("\nDataset extraction complete! Image counts per split:")
    for k in sorted(stats.keys()):
        print(f"  {k}: {stats[k]} images")

    total_images = sum(stats.values())
    print(f"Total organized images: {total_images}")


if __name__ == "__main__":
    extract_and_organize()
