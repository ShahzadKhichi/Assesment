"""
Custom decorators.
"""

import functools
import logging
import time

logger = logging.getLogger(__name__)


def log_execution_time(func):
    """Decorator that logs function execution time."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        logger.info(f"{func.__qualname__} executed in {elapsed:.3f}s")
        return result
    return wrapper
