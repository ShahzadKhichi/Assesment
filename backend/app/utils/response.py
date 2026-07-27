"""
Standardized API response builder.
"""

from typing import Any, Dict, Optional


def success_response(data: Any = None, message: str = None) -> Dict[str, Any]:
    """Build a standardized success response."""
    result = {'success': True, 'data': data, 'error': None, 'errors': {}}
    if message:
        result['message'] = message
    return result


def error_response(error: str, errors: Optional[Dict] = None) -> Dict[str, Any]:
    """Build a standardized error response."""
    return {'success': False, 'data': None, 'error': error, 'errors': errors or {}}
