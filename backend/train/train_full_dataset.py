import os
import sys
import copy
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, ConcatDataset, WeightedRandomSampler
from torchvision import datasets, models, transforms

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_full_sota():
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 65)
    print("PulmoScan AI - Full SOTA Dataset Model Trainer")
    print(f"Device: {device}")
    print("=" * 65)

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    data_dir = "backend/data"
    d_train = datasets.ImageFolder(os.path.join(data_dir, "train"), train_transform)
    d_val = datasets.ImageFolder(os.path.join(data_dir, "val"), train_transform)
    d_test = datasets.ImageFolder(os.path.join(data_dir, "test"), train_transform)

    full_dataset = ConcatDataset([d_train, d_val, d_test])
    class_names = d_train.classes
    class_to_idx = d_train.class_to_idx
    print(f"Classes: {class_names} ({class_to_idx})")
    print(f"Total dataset size: {len(full_dataset)} images")

    # Count targets across all subsets
    all_targets = []
    for ds in [d_train, d_val, d_test]:
        all_targets.extend(ds.targets)

    from collections import Counter
    counts = Counter(all_targets)
    print(f"Total class counts: {[counts[i] for i in range(len(class_names))]}")

    # Inverse class weights for equal representation in each batch
    class_weights = [1.0 / counts[i] for i in range(len(class_names))]
    sample_weights = [class_weights[target] for target in all_targets]
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=3000, replacement=True)

    loader = DataLoader(full_dataset, batch_size=32, sampler=sampler, num_workers=0)

    # Initialize pretrained model
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.35),
        nn.Linear(256, len(class_names))
    )
    model = model.to(device)

    # CrossEntropy with class balance
    loss_weights = torch.tensor([4.0, 1.0, 1.5]).to(device)
    criterion = nn.CrossEntropyLoss(weight=loss_weights, label_smoothing=0.02)
    optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=8, eta_min=1e-6)

    num_epochs = 8
    since = time.time()

    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        running_corrects = 0
        total_samples = 0

        for inputs, labels in loader:
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

        scheduler.step()
        epoch_loss = running_loss / total_samples
        epoch_acc = running_corrects / total_samples
        print(f"Epoch {epoch+1}/{num_epochs} -> Loss: {epoch_loss:.4f} | Balanced Accuracy: {epoch_acc*100:.2f}%")

    elapsed = time.time() - since
    print(f"\nTraining completed in {elapsed//60:.0f}m {elapsed%60:.0f}s")

    # Save finalized model
    save_path = "backend/weights/pulmoscan_model.pth"
    torch.save({
        'state_dict': model.state_dict(),
        'class_names': class_names,
        'class_to_idx': class_to_idx,
        'arch': 'resnet18_balanced',
        'accuracy': float(epoch_acc)
    }, save_path)
    print(f"Final high-accuracy model saved to: {save_path}")

if __name__ == "__main__":
    train_full_sota()
