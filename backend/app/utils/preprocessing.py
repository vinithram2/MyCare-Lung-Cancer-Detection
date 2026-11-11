"""
PulmoScan AI — Image Preprocessing Utilities

Provides functions to validate and preprocess chest CT scan images
before they are passed to the inference engine.
"""

from __future__ import annotations

import io
import logging
from typing import Optional

import numpy as np
from fastapi import HTTPException, status
from PIL import Image, ImageFilter

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
TARGET_SIZE: tuple[int, int] = (224, 224)
MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES: set[str] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
}

ALLOWED_EXTENSIONS: set[str] = {
    ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"
}


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_image(
    image_bytes: bytes,
    filename: str,
    content_type: Optional[str] = None,
) -> None:
    """
    Validate that the uploaded file is an acceptable medical image.

    Parameters
    ----------
    image_bytes : bytes
        Raw bytes of the uploaded file.
    filename : str
        Original filename (used for extension check).
    content_type : str, optional
        MIME type reported by the multipart upload.

    Raises
    ------
    HTTPException(400)
        If the file is empty, too large, has an invalid type, or cannot
        be opened as an image.
    """
    # 1. Non-empty check
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 2. Size check
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        size_mb = len(image_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed size is 10 MB.",
        )

    # 3. Extension check
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file extension '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # 4. MIME type check (optional — browser may not always send it)
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported content type '{content_type}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
            ),
        )

    # 5. Attempt to open and verify with Pillow
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Raises if file is truncated / corrupted
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not open image file: {exc}",
        )

    logger.debug(f"Image '{filename}' passed validation ({len(image_bytes)} bytes).")
    # -----------------------------------------------------------
    # Additional CT scan validation (grayscale, contrast, corners, lung region)
    # -----------------------------------------------------------
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        arr = np.array(img)
        # 1. Colorfulness (should be near grayscale)
        color_diff = np.mean(np.abs(arr[...,0] - arr[...,1]) + np.abs(arr[...,1] - arr[...,2]) + np.abs(arr[...,2] - arr[...,0]))
        if color_diff > 10.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Image: The uploaded file does not appear to be a grayscale chest CT scan."
            )
        # 2. Overall contrast/std deviation
        std_dev = np.std(arr)
        if std_dev < 20.0 or std_dev > 115.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Image: Unexpected contrast levels for a chest CT scan."
            )
        # 3. Corner darkness (scanner background)
        h, w, _ = arr.shape
        corner_region = arr[:int(h * 0.1), :int(w * 0.1)]
        if corner_region.mean() > 85.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Image: Detected bright borders, not typical of chest CT scans."
            )
        # 4. Lung field low-intensity pixel proportion (rough heuristic)
        low_intensity = np.sum(arr < 55)
        proportion = low_intensity / arr.size
        if proportion < 0.10 or proportion > 0.85:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Image: Pixel intensity distribution does not match a chest CT scan."
            )
    except HTTPException:
        raise  # Re‑raise validation errors unchanged
    except Exception as exc:
        logger.exception("CT‑scan validation failed.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Image: Unable to validate chest CT scan content."
        )
    # -----------------------------------------------------------
    # End of validation
    # -----------------------------------------------------------


# ---------------------------------------------------------------------------
# Preprocessing
# ---------------------------------------------------------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess raw image bytes into a model-ready numpy array.

    Pipeline:
      1. Open image bytes with Pillow.
      2. Convert to RGB (handles grayscale DICOM-like images, RGBA PNGs, etc.).
      3. Resize to 224×224 using high-quality Lanczos resampling.
      4. Apply a mild Gaussian smoothing (radius=0.5) to reduce JPEG artefacts.
      5. Convert to float32 and normalise pixel values to [0, 1].
      6. Add batch dimension → shape (1, 224, 224, 3).

    Parameters
    ----------
    image_bytes : bytes
        Raw image file bytes (already validated).

    Returns
    -------
    np.ndarray
        Array of shape (1, 224, 224, 3) with dtype float32, values in [0, 1].

    Raises
    ------
    HTTPException(422)
        If image processing fails for any reason.
    """
    try:
        # Open and convert to RGB
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Resize with Lanczos (high quality downsampling)
        img = img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)

        # Mild Gaussian smoothing to reduce compression artefacts
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))

        # Convert to float32 numpy array
        arr = np.array(img, dtype=np.float32)

        # Normalise to [0, 1]
        arr /= 255.0

        # Clip to guard against any floating-point overshoot
        arr = np.clip(arr, 0.0, 1.0)

        # Add batch dimension: (224, 224, 3) → (1, 224, 224, 3)
        arr = np.expand_dims(arr, axis=0)

        logger.debug(f"Image preprocessed successfully. Output shape: {arr.shape}")
        return arr

    except Exception as exc:
        logger.exception("Image preprocessing failed.")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image preprocessing error: {exc}",
        )
