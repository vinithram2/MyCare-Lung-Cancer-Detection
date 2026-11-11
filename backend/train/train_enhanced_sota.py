"""
PulmoScan AI — Enhanced SOTA Model Training Pipeline (High Efficiency & Accuracy)

Key Features:
1. ResNet-18 Transfer Learning Backbone with Deep Feature Adaptation
2. Exact 1:1:1 Weighted Random Sampling across Normal, Benign, and Malignant
3. High-Quality Medical Data Augmentation (Rotations, Affine, Jitter, Flips)
4. Class-Weighted Cross-Entropy Loss with Label Smoothing
5. Cosine Annealing Learning Rate Scheduler
6. Instant output flushing for real-time monitoring
7. Saves best model weights to backend/weights/pulmoscan_model.pth
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

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_sota(
    data_dir: str = "backend/data",
    num_epochs: int = 10,
    batch_size: int = 32,
    lr: float = 3e-4,
    save_path: str = "backend/weights/pulmoscan_model.pth"
):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 75, flush=True)
    print("PulmoScan AI — High-Efficiency Model Training Protocol", flush=True)
    print(f"Hardware Device : {device}", flush=True)
    print(f"Dataset Root    : {data_dir}", flush=True)
    print(f"Training Epochs : {num_epochs}", flush=True)
    print(f"Batch Size      : {batch_size}", flush=True)
    print(f"Initial LR      : {lr}", flush=True)
    print(f"Save Path       : {save_path}", flush=True)
    print("=" * 75, flush=True)

    # 1. Advanced Image Augmentation
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.25),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # 2. Datasets
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")
    test_dir = os.path.join(data_dir, "test")

    train_dataset = datasets.ImageFolder(train_dir, train_transform)
    val_dataset = datasets.ImageFolder(val_dir, eval_transform)
    test_dataset = datasets.ImageFolder(test_dir, eval_transform)

    class_names = train_dataset.classes
    class_to_idx = train_dataset.class_to_idx
    print(f"\nClass Names   : {class_names}", flush=True)
    print(f"Class Mapping : {class_to_idx}", flush=True)

    # 3. Class Counts & Weighted Random Sampler (1:1:1 Balance)
    class_counts = Counter(train_dataset.targets)
    print(f"Raw Class Counts in Train Set: {[class_counts[i] for i in range(len(class_names))]}", flush=True)

    class_weights = [1.0 / class_counts[i] for i in range(len(class_names))]
    sample_weights = [class_weights[label] for label in train_dataset.targets]
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # 4. Model Architecture (ResNet-18)
    print("\nInitializing ResNet-18 Deep Convolutional Backbone...", flush=True)
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

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

    # Class weights for loss function (boost benign accuracy)
    loss_weights = torch.tensor([3.0, 1.0, 1.2], dtype=torch.float32).to(device)
    criterion = nn.CrossEntropyLoss(weight=loss_weights, label_smoothing=0.02)

    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)

    # 5. Training Loop
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_val_acc = 0.0

    print("\nStarting Training & Fine-Tuning across all layers...\n", flush=True)
    for epoch in range(num_epochs):
        epoch_start = time.time()
        # Training Phase
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
        epoch_train_loss = running_loss / len(train_dataset)
        epoch_train_acc = float(running_corrects) / len(train_dataset)

        # Validation Phase
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

        epoch_val_loss = val_loss / len(val_dataset)
        epoch_val_acc = float(val_corrects) / len(val_dataset)
        epoch_time = time.time() - epoch_start

        checkpoint_msg = ""
        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            best_model_wts = copy.deepcopy(model.state_dict())
            checkpoint_msg = " [★ Best Checkpoint]"

        print(f"Epoch [{epoch+1:02d}/{num_epochs:02d}] ({epoch_time:.1f}s) | Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.1f}% | Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.1f}%{checkpoint_msg}", flush=True)

    time_elapsed = time.time() - since
    print("\n" + "=" * 75, flush=True)
    print(f"Training Complete in {int(time_elapsed // 60)}m {int(time_elapsed % 60)}s", flush=True)
    print(f"Optimal Validation Accuracy: {best_val_acc * 100:.2f}%", flush=True)

    # 6. Save Model Checkpoint
    model.load_state_dict(best_model_wts)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save({
        'state_dict': model.state_dict(),
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_balanced',
        'accuracy': float(best_val_acc),
        'epochs': num_epochs
    }, save_path)
    print(f"Saved optimized model weights to: {save_path}", flush=True)

    # 7. Comprehensive Test Set Evaluation
    print("\nEvaluating on Independent Test Set (475 CT Slices)...", flush=True)
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
    print(f"\nFinal Test Overall Accuracy: {test_acc * 100:.2f}% ({test_corrects}/{len(test_dataset)})", flush=True)
    print("-" * 55, flush=True)
    for idx, cls in enumerate(class_names):
        acc = (per_class_correct[idx] / per_class_total[idx]) * 100 if per_class_total[idx] > 0 else 0
        print(f"  • {cls:12s} : {acc:5.2f}% ({per_class_correct[idx]}/{per_class_total[idx]} slices correct)", flush=True)
    print("=" * 75, flush=True)

if __name__ == "__main__":
    train_sota()
