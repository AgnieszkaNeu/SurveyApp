from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from ..core.exceptions import DatabaseError, EmailAlreadyExistsException, CouldNotCreateResource, NotFoundError
from functools import wraps

def transactional(refresh_returned_instance: bool = False):

    def decoratotr(func):
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            session = kwargs.get("session")
            try:
                result = func(*args, **kwargs)
                if session is not None:
                    session.commit()

                    if refresh_returned_instance and result is not None:

                        if hasattr(result, "__table__"):
                            session.refresh(result)

                        elif isinstance(result, (list, tuple, set)):
                            for item in result:
                                if hasattr(item, "__table__"):
                                    session.refresh(item)

                return result

            except IntegrityError as e:
                session.rollback()
                raise EmailAlreadyExistsException("Email already exists.")    
            
            except SQLAlchemyError as e:
                if session is not None:
                    session.rollback()
                raise DatabaseError("Database error") from e
            
            except CouldNotCreateResource:
                if session:
                    session.rollback()
                raise   
            
            except NotFoundError:
                if session:
                    session.rollback()
                raise     
            
        return wrapper
    
    return decoratotr

