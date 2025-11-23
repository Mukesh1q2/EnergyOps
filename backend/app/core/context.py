"""
OptiBid Energy Platform - Request Context
Context variables for tracking request-specific information across async calls
"""

from contextvars import ContextVar
from typing import Dict, Any, Optional
import uuid


# Context variables
_request_context: ContextVar[Dict[str, Any]] = ContextVar(
    "request_context",
    default={}
)


def set_request_context(**kwargs):
    """
    Set request context variables
    
    Args:
        **kwargs: Context variables to set (request_id, user_id, organization_id, etc.)
    """
    context = _request_context.get().copy()
    context.update(kwargs)
    _request_context.set(context)


def get_request_context() -> Dict[str, Any]:
    """
    Get current request context
    
    Returns:
        Dictionary containing request context variables
    """
    return _request_context.get()


def clear_request_context():
    """Clear request context"""
    _request_context.set({})


def get_request_id() -> str:
    """
    Get current request ID
    
    Returns:
        Request ID or empty string if not set
    """
    return _request_context.get().get("request_id", "")


def generate_request_id() -> str:
    """
    Generate a new request ID
    
    Returns:
        UUID string for request tracking
    """
    return str(uuid.uuid4())


# Export public API
__all__ = [
    "set_request_context",
    "get_request_context",
    "clear_request_context",
    "get_request_id",
    "generate_request_id",
]
