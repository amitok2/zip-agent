import asyncpg
import os

pool = None


async def get_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            host=os.getenv("PGHOST", "postgres"),
            port=int(os.getenv("PGPORT", "5432")),
            database=os.getenv("PGDATABASE", "fashion_db"),
            user=os.getenv("PGUSER", "fashion_user"),
            password=os.getenv("PGPASSWORD", "fashion_pass"),
            min_size=2,
            max_size=10,
        )
    return pool
