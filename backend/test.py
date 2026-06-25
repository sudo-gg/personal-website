# -----------------------
# GPT TESTS!!!! :D
# -----------------------
import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# -----------------------
# LOAD ENV
# -----------------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("\n🔍 DATABASE_URL:")
print(DATABASE_URL)
print("\n")

if not DATABASE_URL:
    raise Exception("❌ DATABASE_URL is None. .env not loading correctly")

# -----------------------
# ENGINE
# -----------------------
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 5
    }
)

SessionLocal = sessionmaker(bind=engine)

# -----------------------
# TEST 1: RAW CONNECT
# -----------------------
def test_select():
    print("\n🧪 TEST 1: SELECT 1")

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            print("✅ SELECT OK:", result)

    except Exception as e:
        print("❌ SELECT FAILED:", e)
        return False

    return True


# -----------------------
# TEST 2: SESSION CONNECT
# -----------------------
def test_session():
    print("\n🧪 TEST 2: SESSION CONNECT")

    try:
        with SessionLocal() as db:
            result = db.execute(text("SELECT 1")).fetchone()
            print("✅ SESSION OK:", result)

    except Exception as e:
        print("❌ SESSION FAILED:", e)
        return False

    return True


# -----------------------
# TEST 3: INSERT
# -----------------------
def test_insert():
    print("\n🧪 TEST 3: INSERT INTO events")

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
                    "visitor_id": "test_user",
                    "page": "test_page",
                    "event_type": "page_view",
                    "timestamp": datetime.now(timezone.utc),
                    "metadata": json.dumps({"test": True}),
                },
            )

            db.commit()

        print("✅ INSERT OK")

    except Exception as e:
        print("❌ INSERT FAILED:", e)
        return False

    return True


# -----------------------
# RUN ALL TESTS
# -----------------------
if __name__ == "__main__":
    print("\n🚀 STARTING DB TESTS\n")

    ok1 = test_select()
    ok2 = test_session()

    if ok1 and ok2:
        test_insert()

    print("\n🏁 DONE\n")