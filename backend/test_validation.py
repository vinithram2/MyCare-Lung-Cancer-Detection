import os
import io
import json
import uuid
import urllib.request
import urllib.error
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLES_DIR = os.path.join(BASE_DIR, 'frontend', 'public', 'samples')

def post_multipart(url, filename, data, content_type='image/jpeg'):
    boundary = uuid.uuid4().hex
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f'Content-Type: {content_type}\r\n\r\n'
    ).encode('utf-8') + data + f'\r\n--{boundary}--\r\n'.encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

print("--- Testing Real Chest CT Scans ---")
samples = ['sample_normal_1.jpg', 'sample_benign_1.jpg', 'sample_malignant_1.jpg']
for s in samples:
    path = os.path.join(SAMPLES_DIR, s)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            data = f.read()
        status, resp = post_multipart('http://localhost:8000/api/predict', s, data)
        try:
            parsed = json.loads(resp)
            print(f"PASS: {s} -> HTTP {status} | Prediction: {parsed.get('class_name')} ({parsed.get('confidence')*100:.1f}%)")
        except Exception:
            print(f"FAIL: {s} -> HTTP {status} | {resp}")

print("\n--- Testing Random / Non-CT Images (Must Reject With Error) ---")
# 1. Colored picture
img_color = Image.new('RGB', (224, 224), (255, 60, 60))
buf = io.BytesIO()
img_color.save(buf, format='JPEG')
status, resp = post_multipart('http://localhost:8000/api/predict', 'colored_photo.jpg', buf.getvalue())
print(f"Colored photo -> HTTP {status} | Response: {resp.strip()}")

# 2. White document / paper
img_white = Image.new('RGB', (224, 224), (245, 245, 245))
buf2 = io.BytesIO()
img_white.save(buf2, format='JPEG')
status, resp = post_multipart('http://localhost:8000/api/predict', 'document.jpg', buf2.getvalue())
print(f"Document scan -> HTTP {status} | Response: {resp.strip()}")

# 3. Nature / landscape simulation (green/blue gradient)
img_grad = Image.new('RGB', (224, 224), (30, 180, 70))
buf3 = io.BytesIO()
img_grad.save(buf3, format='JPEG')
status, resp = post_multipart('http://localhost:8000/api/predict', 'landscape.jpg', buf3.getvalue())
print(f"Landscape image -> HTTP {status} | Response: {resp.strip()}")
