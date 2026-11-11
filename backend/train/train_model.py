"""
PulmoScan AI — Model Training Script

Trains an EfficientNetB0 transfer learning model on 3-class thoracic datasets
(e.g., IQ-OTH/NCCD or LIDC-IDRI).

Dataset Directory Structure Expected:
-------------------------------------
data/
├── train/
│   ├── Normal/
│   │   ├── normal_001.png ...
│   ├── Benign/
│   │   ├── benign_001.png ...
│   └── Malignant/
│       ├── malignant_001.png ...
└── val/
    ├── Normal/
    ├── Benign/
    └── Malignant/

Usage:
------
    python train/train_model.py --data_dir ./data --epochs 30 --batch_size 32
"""

import argparse
import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def train(data_dir: str, epochs: int, batch_size: int, learning_rate: float, output_path: str):
    try:
        import tensorflow as tf
        from tensorflow.keras.callbacks import (
            EarlyStopping,
            ModelCheckpoint,
            ReduceLROnPlateau,
            TensorBoard,
        )
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
    except ImportError:
        print(
            "ERROR: TensorFlow is required for training. Please run:\n"
            "  pip install tensorflow>=2.13.0 matplotlib scikit-learn\n"
        )
        sys.exit(1)

    from app.models.cnn_model import build_efficientnet_model

    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    if not os.path.exists(train_dir):
        print(f"ERROR: Training directory '{train_dir}' not found.")
        print("Please organize your dataset into 'train/' and 'val/' subfolders with class names.")
        sys.exit(1)

    print("=" * 60)
    print("PulmoScan AI — CNN Model Training Protocol")
    print(f"Data directory : {data_dir}")
    print(f"Target Epochs  : {epochs}")
    print(f"Batch Size     : {batch_size}")
    print(f"Output Weights : {output_path}")
    print("=" * 60)

    # 1. Data Augmentation & Preprocessing
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode="nearest",
    )

    val_datagen = ImageDataGenerator(rescale=1.0 / 255.0)

    print("\nLoading dataset streams...")
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=True,
    )

    val_generator = val_datagen.flow_from_directory(
        val_dir if os.path.exists(val_dir) else train_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )

    num_classes = len(train_generator.class_indices)
    print(f"Detected classes: {train_generator.class_indices} ({num_classes} total)")

    # 2. Build Model
    model = build_efficientnet_model(
        input_shape=(224, 224, 3),
        num_classes=num_classes,
        learning_rate=learning_rate,
    )
    model.summary()

    # 3. Callbacks
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=8,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
        ModelCheckpoint(
            filepath=output_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
    ]

    # 4. Train
    print("\nInitiating training...")
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=epochs,
        callbacks=callbacks,
    )

    # 5. Save Final Weights
    model.save(output_path)
    print("\n" + "=" * 60)
    print(f"SUCCESS: Model saved to '{output_path}'")
    print("You can now set MOCK_MODEL=false in your environment to use this trained model.")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PulmoScan AI Lung Cancer Model")
    parser.add_argument("--data_dir", type=str, default="./data", help="Path to dataset directory")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--learning_rate", type=float, default=1e-4, help="Adam learning rate")
    parser.add_argument(
        "--output",
        type=str,
        default="./weights/pulmoscan_model.h5",
        help="Path where weights will be saved",
    )

    args = parser.parse_args()
    train(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        output_path=args.output,
    )
