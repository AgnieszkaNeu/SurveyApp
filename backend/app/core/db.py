from sqlmodel import create_engine, Session, SQLModel
from ..core.config import settings
from sqlalchemy.pool import StaticPool
from ..models import survey,choice,user,question

engine = create_engine (
    settings.DATABASE_URL, 
    poolclass = StaticPool
)

def get_session():
    with Session(engine) as session:
        yield session
