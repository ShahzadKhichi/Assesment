"""
Base model abstraction.
"""

import uuid
from django.db import models


class BaseModel(models.Model):
    """Abstract base model with UUID primary key and timestamp tracking."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier (UUIDv4)"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when entity was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when entity was last updated"
    )

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id})"
