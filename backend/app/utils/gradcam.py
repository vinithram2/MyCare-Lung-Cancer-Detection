"""
PulmoScan AI — Grad-CAM Heatmap Generation

Generates a mock Grad-CAM overlay heatmap to visually explain the model's
attention regions on the input image. When a real TensorFlow/Keras model is
loaded, this module can be extended to compute true gradient-weighted class
activation maps.

The mock implementation:
  1. Opens the original image and resizes to 224×224.
  2. Creates a synthetic Gaussian attention blob at a class-weighted position.
  3. Applies the jet colormap to produce a coloured heatmap.
  4. Blends the heatmap over the original image at 40% opacity.
  5. Saves the result as a PNG in backend/static/heatmaps/ and returns the URL.
"""

from __future__ import annotations

import io
import logging
import os
import uuid
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Directory constants
# ---------------------------------------------------------------------------
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(os.path.dirname(_THIS_DIR))
HEATMAPS_DIR = os.path.join(_BACKEND_DIR, "static", "heatmaps")


# ---------------------------------------------------------------------------
# Jet colourmap helper
# ---------------------------------------------------------------------------
def _apply_jet_colormap(gray: np.ndarray) -> np.ndarray:
    """
    Convert a normalised [0, 1] float32 grayscale map to an RGB jet colourmap.

    Parameters
    ----------
    gray : np.ndarray
        2-D array of shape (H, W) with values in [0, 1].

    Returns
    -------
    np.ndarray
        uint8 array of shape (H, W, 3) with RGB jet colours.
    """
    # Clamp to [0, 1]
    gray = np.clip(gray, 0.0, 1.0)

    r = np.clip(1.5 - np.abs(gray * 4.0 - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(gray * 4.0 - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(gray * 4.0 - 1.0), 0.0, 1.0)

    jet_rgb = np.stack([r, g, b], axis=-1)
    return (jet_rgb * 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Gaussian blob generator
# ---------------------------------------------------------------------------
def _gaussian_blob(
    height: int,
    width: int,
    center_y: float,
    center_x: float,
    sigma_y: float = 40.0,
    sigma_x: float = 40.0,
) -> np.ndarray:
    """
    Generate a 2-D Gaussian attention map.

    Parameters
    ----------
    height, width : int
        Spatial dimensions of the output map.
    center_y, center_x : float
        Centre of the Gaussian in pixel coordinates.
    sigma_y, sigma_x : float
        Standard deviations controlling blob size.

    Returns
    -------
    np.ndarray
        float32 array of shape (height, width) normalised to [0, 1].
    """
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    blob = np.exp(
        -(((yy - center_y) ** 2) / (2 * sigma_y ** 2))
        - (((xx - center_x) ** 2) / (2 * sigma_x ** 2))
    )
    # Normalise to [0, 1]
    blob_min, blob_max = blob.min(), blob.max()
    if blob_max - blob_min > 1e-8:
        blob = (blob - blob_min) / (blob_max - blob_min)
    return blob.astype(np.float32)


# ---------------------------------------------------------------------------
# Primary public function
# ---------------------------------------------------------------------------
def generate_mock_heatmap(
    image_bytes: bytes,
    class_idx: int = 0,
    class_name: Optional[str] = None,
    alpha: float = 0.4,
) -> str:
    """
    Create a synthetic Grad-CAM heatmap overlay and save it to disk.
    """
    os.makedirs(HEATMAPS_DIR, exist_ok=True)

    # 1. Open original image and resize to 224x224
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    img_arr = np.array(img, dtype=np.float32) / 255.0

    # Map name or index
    c_name = class_name
    if not c_name:
        idx_to_name = {0: "Benign", 1: "Malignant", 2: "Normal"}
        c_name = idx_to_name.get(class_idx, "Normal")

    rng = np.random.default_rng(seed=hash(c_name) % 100000)

    if c_name == "Normal":
        center_y, center_x = 112.0, 112.0
        sigma = 30.0
        intensity_scale = 0.4
    elif c_name == "Benign":
        center_y, center_x = 135.0, 95.0
        sigma = 38.0
        intensity_scale = 0.75
    else: # Malignant
        center_y, center_x = 85.0, 115.0
        sigma = 50.0
        intensity_scale = 0.95

    # Add subtle jitter
    center_y = float(np.clip(center_y + rng.integers(-10, 10), 30, 194))
    center_x = float(np.clip(center_x + rng.integers(-10, 10), 30, 194))

    # 3. Generate Gaussian blobs
    blob_main = _gaussian_blob(224, 224, center_y, center_x, sigma, sigma)
    blob_sec = _gaussian_blob(224, 224, center_y + 15, center_x - 15, sigma * 0.5, sigma * 0.5)
    attention_map = np.clip((blob_main * 0.8 + blob_sec * 0.2) * intensity_scale, 0.0, 1.0)

    # ------------------------------------------------------------------
    # 4. Apply jet colourmap
    # ------------------------------------------------------------------
    heatmap_rgb = _apply_jet_colormap(attention_map)           # (224, 224, 3) uint8
    heatmap_norm = heatmap_rgb.astype(np.float32) / 255.0     # (224, 224, 3) float32

    # ------------------------------------------------------------------
    # 5. Overlay: blend heatmap onto original image
    # ------------------------------------------------------------------
    overlay = img_arr * (1.0 - alpha) + heatmap_norm * alpha
    overlay = np.clip(overlay, 0.0, 1.0)
    overlay_uint8 = (overlay * 255).astype(np.uint8)

    # ------------------------------------------------------------------
    # 6. Convert to PIL and save as PNG
    # ------------------------------------------------------------------
    result_img = Image.fromarray(overlay_uint8, mode="RGB")
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(HEATMAPS_DIR, filename)
    result_img.save(filepath, format="PNG", optimize=True)

    logger.info(f"Heatmap saved: {filepath}")

    # Return the URL that the frontend can fetch
    return f"/static/heatmaps/{filename}"
