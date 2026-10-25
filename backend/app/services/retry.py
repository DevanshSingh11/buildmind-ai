import time
import random
import logging
from typing import Callable, Any, Optional

logger = logging.getLogger("construction_ai.retry")

def retry_with_backoff(
    retries: int = 3,
    backoff_in_seconds: int = 1,
    retryable_exceptions: tuple = (Exception,),
) -> Callable:
    """Decorator to retry with exponential backoff and jitter."""
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs) -> Any:
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    # Check if the exception is retryable (5xx, 429)
                    is_retryable = False
                    status_code = getattr(e, "code", None)
                    if hasattr(e, "response"):
                        status_code = getattr(e.response, "status_code", status_code)

                    if status_code in [429, 500, 502, 503, 504]:
                        is_retryable = True

                    if not is_retryable or x == retries:
                        raise e

                    sleep = (backoff_in_seconds * 2 ** x + random.uniform(0, 1))
                    logger.warning(f"Retry {x+1}/{retries} after {sleep:.2f}s due to error: {e}")
                    time.sleep(sleep)
                    x += 1
        return wrapper
    return decorator
