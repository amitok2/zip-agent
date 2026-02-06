import json
import re
from db import get_pool


async def run_query(sql: str) -> str:
    """Execute a read-only SQL SELECT query against the e-commerce database.
    Only SELECT statements are allowed. Results are limited to 100 rows.
    Use this tool to answer business questions by querying the PostgreSQL database.
    """
    normalized = sql.strip()

    # Safety: only allow SELECT and WITH (CTE) statements
    first_keyword = normalized.split()[0].upper() if normalized else ""
    if first_keyword not in ("SELECT", "WITH"):
        return json.dumps({"error": "Only SELECT queries are allowed. Your query must start with SELECT or WITH."})

    # Block dangerous keywords
    dangerous = re.compile(
        r'\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY)\b',
        re.IGNORECASE,
    )
    if dangerous.search(normalized):
        return json.dumps({"error": "Query contains forbidden keywords. Only read-only SELECT queries are allowed."})

    # Auto-append LIMIT if not present
    if not re.search(r'\bLIMIT\b', normalized, re.IGNORECASE):
        normalized = normalized.rstrip(";") + " LIMIT 100"

    pool = await get_pool()
    try:
        async with pool.acquire() as conn:
            # Set statement timeout and read-only transaction
            await conn.execute("SET statement_timeout = '10s'")
            async with conn.transaction(readonly=True):
                rows = await conn.fetch(normalized)

                if not rows:
                    return json.dumps({"columns": [], "rows": [], "row_count": 0})

                columns = list(rows[0].keys())
                data = []
                for row in rows:
                    data.append({col: _serialize(row[col]) for col in columns})

                return json.dumps(
                    {"columns": columns, "rows": data, "row_count": len(data)},
                    ensure_ascii=False,
                )
    except Exception as e:
        return json.dumps({"error": str(e)})


def _serialize(value):
    """Convert asyncpg types to JSON-serializable values."""
    if value is None:
        return None
    if isinstance(value, (int, float, str, bool)):
        return value
    if isinstance(value, list):
        return [_serialize(v) for v in value]
    # datetime, date, Decimal, etc.
    return str(value)
