import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
# from supabase import create_client
import uvicorn
from sqlalchemy.pool import NullPool


DATABASE_URL = os.getenv("DATABASE_URL")
from sqlalchemy.pool import NullPool

con = create_engine(DATABASE_URL, client_encoding='utf8', poolclass=NullPool)
# engine = create_engine(
#     DATABASE_URL,
#     pool_pre_ping=True,
#     pool_recycle=300,
#     pool_size=5,
#     max_overflow=10,
#     connect_args={"sslmode": "require"}
# )
SessionLocal = sessionmaker(bind=con)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventIn(BaseModel):
    visitor_id: str
    page: str
    event_type: str
    metadata: dict = {}

@app.get("/")
def root():
    return {"message": "Sudo-gg API"}

@app.post("/event")

def addEvent(event: EventIn):
    print("EVENT RECEIVED:", event.model_dump())
    try:
        with SessionLocal() as db:
            db.execute(
    text("""
        insert into events
        (visitor_id, page, event_type, timestamp, metadata)
        values
        (:visitor_id, :page, :event_type, :timestamp, :metadata)
    """),
    {
        "visitor_id": event.visitor_id,
        "page": event.page,
        "event_type": event.event_type,
        "timestamp": datetime.now(timezone.utc),
        "metadata": json.dumps(event.metadata)
    },
)
            db.commit()
        print("INSERT SUCCESS")
        return {"ok": True}

    except Exception as e:
        print("INSERT FAILED:", str(e))
        return {"ok": False, "error": str(e)}

@app.get("/analytics")
def analytics():
    with SessionLocal() as db:
        rows = db.execute(
            text("select * from events order by timestamp desc limit 50")
        ).mappings().all()

    total_page_views = sum(1 for r in rows if r["event_type"] == "page_view")
    unique_visitors = len({r["visitor_id"] for r in rows})

    return {
        "total_page_views": total_page_views,
        "unique_visitors": unique_visitors,
        "events": [dict(r) for r in rows],
    }


if __name__ == "__main__":
    print(DATABASE_URL)
    uvicorn.run(app, host="127.0.0.1", port=8000)
