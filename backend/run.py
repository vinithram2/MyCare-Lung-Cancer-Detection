"""
PulmoScan AI — Entry Point
Run this script to start the FastAPI development server.

Usage:
    python run.py

The server will start at http://0.0.0.0:8000
Interactive API docs available at http://localhost:8000/docs
Redoc documentation available at http://localhost:8000/redoc
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
