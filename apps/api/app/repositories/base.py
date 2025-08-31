"""
Base repository class with common database operations.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from pydantic import BaseModel
from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base repository with common CRUD operations.

    Example usage:
        class APIRepository(BaseRepository[API, APICreateRequest, APIUpdateRequest]):
            pass

        # In your service:
        api_repo = APIRepository(API, db_session)
        apis = await api_repo.get_all()
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: Any) -> Optional[ModelType]:
        """
        Get a single record by ID.

        Example:
            api = await api_repo.get("123e4567-e89b-12d3-a456-426614174000")
        """
        result = await self.db.execute(select(self.model).where(getattr(self.model, "id") == id))
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """
        Get multiple records with pagination and filtering.

        Example:
            apis = await api_repo.get_all(
                skip=0,
                limit=20,
                filters={"category": "testing", "is_active": True}
            )
        """
        query = select(self.model)

        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        """
        Create a new record.

        Example:
            api_data = APICreateRequest(
                name="New API",
                description="Description",
                base_url="https://api.example.com",
                category="data"
            )
            new_api = await api_repo.create(api_data)
        """
        if hasattr(obj_in, "model_dump"):
            obj_data = obj_in.model_dump()
        elif hasattr(obj_in, "dict"):
            obj_data = obj_in.dict()
        else:
            obj_data = dict(obj_in) if obj_in else {}

        if not isinstance(obj_data, dict):
            raise ValueError("Unable to convert input to dictionary")

        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, id: Any, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> Optional[ModelType]:
        """
        Update an existing record.

        Example:
            update_data = APIUpdateRequest(name="Updated API Name")
            updated_api = await api_repo.update(api_id, update_data)
        """
        if isinstance(obj_in, dict):
            obj_data = obj_in
        elif hasattr(obj_in, "model_dump"):
            obj_data = obj_in.model_dump(exclude_unset=True)
        elif hasattr(obj_in, "dict"):
            obj_data = obj_in.dict(exclude_unset=True)
        else:
            obj_data = dict(obj_in)

        await self.db.execute(update(self.model).where(getattr(self.model, "id") == id).values(**obj_data))

        return await self.get(id)

    async def delete(self, id: Any) -> bool:
        """
        Delete a record by ID.

        Example:
            deleted = await api_repo.delete(api_id)
            # Returns: True if deleted, False if not found
        """
        result = await self.db.execute(delete(self.model).where(getattr(self.model, "id") == id))
        return result.rowcount > 0

    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.

        Example:
            total_apis = await api_repo.count({"is_active": True})
        """
        from sqlalchemy import func

        query = select(func.count(getattr(self.model, "id")))

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)

        result = await self.db.execute(query)
        return result.scalar() or 0

    async def exists(self, id: Any) -> bool:
        """
        Check if a record exists.

        Example:
            exists = await api_repo.exists(api_id)
        """
        result = await self.db.execute(select(getattr(self.model, "id")).where(getattr(self.model, "id") == id))
        return result.scalar_one_or_none() is not None
