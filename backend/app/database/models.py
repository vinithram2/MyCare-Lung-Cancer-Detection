"""
PulmoScan AI — SQLAlchemy ORM Models

Defines the ScanHistory table that stores every prediction result.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class ScanHistory(Base):
    """
    Persists each lung scan prediction result.

    Columns
    -------
    id          : Auto-incrementing primary key.
    filename    : Original filename of the uploaded image.
    class_name  : Predicted class — 'Normal', 'Benign', or 'Malignant'.
    confidence  : Model confidence score (0.0 – 1.0).
    risk_level  : Derived risk level — 'Low', 'Moderate', or 'High'.
    heatmap_url : Relative URL to the generated Grad-CAM PNG (nullable).
    timestamp   : UTC datetime when the record was created.
    """

    __tablename__ = "scan_history"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    filename: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Original uploaded filename"
    )
    class_name: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Predicted class label"
    )
    confidence: Mapped[float] = mapped_column(
        Float, nullable=False, comment="Prediction confidence [0, 1]"
    )
    risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="Derived risk level"
    )
    heatmap_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True, comment="Relative URL to heatmap PNG"
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC creation timestamp",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<ScanHistory id={self.id} class={self.class_name!r} "
            f"confidence={self.confidence:.2f} ts={self.timestamp}>"
        )
