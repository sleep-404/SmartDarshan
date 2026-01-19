"""API package for video analytics."""

from .routes import router as api_router
from .websocket import websocket_router

__all__ = ["api_router", "websocket_router"]
