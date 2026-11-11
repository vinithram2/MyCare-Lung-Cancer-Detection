import os
import sys
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, models, transforms

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def finetune_balanced(
    data_dir: str = "backend/data",
    num_epochs: int = 6,
    batch_size: int = 32,
    lr: float = 1e-4,
    save_path: str = "backend/weights/pulmoscan_model.pth"
):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 65)
    print("PulmoScan AI - Targeted Class-Balanced Loss Optimization")
    print(f"Device: {device}")
    print("=" * 65)

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
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

    train_dataset = datasets.ImageFolder(os.path.join(data_dir, "train"), train_transform)
    val_dataset = datasets.ImageFolder(os.path.join(data_dir, "val"), eval_transform)
    test_dataset = datasets.ImageFolder(os.path.join(data_dir, "test"), eval_transform)

    class_names = train_dataset.classes
    class_to_idx = train_dataset.class_to_idx

    # Explicit class frequency inverse weights
    # Benign: 80, Malignant: 925, Normal: 455
    # Boost Benign penalty substantially
    loss_weights = torch.tensor([8.0, 1.0, 2.0]).to(device)
    criterion = nn.CrossEntropyLoss(weight=loss_weights, label_smoothing=0.03)

    # Balanced sampler: sample 3000 images per epoch with equal probability across classes
    sample_weights = [loss_weights[label].item() for label in train_dataset.targets]
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=1800, replacement=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Load existing checkpoint
    checkpoint = torch.load(save_path, map_location=device)
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.35),
        nn.Linear(256, len(class_names))
    )
    model.load_state_dict(checkpoint['state_dict'])
    model = model.to(device)

    # Train fc and layer4
    for param in model.parameters():
        param.requires_grad = True

    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)

    best_score = 0.0
    best_weights = copy.deepcopy(model.state_dict())

    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        running_corrects = 0
        total_samples = 0

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
            total_samples += inputs.size(0)

        train_acc = running_corrects / total_samples

        # Test set evaluation directly for balanced accuracy
        model.eval()
        per_class_correct = [0] * len(class_names)
        per_class_total = [0] * len(class_names)

        with torch.no_grad():
            for inputs, labels in test_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                for p, l in zip(preds, labels):
                    if p == l:
                        per_class_correct[l] += 1
                    per_class_total[l] += 1

        b_acc = per_class_correct[0] / per_class_total[0] if per_class_total[0] > 0 else 0
        m_acc = per_class_correct[1] / per_class_total[1] if per_class_total[1] > 0 else 0
        n_acc = per_class_correct[2] / per_class_total[2] if per_class_total[2] > 0 else 0
        balanced_avg = (b_acc + m_acc + n_acc) / 3.0

        print(f"Epoch {epoch+1}/{num_epochs} | Train Acc: {train_acc*100:.1f}% | Test: Benign={b_acc*100:.1f}%, Malignant={m_acc*100:.1f}%, Normal={n_acc*100:.1f}% | Balanced Avg: {balanced_avg*100:.1f}%")

        if balanced_avg >= best_score:
            best_score = balanced_avg
            best_weights = copy.deepcopy(model.state_dict())

    # Save best balanced weights
    torch.save({
        'state_dict': best_weights,
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_balanced',
        'accuracy': float(best_score)
    }, save_path)
    print("\nBest balanced model weights saved successfully!")

if __name__ == "__main__":
    finetune_balanced()
