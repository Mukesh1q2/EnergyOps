"""
OptiBid Energy Platform - Base CRUD Operations
Base CRUD class with common database operations
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models import BaseModel

# Type variables
ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base CRUD class with common operations"""
    
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model
    
    async def get(self, db: AsyncSession, id: Union[str, UUID]) -> Optional[ModelType]:
        """Get a single record by ID"""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        desc_order: bool = False
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering"""
        query = select(self.model)
        
        # Apply filters
        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        conditions.append(getattr(self.model, key).in_(value))
                    else:
                        conditions.append(getattr(self.model, key) == value)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Apply ordering
        if order_by and hasattr(self.model, order_by):
            if desc_order:
                query = query.order_by(desc(getattr(self.model, order_by)))
            else:
                query = query.order_by(asc(getattr(self.model, order_by)))
        else:
            query = query.order_by(desc(self.model.created_at))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(self, db: AsyncSession, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filtering"""
        query = select(func.count(self.model.id))
        
        # Apply filters
        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        conditions.append(getattr(self.model, key).in_(value))
                    else:
                        conditions.append(getattr(self.model, key) == value)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        result = await db.execute(query)
        return result.scalar()
    
    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType, user_id: Optional[str] = None) -> ModelType:
        """Create a new record"""
        obj_in_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in.__dict__
        
        # Set audit fields if user_id provided
        if user_id:
            obj_in_data['created_by'] = user_id
        
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(
        self, 
        db: AsyncSession, 
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> ModelType:
        """Update a record"""
        obj_data = db_obj.__dict__ if hasattr(db_obj, '__dict__') else db_obj
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        # Update fields
        for field in update_data:
            if field in obj_data and hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        
        # Set audit fields if user_id provided
        if user_id:
            setattr(db_obj, 'updated_by', user_id)
        
        db_obj.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: Union[str, UUID]) -> Optional[ModelType]:
        """Delete a record (soft delete if model has deleted_at)"""
        db_obj = await self.get(db, id=id)
        if not db_obj:
            return None
        
        # Check if soft delete is supported
        if hasattr(db_obj, 'deleted_at'):
            db_obj.deleted_at = datetime.utcnow()
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        else:
            await db.delete(db_obj)
            await db.commit()
            return db_obj
    
    async def hard_delete(self, db: AsyncSession, *, id: Union[str, UUID]) -> Optional[ModelType]:
        """Hard delete a record"""
        db_obj = await self.get(db, id=id)
        if not db_obj:
            return None
        
        await db.delete(db_obj)
        await db.commit()
        return db_obj
    
    async def delete_where(self, db: AsyncSession, condition) -> int:
        """Delete records matching condition"""
        query = delete(self.model).where(condition)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount
    
    async def restore(self, db: AsyncSession, *, id: Union[str, UUID]) -> Optional[ModelType]:
        """Restore a soft-deleted record"""
        if not hasattr(self.model, 'deleted_at'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model does not support soft delete"
            )
        
        db_obj = await self.get(db, id=id)
        if not db_obj:
            return None
        
        db_obj.deleted_at = None
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get_multi_with_relationships(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        relationships: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get multiple records with relationship loading"""
        query = select(self.model)
        
        # Load relationships if specified
        if relationships:
            for relationship in relationships:
                query = query.options(selectinload(getattr(self.model, relationship)))
        
        # Apply filters
        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        conditions.append(getattr(self.model, key).in_(value))
                    else:
                        conditions.append(getattr(self.model, key) == value)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(desc(self.model.created_at))
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def search(
        self,
        db: AsyncSession,
        *,
        search_term: str,
        search_fields: List[str],
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Search records by text in specified fields"""
        if not search_fields:
            return await self.get_multi(db, skip=skip, limit=limit)
        
        conditions = []
        for field in search_fields:
            if hasattr(self.model, field):
                conditions.append(getattr(self.model, field).ilike(f"%{search_term}%"))
        
        if not conditions:
            return await self.get_multi(db, skip=skip, limit=limit)
        
        query = select(self.model).where(or_(*conditions)).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def exists(self, db: AsyncSession, id: Union[str, UUID]) -> bool:
        """Check if record exists"""
        result = await db.execute(select(func.count(self.model.id)).where(self.model.id == id))
        return result.scalar() > 0
    
    async def bulk_create(
        self,
        db: AsyncSession,
        *,
        obj_in_list: List[CreateSchemaType],
        user_id: Optional[str] = None
    ) -> List[ModelType]:
        """Create multiple records in bulk"""
        db_obj_list = []
        
        for obj_in in obj_in_list:
            obj_in_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in.__dict__
            
            # Set audit fields if user_id provided
            if user_id:
                obj_in_data['created_by'] = user_id
            
            db_obj = self.model(**obj_in_data)
            db_obj_list.append(db_obj)
        
        db.add_all(db_obj_list)
        await db.commit()
        
        for db_obj in db_obj_list:
            await db.refresh(db_obj)
        
        return db_obj_list
    
    async def bulk_update(
        self,
        db: AsyncSession,
        *,
        id_list: List[Union[str, UUID]],
        update_data: Union[UpdateSchemaType, Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> int:
        """Update multiple records in bulk"""
        if isinstance(update_data, dict):
            data_dict = update_data
        else:
            data_dict = update_data.dict(exclude_unset=True)
        
        # Set audit fields if user_id provided
        if user_id:
            data_dict['updated_by'] = user_id
        
        data_dict['updated_at'] = datetime.utcnow()
        
        query = update(self.model).where(self.model.id.in_(id_list)).values(**data_dict)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount
    
    async def bulk_delete(
        self,
        db: AsyncSession,
        *,
        id_list: List[Union[str, UUID]],
        soft_delete: bool = True
    ) -> int:
        """Delete multiple records in bulk"""
        if soft_delete and hasattr(self.model, 'deleted_at'):
            # Soft delete
            query = update(self.model).where(
                self.model.id.in_(id_list)
            ).values(deleted_at=datetime.utcnow())
        else:
            # Hard delete
            query = delete(self.model).where(self.model.id.in_(id_list))
        
        result = await db.execute(query)
        await db.commit()
        return result.rowcount
    
    async def get_or_create(
        self,
        db: AsyncSession,
        *,
        defaults: Dict[str, Any],
        **kwargs
    ) -> tuple[ModelType, bool]:
        """Get existing record or create new one"""
        # Try to get existing record
        query = select(self.model).filter_by(**kwargs)
        result = await db.execute(query)
        db_obj = result.scalar_one_or_none()
        
        if db_obj:
            return db_obj, False
        
        # Create new record
        obj_in_data = {**defaults, **kwargs}
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj, True
    
    async def upsert(
        self,
        db: AsyncSession,
        *,
        unique_fields: List[str],
        update_data: Union[UpdateSchemaType, Dict[str, Any]],
        defaults: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> ModelType:
        """Upsert record based on unique fields"""
        # Build query for existing record
        conditions = []
        for field in unique_fields:
            if field in update_data:
                conditions.append(getattr(self.model, field) == update_data[field])
        
        if not conditions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one unique field must be provided"
            )
        
        query = select(self.model).where(and_(*conditions))
        result = await db.execute(query)
        db_obj = result.scalar_one_or_none()
        
        if db_obj:
            # Update existing record
            return await self.update(db, db_obj=db_obj, obj_in=update_data, user_id=user_id)
        else:
            # Create new record
            create_data = update_data.dict() if hasattr(update_data, 'dict') else update_data
            if defaults:
                create_data.update(defaults)
            return await self.create(db, obj_in=create_data, user_id=user_id)

# Utility functions for common database operations
async def paginate_results(
    db: AsyncSession,
    query,
    page: int = 1,
    per_page: int = 20,
    max_per_page: int = 100
) -> tuple[List[Any], Dict[str, int]]:
    """Paginate query results"""
    # Validate pagination parameters
    page = max(1, page)
    per_page = max(1, min(per_page, max_per_page))
    offset = (page - 1) * per_page
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    paginated_query = query.offset(offset).limit(per_page)
    result = await db.execute(paginated_query)
    items = result.scalars().all()
    
    # Calculate pagination info
    pages = (total + per_page - 1) // per_page
    
    return items, {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1
    }

async def apply_filters(
    query,
    model,
    filters: Optional[Dict[str, Any]] = None
):
    """Apply filters to query"""
    if not filters:
        return query
    
    conditions = []
    for key, value in filters.items():
        if hasattr(model, key):
            if isinstance(value, (list, tuple)):
                conditions.append(getattr(model, key).in_(value))
            elif value is not None:
                conditions.append(getattr(model, key) == value)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    return query

# Export the base CRUD class
__all__ = [
    "CRUDBase",
    "paginate_results", 
    "apply_filters"
]