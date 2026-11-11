import os
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from app.models.inference import load_model_if_needed, _loaded_class_names

model = load_model_if_needed()
img_path = r'C:/Users/vinit/.gemini/antigravity/brain/8f477399-9a4c-4ce2-af1c-8423d38d22aa/.user_uploaded/media_1794412160706_d1e8234e.jpg'

img = Image.open(img_path).convert('RGB')
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
tensor = transform(img).unsqueeze(0)

model.eval()
with torch.no_grad():
    out = model(tensor)
    probs = torch.softmax(out, dim=1).cpu().numpy()[0]

print('Classes:', _loaded_class_names)
for c, p in zip(_loaded_class_names, probs):
    print(f'{c}: {p*100:.2f}%')
pred_idx = np.argmax(probs)
print(f'Prediction: {_loaded_class_names[pred_idx]} ({probs[pred_idx]*100:.2f}%)')
