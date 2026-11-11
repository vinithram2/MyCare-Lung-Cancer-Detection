"""
PulmoScan AI — FastAPI Application Entry Point

Initializes the FastAPI application with:
- CORS middleware (all origins allowed for development)
- Static file serving for heatmap images
- Router registration (predict, history)
- Database initialization on startup
- Health check endpoint
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import init_db
from app.routes import predict, history, chat, news

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Directory constants
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
HEATMAPS_DIR = os.path.join(STATIC_DIR, "heatmaps")
os.makedirs(HEATMAPS_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Lifespan: startup / shutdown logic
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown event handler."""
    # --- Startup ---
    logger.info("PulmoScan AI starting up…")

    # Ensure static directories exist
    os.makedirs(HEATMAPS_DIR, exist_ok=True)
    logger.info(f"Static heatmaps directory ready: {HEATMAPS_DIR}")

    # Initialise SQLite database tables
    await init_db()
    logger.info("Database initialised successfully.")

    yield  # Application runs here

    # --- Shutdown ---
    logger.info("PulmoScan AI shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MyCare AI",
    description=(
        "MyCare Lung Health & Cancer Detection System — powered by deep learning. "
        "Upload a chest CT scan image to receive a classification result "
        "(Normal / Benign / Malignant) with Grad-CAM heatmap visualization "
        "and personalised clinical recommendations."
    ),
    version="1.0.0",
    contact={
        "name": "MyCare Medical AI Team",
        "url": "https://github.com/your-org/mycare-ai",
    },
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware — allow all origins (adjust in production!)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files — serve heatmap PNGs at /static/heatmaps/<filename>
# ---------------------------------------------------------------------------
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(news.router, prefix="/api", tags=["News"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", summary="Root Health Check", tags=["Health"])
@app.get("/health", summary="Health Check", tags=["Health"])
async def health_check():
    """Returns the API status and version."""
    return {"status": "ok", "version": "1.0.0", "service": "MyCare AI"}
