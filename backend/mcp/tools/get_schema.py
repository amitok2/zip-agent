import json
from db import get_pool


async def get_schema(table_name: str | None = None, description: str = "") -> str:
    """Get database schema information.
    If no table_name is provided, returns all tables with their columns and types.
    If a table_name is provided, returns detailed column info for that specific table.

    Args:
        table_name: Optional table name to get schema for. If omitted, returns all tables.
        description: A short Hebrew description of why this schema is being retrieved (e.g. "בדיקת מבנה טבלת הזמנות").
    """
    pool = await get_pool()
    try:
        async with pool.acquire() as conn:
            if table_name:
                rows = await conn.fetch(
                    """
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1
                    ORDER BY ordinal_position
                    """,
                    table_name,
                )
                if not rows:
                    return json.dumps({"error": f"Table '{table_name}' not found"})

                columns = []
                for row in rows:
                    columns.append({
                        "name": row["column_name"],
                        "type": row["data_type"],
                        "nullable": row["is_nullable"] == "YES",
                        "default": str(row["column_default"]) if row["column_default"] else None,
                    })
                return json.dumps(
                    {"table": table_name, "columns": columns},
                    ensure_ascii=False,
                )
            else:
                rows = await conn.fetch(
                    """
                    SELECT table_name, column_name, data_type
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    ORDER BY table_name, ordinal_position
                    """
                )
                tables = {}
                for row in rows:
                    tname = row["table_name"]
                    if tname not in tables:
                        tables[tname] = []
                    tables[tname].append({
                        "name": row["column_name"],
                        "type": row["data_type"],
                    })
                return json.dumps(tables, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})
