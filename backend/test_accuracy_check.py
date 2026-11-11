import os
import sys

sys.path.insert(0, os.path.abspath('backend'))
from app.models.inference import load_model_if_needed, pytorch_predict

def test_samples():
    model = load_model_if_needed()
    if model is None:
        print("[FAIL] Failed to load PyTorch model!")
        return
    print("[SUCCESS] PulmoScan PyTorch Model Loaded Successfully.\n")
    
    test_dirs = {
        'Benign': 'backend/data/test/Benign',
        'Malignant': 'backend/data/test/Malignant',
        'Normal': 'backend/data/test/Normal'
    }
    
    correct = 0
    total = 0
    
    for true_label, folder in test_dirs.items():
        if not os.path.exists(folder):
            print(f"Directory not found: {folder}")
            continue
        files = [f for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:10]
        print(f"--- Testing {true_label} ({len(files)} samples) ---")
        for filename in files:
            filepath = os.path.join(folder, filename)
            with open(filepath, 'rb') as fp:
                img_bytes = fp.read()
            res = pytorch_predict(img_bytes)
            pred_label = res['class_name']
            conf = res['confidence'] * 100
            is_match = (pred_label.lower() == true_label.lower())
            if is_match:
                correct += 1
            total += 1
            status = "[MATCH]" if is_match else "[MISMATCH]"
            print(f"{status:<10} File: {filename:<25} -> Pred: {pred_label:<10} ({conf:5.1f}%) | True: {true_label}")
        print()
        
    if total > 0:
        print(f"Accuracy across sampled test set: {correct}/{total} ({correct/total*100:.1f}%)")

if __name__ == "__main__":
    test_samples()
