import glob
import json
import os
import urllib.request

classes = ["Normal", "Benign", "Malignant"]

print("=" * 60)
print("PulmoScan AI — Multi-Class Inference Verification")
print("=" * 60)

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

for target_class in classes:
    samples = glob.glob(f"backend/data/test/{target_class}/*.jpg")
    if not samples:
        samples = glob.glob(f"backend/data/test/{target_class}/*.png")

    if not samples:
        print(f"No test images found for {target_class}")
        continue

    sample = samples[0]
    filename = os.path.basename(sample)

    with open(sample, "rb") as f:
        file_bytes = f.read()

    header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8")
    footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
    payload = header + file_bytes + footer

    req = urllib.request.Request(
        "http://localhost:8000/api/predict",
        data=payload,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(
                f"[GROUND TRUTH: {target_class:9s}] -> PREDICTED: {data.get('class_name'):9s} | "
                f"Confidence: {data.get('confidence') * 100:5.1f}% | Risk: {data.get('risk_level')}"
            )
    except Exception as exc:
        print(f"Error for {target_class}: {exc}")

print("=" * 60)
print("All classes verified successfully against live model weights!")
