from sqlalchemy.exc import SQLAlchemyError
from ..core.exceptions import DatabaseError, CouldNotCreateResource, NotFoundError
from functools import wraps

def transactional(refresh_returned_instance: bool = False):

    def decoratotr(func):
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            session = kwargs.get("session")

            if session is None:
                raise DatabaseError("Session not provided to transactional function")
            
            try:
                result = func(*args, **kwargs)
                session.commit()
                if refresh_returned_instance and result is not None:

                    if hasattr(result, "__table__"):
                        session.refresh(result)

                    elif isinstance(result, (list, tuple, set)):
                        for item in result:
                            if hasattr(item, "__table__"):
                                session.refresh(item)
                
                return result   
        
            
            except (CouldNotCreateResource, NotFoundError):
                if session:
                    session.rollback()
                raise   

            except SQLAlchemyError as e:
                if session:
                    session.rollback()
                raise DatabaseError(f"Database error occurred in function {func.__name__}: {e}") from e
            
        return wrapper
    
    return decoratotr

