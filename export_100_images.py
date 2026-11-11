"""
Export 100 CT Scan Images per Class (Benign, Malignant, Normal)

1. Collects 100 Benign images (all available), 100 Malignant images, and 100 Normal images.
2. Organizes them into a clean folder structure:
   Lung_Cancer_Dataset_100_Samples/
     ├── Benign/     (100 images)
     ├── Malignant/  (100 images)
     └── Normal/     (100 images)
3. Creates a ZIP package: Lung_Cancer_Dataset_100_Samples.zip
4. Copies to:
   - Project Root
   - frontend/public/ (for instant browser download via port 8080)
   - User's Desktop
"""

import os
import glob
import shutil
import zipfile

def export_100_images():
    base_dir = "backend/data"
    output_folder = "Lung_Cancer_Dataset_100_Samples"
    classes = ["Benign", "Malignant", "Normal"]
    
    os.makedirs(output_folder, exist_ok=True)
    
    print("=" * 60)
    print("PulmoScan AI — Exporting 100 CT Images Per Class")
    print("=" * 60)
    
    summary = {}
    
    for cls in classes:
        cls_dir = os.path.join(output_folder, cls)
        os.makedirs(cls_dir, exist_ok=True)
        
        # Gather all images across train, val, and test for this class
        all_imgs = []
        for split in ["train", "val", "test"]:
            pattern = os.path.join(base_dir, split, cls, "*.*")
            found = glob.glob(pattern)
            all_imgs.extend(found)
        
        # Deduplicate paths
        all_imgs = sorted(list(set(all_imgs)))
        
        # Take up to 100 images
        selected = all_imgs[:100]
        
        for idx, img_path in enumerate(selected):
            ext = os.path.splitext(img_path)[1]
            if not ext:
                ext = ".jpg"
            dest_name = f"{cls}_{idx+1:03d}{ext}"
            dest_path = os.path.join(cls_dir, dest_name)
            shutil.copy2(img_path, dest_path)
            
        summary[cls] = len(selected)
        print(f"[OK] Saved {len(selected)} images for class: {cls}")
    
    print("\nCreating ZIP archive: Lung_Cancer_Dataset_100_Samples.zip...")
    zip_path = "Lung_Cancer_Dataset_100_Samples.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(output_folder):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ".")
                z.write(full_path, rel_path)
    
    print(f"[OK] ZIP archive created successfully: {os.path.abspath(zip_path)}")
    
    # Copy to frontend/public for HTTP download
    public_dest = os.path.join("frontend", "public", "Lung_Cancer_Dataset_100_Samples.zip")
    shutil.copy2(zip_path, public_dest)
    print(f"[OK] Copied to web download directory: {public_dest}")
    
    # Copy to Desktop
    desktop_folder = os.path.expanduser("~/Desktop/Lung_Cancer_Dataset_100_Samples")
    desktop_zip = os.path.expanduser("~/Desktop/Lung_Cancer_Dataset_100_Samples.zip")
    try:
        if os.path.exists(desktop_folder):
            shutil.rmtree(desktop_folder)
        shutil.copytree(output_folder, desktop_folder)
        shutil.copy2(zip_path, desktop_zip)
        print(f"[OK] Copied folder to Desktop: {desktop_folder}")
        print(f"[OK] Copied ZIP to Desktop   : {desktop_zip}")
    except Exception as e:
        print(f"Notice on Desktop copy: {e}")
        
    print("=" * 60)
    print(f"TOTAL EXPORTED: {sum(summary.values())} images (100 Benign, 100 Malignant, 100 Normal)")
    print("=" * 60)

if __name__ == "__main__":
    export_100_images()
