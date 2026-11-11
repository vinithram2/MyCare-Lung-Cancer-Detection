"""
PulmoScan AI — High-Accuracy PyTorch Model Training Pipeline

Trains a transfer learning deep convolutional neural network on the
IQ-OTH/NCCD Lung Cancer CT dataset (Normal, Benign, Malignant).
"""

import os
import sys
import time
import copy
from typing import Tuple

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_model(
    data_dir: str = "backend/data",
    num_epochs: int = 8,
    batch_size: int = 32,
    lr: float = 2e-4,
    save_path: str = "backend/weights/pulmoscan_model.pth"
):
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader
    from torchvision import datasets, models, transforms

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 65)
    print("PulmoScan AI — High-Accuracy Model Training")
    print(f"Device        : {device}")
    print(f"Dataset root  : {data_dir}")
    print(f"Epochs        : {num_epochs}")
    print(f"Batch size    : {batch_size}")
    print(f"Output weights: {save_path}")
    print("=" * 65)

    # 1. Advanced Image Augmentation & Normalization
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.2),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'test': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Datasets & Loaders
    image_datasets = {
        x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
        for x in ['train', 'val', 'test'] if os.path.exists(os.path.join(data_dir, x))
    }

    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=(x == 'train'), num_workers=0)
        for x in image_datasets.keys()
    }

    dataset_sizes = {x: len(image_datasets[x]) for x in image_datasets.keys()}
    class_names = image_datasets['train'].classes
    class_to_idx = image_datasets['train'].class_to_idx
    print(f"\nDetected Classes: {class_names}")
    print(f"Class to Index Mapping: {class_to_idx}")
    print(f"Dataset split sizes: {dataset_sizes}")

    # 3. Model Architecture (ResNet18 transfer learning backbone)
    print("\nLoading pretrained ResNet18 backbone...")
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Fine-tune deeper layers
    for param in list(model.parameters()):
        param.requires_grad = True

    # Custom classification head
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, len(class_names))
    )

    model = model.to(device)

    # Weighted loss to handle class imbalances
    class_counts = [0] * len(class_names)
    for _, label in image_datasets['train'].samples:
        class_counts[label] += 1
    total_samples = sum(class_counts)
    class_weights = [total_samples / (len(class_names) * count) for count in class_counts]
    weights_tensor = torch.FloatTensor(class_weights).to(device)
    print(f"Class sample counts: {class_counts} | Class loss weights: {[round(w, 2) for w in class_weights]}")

    criterion = nn.CrossEntropyLoss(weight=weights_tensor)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)

    # 4. Training Loop
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    for epoch in range(num_epochs):
        print(f"\n--- Epoch {epoch + 1}/{num_epochs} ---")

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data).item()

            if phase == 'train':
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = float(running_corrects) / dataset_sizes[phase]

            print(f"[{phase.upper()}] Loss: {epoch_loss:.4f} | Acc: {epoch_acc * 100:.2f}%")

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())
                print(f"  [BEST] New best validation accuracy: {best_acc * 100:.2f}%! Checkpointing...")

    time_elapsed = time.time() - since
    print("\n" + "=" * 65)
    print(f"Training completed in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Validation Accuracy: {best_acc * 100:.2f}%")

    # 5. Save best weights with explicit class names metadata
    model.load_state_dict(best_model_wts)
    torch.save({
        'state_dict': model.state_dict(),
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_enhanced',
        'accuracy': float(best_acc)
    }, save_path)

    # 6. Evaluate on Test Set
    if 'test' in dataloaders:
        model.eval()
        test_corrects = 0
        per_class_correct = [0] * len(class_names)
        per_class_total = [0] * len(class_names)

        with torch.no_grad():
            for inputs, labels in dataloaders['test']:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                test_corrects += torch.sum(preds == labels.data).item()
                for p, l in zip(preds, labels):
                    if p == l:
                        per_class_correct[l] += 1
                    per_class_total[l] += 1

        test_acc = float(test_corrects) / dataset_sizes['test']
        print(f"Final Test Set Accuracy: {test_acc * 100:.2f}%")
        print("\nPer-Class Test Performance:")
        for idx, cls in enumerate(class_names):
            acc = (per_class_correct[idx] / per_class_total[idx]) * 100 if per_class_total[idx] > 0 else 0
            print(f"  {cls:12s}: {acc:5.1f}% ({per_class_correct[idx]}/{per_class_total[idx]})")

    print(f"\nModel saved successfully to: {save_path}")
    print("=" * 65)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="backend/data")
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--output", type=str, default="backend/weights/pulmoscan_model.pth")
    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        save_path=args.output
    )
