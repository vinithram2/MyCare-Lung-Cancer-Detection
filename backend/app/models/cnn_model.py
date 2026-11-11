"""
PulmoScan AI — CNN Model Architecture Definition

Defines the transfer learning and custom CNN architectures for lung cancer
classification into Normal, Benign, and Malignant categories.
"""

from __future__ import annotations

import logging
from typing import Tuple

logger = logging.getLogger(__name__)


def build_efficientnet_model(
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    num_classes: int = 3,
    dropout_rate: float = 0.4,
    learning_rate: float = 1e-4,
    fine_tune_at: int = 100,
):
    """
    Build and compile an EfficientNetB0 transfer learning model for thoracic image classification.

    Parameters
    ----------
    input_shape : Tuple[int, int, int]
        Input image dimensions (height, width, channels), default (224, 224, 3).
    num_classes : int
        Number of output diagnostic classes (default 3: Normal, Benign, Malignant).
    dropout_rate : float
        Dropout probability before final dense layer to prevent overfitting.
    learning_rate : float
        Adam optimizer learning rate.
    fine_tune_at : int
        Layer index after which base layers are unfreezed for fine-tuning.

    Returns
    -------
    tf.keras.Model
        Compiled Keras classification model.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models, optimizers
        from tensorflow.keras.applications import EfficientNetB0
    except ImportError as e:
        logger.error(
            "TensorFlow is required to build the model. Please install via: pip install tensorflow"
        )
        raise RuntimeError("TensorFlow is not installed in the environment.") from e

    # Base pretrained model (ImageNet weights)
    base_model = EfficientNetB0(
        weights="imagenet",
        include_top=False,
        input_shape=input_shape,
    )

    # Freeze initial layers
    base_model.trainable = True
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False

    # Classification Head
    inputs = layers.Input(shape=input_shape, name="input_image")
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="head_batchnorm")(x)
    x = layers.Dense(256, activation="relu", name="dense_256")(x)
    x = layers.Dropout(dropout_rate, name="head_dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="output_probabilities")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="PulmoScan_EfficientNetB0")

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
            tf.keras.metrics.AUC(name="auc"),
        ],
    )

    logger.info(f"PulmoScan model initialized with {model.count_params():,} total parameters.")
    return model


def build_custom_lightweight_cnn(
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    num_classes: int = 3,
    learning_rate: float = 1e-3,
):
    """
    Build a lightweight convolutional neural network for rapid training or edge environments.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models, optimizers
    except ImportError as e:
        raise RuntimeError("TensorFlow is not installed.") from e

    model = models.Sequential(
        [
            layers.Input(shape=input_shape),
            # Block 1
            layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            # Block 2
            layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            # Block 3
            layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            # Head
            layers.GlobalAveragePooling2D(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation="softmax"),
        ],
        name="PulmoScan_Lightweight_CNN",
    )

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model
