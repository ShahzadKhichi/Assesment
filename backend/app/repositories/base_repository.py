"""
Base repository abstraction.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Any, Type
from django.db.models import Model

T = TypeVar('T', bound=Model)


class BaseRepository(ABC, Generic[T]):
    """Abstract Generic Base Repository for CRUD operations."""

    def __init__(self, model_class: Type[T]) -> None:
        self.model_class = model_class

    def get_by_id(self, entity_id: Any) -> Optional[T]:
        try:
            return self.model_class.objects.get(pk=entity_id)
        except self.model_class.DoesNotExist:
            return None

    def get_all(self) -> List[T]:
        return list(self.model_class.objects.all())

    def create(self, **kwargs: Any) -> T:
        return self.model_class.objects.create(**kwargs)

    def update(self, entity_id: Any, **kwargs: Any) -> Optional[T]:
        entity = self.get_by_id(entity_id)
        if entity is None:
            return None
        for key, value in kwargs.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        entity.save()
        return entity

    def delete(self, entity_id: Any) -> bool:
        entity = self.get_by_id(entity_id)
        if entity is None:
            return False
        entity.delete()
        return True

    @abstractmethod
    def get_with_related(self, entity_id: Any) -> Optional[T]:
        pass
