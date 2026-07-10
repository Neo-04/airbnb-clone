from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

is_sqlite = settings.database_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLite ignores foreign keys unless we turn them on per connection.
if is_sqlite:

    @event.listens_for(engine, "connect")
    def _enable_sqlite_fk(dbapi_connection, _):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Yield a database session and always close it afterwards.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create tables for any models registered on Base. Models are added in later phases.
def init_db() -> None:
    from app import models  # noqa: F401  (imported so models register before create_all)

    Base.metadata.create_all(bind=engine)
