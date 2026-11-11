"""
PulmoScan AI — Fast High-Efficiency SOTA Training Protocol (CPU Optimized)

- Freezes early conv layers (conv1, layer1, layer2)
- Fine-tunes high-level semantic layers (layer3, layer4) and custom classification head
- 1:1:1 Balanced WeightedRandomSampler for class balance
- Class-weighted loss for maximum benign sensitivity
- Runs fast on CPU with immediate console updates
"""

import os
import sys
import time
import copy
from collections import Counter
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, models, transforms

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_fast_sota(
    data_dir: str = "backend/data",
    num_epochs: int = 4,
    batch_size: int = 32,
    lr: float = 4e-4,
    save_path: str = "backend/weights/pulmoscan_model.pth"
):
    device = torch.device("cpu")
    print("=" * 70, flush=True)
    print("PulmoScan AI — High-Efficiency CPU Training Pipeline", flush=True)
    print(f"Device        : {device}", flush=True)
    print(f"Dataset root  : {data_dir}", flush=True)
    print(f"Epochs        : {num_epochs}", flush=True)
    print(f"Batch size    : {batch_size}", flush=True)
    print(f"Learning rate : {lr}", flush=True)
    print("=" * 70, flush=True)

    # 1. Image Transforms
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_dataset = datasets.ImageFolder(os.path.join(data_dir, "train"), train_transform)
    val_dataset = datasets.ImageFolder(os.path.join(data_dir, "val"), eval_transform)
    test_dataset = datasets.ImageFolder(os.path.join(data_dir, "test"), eval_transform)

    class_names = train_dataset.classes
    class_to_idx = train_dataset.class_to_idx
    print(f"Classes: {class_names}", flush=True)

    # 2. Balanced Sampling (1:1:1)
    class_counts = Counter(train_dataset.targets)
    class_weights = [1.0 / class_counts[i] for i in range(len(class_names))]
    sample_weights = [class_weights[label] for label in train_dataset.targets]
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # 3. Model Setup: ResNet-18 with selective layer fine-tuning
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Freeze early layers for speed on CPU
    for name, param in model.named_parameters():
        if "layer3" in name or "layer4" in name or "fc" in name:
            param.requires_grad = True
        else:
            param.requires_grad = False

    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.35),
        nn.Linear(256, len(class_names))
    )
    model = model.to(device)

    loss_weights = torch.tensor([3.0, 1.0, 1.2], dtype=torch.float32)
    criterion = nn.CrossEntropyLoss(weight=loss_weights, label_smoothing=0.02)
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-5)

    # 4. Training Loop
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_val_acc = 0.0

    print("\nStarting Fast Epochs...\n", flush=True)
    for epoch in range(num_epochs):
        t0 = time.time()
        model.train()
        running_loss, running_corrects = 0.0, 0

        for inputs, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            _, preds = torch.max(outputs, 1)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data).item()

        scheduler.step()
        train_loss = running_loss / len(train_dataset)
        train_acc = float(running_corrects) / len(train_dataset)

        model.eval()
        val_loss, val_corrects = 0.0, 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)
                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data).item()

        val_loss_epoch = val_loss / len(val_dataset)
        val_acc_epoch = float(val_corrects) / len(val_dataset)
        dt = time.time() - t0

        star = ""
        if val_acc_epoch >= best_val_acc:
            best_val_acc = val_acc_epoch
            best_model_wts = copy.deepcopy(model.state_dict())
            star = " [Best Model Checkpoint]"

        print(f"Epoch {epoch+1}/{num_epochs} ({dt:.1f}s) | Train Acc: {train_acc*100:.1f}% | Val Acc: {val_acc_epoch*100:.1f}%{star}", flush=True)

    print(f"\nTraining completed in {time.time() - since:.1f}s", flush=True)

    # 5. Save Model Checkpoint
    model.load_state_dict(best_model_wts)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save({
        'state_dict': model.state_dict(),
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_balanced',
        'accuracy': float(best_val_acc)
    }, save_path)
    print(f"Model saved to: {save_path}", flush=True)

    # 6. Evaluate Test Set
    model.eval()
    test_corrects = 0
    per_class_correct = [0] * len(class_names)
    per_class_total = [0] * len(class_names)

    with torch.no_grad():
        for inputs, labels in test_loader:
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            test_corrects += torch.sum(preds == labels.data).item()
            for p, l in zip(preds, labels):
                if p == l:
                    per_class_correct[l] += 1
                per_class_total[l] += 1

    test_acc = float(test_corrects) / len(test_dataset)
    print(f"\nFinal Test Overall Accuracy: {test_acc * 100:.2f}%", flush=True)
    for idx, cls in enumerate(class_names):
        acc = (per_class_correct[idx] / per_class_total[idx]) * 100 if per_class_total[idx] > 0 else 0
        print(f"  • {cls:12s} : {acc:5.2f}% ({per_class_correct[idx]}/{per_class_total[idx]} slices)", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    train_fast_sota()
