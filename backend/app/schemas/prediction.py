"""
PulmoScan AI — Pydantic Schemas (Request / Response Models)

Defines the data shapes used by the prediction and history API endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Nested schema: Treatment category card
# ---------------------------------------------------------------------------
class TreatmentCategory(BaseModel):
    """Represents one treatment modality card shown in the results UI."""

    name: str = Field(..., description="Name of the treatment category")
    description: str = Field(..., description="Plain-language description of the treatment")
    icon: str = Field(..., description="Lucide/Tabler icon name for the UI")


# ---------------------------------------------------------------------------
# Nested schema: Recommendations block
# ---------------------------------------------------------------------------
class Recommendations(BaseModel):
    """Clinical recommendations returned alongside every prediction."""

    next_steps: List[str] = Field(
        default_factory=list,
        description="Ordered list of immediate action items for the patient",
    )
    treatment_categories: List[TreatmentCategory] = Field(
        default_factory=list,
        description="List of applicable treatment modality cards",
    )
    lifestyle_tips: List[str] = Field(
        default_factory=list,
        description="Evidence-based lifestyle and wellness suggestions",
    )
    disclaimer: str = Field(
        ...,
        description="Medical/legal disclaimer that must always be displayed",
    )


# ---------------------------------------------------------------------------
# Primary prediction response schema
# ---------------------------------------------------------------------------
class PredictionResponse(BaseModel):
    """Full response payload returned by POST /api/predict."""

    id: Optional[int] = Field(None, description="Database record ID of this scan")
    filename: str = Field(..., description="Original uploaded filename")
    class_name: str = Field(
        ...,
        description="Predicted class label: Normal | Benign | Malignant",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence score in the range [0, 1]",
    )
    risk_level: str = Field(
        ...,
        description="Derived risk level: Low | Moderate | High",
    )
    heatmap_url: Optional[str] = Field(
        None,
        description="Relative URL to the Grad-CAM heatmap PNG, e.g. /static/heatmaps/uuid.png",
    )
    recommendations: Recommendations = Field(
        ...,
        description="Structured clinical recommendations for this prediction",
    )
    timestamp: Optional[datetime] = Field(
        None,
        description="UTC timestamp when the scan was processed",
    )

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# History list item schema
# ---------------------------------------------------------------------------
class HistoryItem(BaseModel):
    """Lightweight schema used for the scan history list endpoint."""

    id: int = Field(..., description="Unique database record ID")
    filename: str = Field(..., description="Original uploaded filename")
    class_name: str = Field(..., description="Predicted class label")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    risk_level: str = Field(..., description="Risk level: Low | Moderate | High")
    heatmap_url: Optional[str] = Field(None, description="URL to heatmap image")
    timestamp: datetime = Field(..., description="UTC timestamp of the scan")

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Generic message response (used for delete confirmations, etc.)
# ---------------------------------------------------------------------------
class MessageResponse(BaseModel):
    """Simple message envelope for non-data responses."""

    message: str = Field(..., description="Human-readable status message")
    success: bool = Field(True, description="Whether the operation succeeded")
