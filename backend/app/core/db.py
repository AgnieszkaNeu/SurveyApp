from sqlmodel import create_engine, Session, SQLModel
from ..core.config import settings
from sqlalchemy.pool import StaticPool
from ..models import survey,choice,user,question
postgreURL = settings.DATABASE_URL
engine = create_engine (
    postgreURL, 
    poolclass = StaticPool,
    echo=True
)
SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
