import json
from db import get_pool


async def search_data(query: str, entity: str = "products") -> str:
    """Full-text search across products or customers.
    entity: 'products' searches by name, description, and tags.
    entity: 'customers' searches by name, email, and city.
    Returns up to 20 matching results.
    """
    pool = await get_pool()
    try:
        async with pool.acquire() as conn:
            if entity == "products":
                rows = await conn.fetch(
                    """
                    SELECT p.id, p.sku, p.name, p.name_he, p.price, p.cost_price,
                           p.gender, p.is_active, b.name AS brand, c.name_he AS category,
                           ts_rank(p.search_vector, plainto_tsquery('simple', $1)) AS rank
                    FROM products p
                    LEFT JOIN brands b ON p.brand_id = b.id
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.search_vector @@ plainto_tsquery('simple', $1)
                       OR p.name ILIKE '%' || $1 || '%'
                       OR p.name_he ILIKE '%' || $1 || '%'
                    ORDER BY rank DESC
                    LIMIT 20
                    """,
                    query,
                )
                results = [
                    {
                        "id": r["id"],
                        "sku": r["sku"],
                        "name": r["name"],
                        "name_he": r["name_he"],
                        "price": str(r["price"]),
                        "cost_price": str(r["cost_price"]),
                        "gender": r["gender"],
                        "brand": r["brand"],
                        "category": r["category"],
                    }
                    for r in rows
                ]
            elif entity == "customers":
                rows = await conn.fetch(
                    """
                    SELECT id, first_name, last_name, email, phone, city,
                           registration_date, is_active
                    FROM customers
                    WHERE first_name ILIKE '%' || $1 || '%'
                       OR last_name ILIKE '%' || $1 || '%'
                       OR email ILIKE '%' || $1 || '%'
                       OR city ILIKE '%' || $1 || '%'
                    LIMIT 20
                    """,
                    query,
                )
                results = [
                    {
                        "id": r["id"],
                        "name": f"{r['first_name']} {r['last_name']}",
                        "email": r["email"],
                        "phone": r["phone"],
                        "city": r["city"],
                        "registered": str(r["registration_date"]),
                        "active": r["is_active"],
                    }
                    for r in rows
                ]
            else:
                return json.dumps({"error": "entity must be 'products' or 'customers'"})

            return json.dumps(
                {"entity": entity, "query": query, "results": results, "count": len(results)},
                ensure_ascii=False,
            )
    except Exception as e:
        return json.dumps({"error": str(e)})
