"""
PulmoScan AI — History Router

Endpoints for managing scan history records stored in SQLite.

  GET    /api/history          → list last 50 scans (newest first)
  DELETE /api/history/{id}     → delete a specific scan record
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.database.models import ScanHistory
from app.schemas.prediction import HistoryItem, MessageResponse

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# GET /api/history
# ---------------------------------------------------------------------------
@router.get(
    "/history",
    response_model=list[HistoryItem],
    summary="Get Scan History",
    description="Returns the most recent 50 scan records, ordered newest first.",
    status_code=status.HTTP_200_OK,
)
async def get_history(
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
) -> list[HistoryItem]:
    """
    Retrieve scan history records from the database.

    Parameters
    ----------
    limit : int
        Maximum number of records to return (default 50, max 200).

    Returns
    -------
    list[HistoryItem]
        Ordered from most recent to oldest.
    """
    limit = min(max(1, limit), 200)  # Clamp to [1, 200]

    stmt = (
        select(ScanHistory)
        .order_by(desc(ScanHistory.timestamp))
        .limit(limit)
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    logger.info(f"Returning {len(records)} scan history records.")

    return [
        HistoryItem(
            id=rec.id,
            filename=rec.filename,
            class_name=rec.class_name,
            confidence=rec.confidence,
            risk_level=rec.risk_level,
            heatmap_url=rec.heatmap_url,
            timestamp=rec.timestamp,
        )
        for rec in records
    ]


# ---------------------------------------------------------------------------
# DELETE /api/history/{id}
# ---------------------------------------------------------------------------
@router.delete(
    "/history/{record_id}",
    response_model=MessageResponse,
    summary="Delete a Scan Record",
    description="Permanently deletes a scan record by its ID.",
    status_code=status.HTTP_200_OK,
)
async def delete_history_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Delete a single scan history record.

    Parameters
    ----------
    record_id : int
        The primary-key ID of the record to delete.

    Returns
    -------
    MessageResponse
        Confirmation message on success.

    Raises
    ------
    HTTPException(404)
        If no record with the given ID exists.
    """
    stmt = select(ScanHistory).where(ScanHistory.id == record_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with id={record_id} not found.",
        )

    await db.delete(record)
    await db.commit()

    logger.info(f"Deleted scan record id={record_id}.")

    return MessageResponse(
        message=f"Scan record #{record_id} deleted successfully.",
        success=True,
    )
