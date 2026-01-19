"""FastAPI entry point for video analytics backend."""

import sys
from pathlib import Path

# Add the analytics directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.routes import router as api_router
from api.websocket import websocket_router


# Create FastAPI app
app = FastAPI(
    title="Smart Darshan Video Analytics API",
    description="Real-time crowd analytics using YOLOv8, ByteTrack, and Optical Flow",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Smart Darshan Video Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "/api/analytics/status"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
