"""
PulmoScan AI — Async SQLite Database Configuration

Uses SQLAlchemy 2.x async engine backed by aiosqlite.
Provides:
  - engine          : AsyncEngine instance
  - AsyncSessionLocal: async session factory
  - Base            : declarative ORM base class
  - init_db()       : coroutine that creates all tables on startup
"""

import logging
import os

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database URL
# The DB file is created in the project root (next to run.py).
# Override via environment variable DATABASE_URL if desired.
# ---------------------------------------------------------------------------
_DEFAULT_DB_URL = "sqlite+aiosqlite:///./pulmoscan.db"
DATABASE_URL: str = os.getenv("DATABASE_URL", _DEFAULT_DB_URL)

# ---------------------------------------------------------------------------
# Async engine
# ---------------------------------------------------------------------------
engine = create_async_engine(
    DATABASE_URL,
    echo=False,           # Set to True to log all SQL statements (debugging)
    future=True,
    connect_args={"check_same_thread": False},  # Required for SQLite
)

# ---------------------------------------------------------------------------
# Async session factory
# ---------------------------------------------------------------------------
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ---------------------------------------------------------------------------
# Dependency: get DB session (for use with FastAPI Depends())
# ---------------------------------------------------------------------------
async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields an async database session.

    Usage::

        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Database initialisation
# ---------------------------------------------------------------------------
async def init_db() -> None:
    """
    Create all database tables defined by ORM models.
    Called once at application startup via the lifespan event handler.
    """
    # Import models so that Base.metadata is populated before create_all
    from app.database import models  # noqa: F401 — side-effect import

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created / verified OK.")
