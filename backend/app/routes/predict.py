"""
PulmoScan AI — Prediction Router

POST /api/predict
  Accepts a multipart image upload, runs it through the preprocessing
  pipeline and inference engine, generates a Grad-CAM heatmap, persists
  the result to SQLite, and returns a full PredictionResponse JSON.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.database.models import ScanHistory
from app.models.inference import get_recommendations, predict
from app.schemas.prediction import PredictionResponse, Recommendations, TreatmentCategory
from app.utils.gradcam import generate_mock_heatmap
from app.utils.preprocessing import preprocess_image, validate_image

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/predict
# ---------------------------------------------------------------------------
@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Analyse a Chest CT Scan",
    description=(
        "Upload a chest CT scan image (JPEG, PNG, BMP, TIFF, or WebP, max 10 MB). "
        "Returns a classification result (Normal / Benign / Malignant), confidence "
        "score, risk level, Grad-CAM heatmap URL, and personalised clinical "
        "recommendations."
    ),
    status_code=status.HTTP_200_OK,
)
async def predict_scan(
    file: UploadFile = File(..., description="Chest CT scan image file"),
    db: AsyncSession = Depends(get_db),
) -> PredictionResponse:
    """
    Full prediction pipeline:

    1. Read and validate the uploaded file.
    2. Preprocess the image to a (1, 224, 224, 3) numpy array.
    3. Run inference (mock or real model).
    4. Generate a Grad-CAM heatmap overlay.
    5. Retrieve class-specific clinical recommendations.
    6. Persist the result to the database.
    7. Return a PredictionResponse.
    """
    # ------------------------------------------------------------------
    # 1. Read upload
    # ------------------------------------------------------------------
    try:
        image_bytes: bytes = await file.read()
    except Exception as exc:
        logger.exception("Failed to read uploaded file.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded file: {exc}",
        )

    filename: str = file.filename or "unknown.jpg"
    content_type: str | None = file.content_type

    logger.info(
        f"Prediction request received — filename='{filename}', "
        f"content_type='{content_type}', size={len(image_bytes)} bytes"
    )

    # ------------------------------------------------------------------
    # 2. Validate
    # ------------------------------------------------------------------
    validate_image(image_bytes, filename, content_type)

    # ------------------------------------------------------------------
    # 3. Preprocess
    # ------------------------------------------------------------------
    image_array = preprocess_image(image_bytes)

    # ------------------------------------------------------------------
    # 4. Inference
    # ------------------------------------------------------------------
    try:
        result = predict(image_array=image_array, image_bytes=image_bytes)
    except Exception as exc:
        logger.exception("Inference failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference error: {exc}",
        )

    class_name: str = result["class_name"]
    confidence: float = result["confidence"]
    class_idx: int = result["class_idx"]
    risk_level: str = result["risk_level"]

    logger.info(
        f"Inference result — class='{class_name}', confidence={confidence:.4f}, "
        f"risk='{risk_level}'"
    )

    # ------------------------------------------------------------------
    # 5. Grad-CAM heatmap
    # ------------------------------------------------------------------
    heatmap_url: str | None = None
    try:
        heatmap_url = generate_mock_heatmap(image_bytes, class_idx=class_idx, class_name=class_name)
        logger.info(f"Heatmap generated: {heatmap_url}")
    except Exception as exc:
        # Non-fatal: proceed without heatmap rather than failing the request
        logger.warning(f"Heatmap generation failed (non-fatal): {exc}")

    # ------------------------------------------------------------------
    # 6. Recommendations
    # ------------------------------------------------------------------
    raw_recs = get_recommendations(class_name)

    treatment_categories = [
        TreatmentCategory(**cat) for cat in raw_recs.get("treatment_categories", [])
    ]

    recommendations = Recommendations(
        next_steps=raw_recs.get("next_steps", []),
        treatment_categories=treatment_categories,
        lifestyle_tips=raw_recs.get("lifestyle_tips", []),
        disclaimer=raw_recs["disclaimer"],
    )

    # ------------------------------------------------------------------
    # 7. Persist to database
    # ------------------------------------------------------------------
    scan_record = ScanHistory(
        filename=filename,
        class_name=class_name,
        confidence=confidence,
        risk_level=risk_level,
        heatmap_url=heatmap_url,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(scan_record)
    await db.flush()   # Populate scan_record.id before commit
    await db.commit()
    await db.refresh(scan_record)

    logger.info(f"Scan result saved to DB with id={scan_record.id}")

    # ------------------------------------------------------------------
    # 8. Return response
    # ------------------------------------------------------------------
    return PredictionResponse(
        id=scan_record.id,
        filename=filename,
        class_name=class_name,
        confidence=confidence,
        risk_level=risk_level,
        heatmap_url=heatmap_url,
        recommendations=recommendations,
        timestamp=scan_record.timestamp,
    )
