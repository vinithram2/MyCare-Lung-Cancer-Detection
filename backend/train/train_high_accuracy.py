"""
PulmoScan AI — SOTA Balanced High-Accuracy Training Pipeline

Tackles class imbalance with exact 1:1:1 sampling across Normal, Benign, and Malignant.
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

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_sota_model(
    data_dir: str = "backend/data",
    num_epochs: int = 12,
    batch_size: int = 32,
    lr: float = 3e-4,
    save_path: str = "backend/weights/pulmoscan_model.pth"
):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 70)
    print("PulmoScan AI — Balanced SOTA Training Protocol")
    print(f"Device        : {device}")
    print(f"Dataset root  : {data_dir}")
    print(f"Epochs        : {num_epochs}")
    print(f"Batch size    : {batch_size}")
    print(f"Output weights: {save_path}")
    print("=" * 70)

    # 1. Advanced Image Augmentations
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.25, contrast=0.25),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
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
    print(f"\nTarget Classes: {class_names}")
    print(f"Class to Index Mapping: {class_to_idx}")

    # 2. Balanced Sampling (Equal representation in every batch)
    class_counts = Counter(train_dataset.targets)
    print(f"Raw Class Sample Counts: {[class_counts[i] for i in range(len(class_names))]}")

    class_weights = [1.0 / class_counts[i] for i in range(len(class_names))]
    sample_weights = [class_weights[label] for label in train_dataset.targets]
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # 3. Model Architecture
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Train all layers for deep feature adaptation
    for param in model.parameters():
        param.requires_grad = True

    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.35),
        nn.Linear(256, len(class_names))
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)

    # 4. Training Loop
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_val_acc = 0.0

    for epoch in range(num_epochs):
        print(f"\n--- Epoch {epoch + 1}/{num_epochs} ---")

        # Train
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
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
        print(f"[TRAIN] Loss: {train_loss:.4f} | Acc: {train_acc * 100:.2f}%")

        # Val
        model.eval()
        val_loss = 0.0
        val_corrects = 0

        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data).item()

        val_loss_epoch = val_loss / len(val_dataset)
        val_acc_epoch = float(val_corrects) / len(val_dataset)
        print(f"[VAL]   Loss: {val_loss_epoch:.4f} | Acc: {val_acc_epoch * 100:.2f}%")

        if val_acc_epoch >= best_val_acc:
            best_val_acc = val_acc_epoch
            best_model_wts = copy.deepcopy(model.state_dict())
            print(f"  [CHECKPOINT] Best validation accuracy: {best_val_acc * 100:.2f}%")

    time_elapsed = time.time() - since
    print("\n" + "=" * 70)
    print(f"Training finished in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Optimal Validation Accuracy: {best_val_acc * 100:.2f}%")

    # 5. Save best weights
    model.load_state_dict(best_model_wts)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save({
        'state_dict': model.state_dict(),
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_balanced',
        'accuracy': float(best_val_acc)
    }, save_path)

    # 6. Evaluate on Test Set
    model.eval()
    test_corrects = 0
    per_class_correct = [0] * len(class_names)
    per_class_total = [0] * len(class_names)

    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            test_corrects += torch.sum(preds == labels.data).item()
            for p, l in zip(preds, labels):
                if p == l:
                    per_class_correct[l] += 1
                per_class_total[l] += 1

    test_acc = float(test_corrects) / len(test_dataset)
    print(f"\nFinal Test Set Overall Accuracy : {test_acc * 100:.2f}%")
    print("Per-Class Accuracy Breakdown:")
    for idx, cls in enumerate(class_names):
        acc = (per_class_correct[idx] / per_class_total[idx]) * 100 if per_class_total[idx] > 0 else 0
        print(f"  - {cls:12s}: {acc:5.1f}% ({per_class_correct[idx]}/{per_class_total[idx]} correct)")

    print(f"\nModel saved successfully to: {save_path}")
    print("=" * 70)


if __name__ == "__main__":
    train_sota_model()
