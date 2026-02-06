import json
from db import get_pool


async def get_kpi_summary(period: str = "today") -> str:
    """Get key business metrics for a time period.
    period: 'today', 'this_week', 'this_month', 'this_year'.
    Returns: total_orders, total_revenue, avg_order_value, orders_by_status,
    top_5_categories, top_5_products, return_rate, new_customers_count.
    """
    period_filter = {
        "today": "order_date >= CURRENT_DATE",
        "this_week": "order_date >= date_trunc('week', CURRENT_DATE)",
        "this_month": "order_date >= date_trunc('month', CURRENT_DATE)",
        "this_year": "order_date >= date_trunc('year', CURRENT_DATE)",
    }

    if period not in period_filter:
        return json.dumps({"error": f"Invalid period '{period}'. Use: today, this_week, this_month, this_year"})

    where = period_filter[period]
    pool = await get_pool()

    try:
        async with pool.acquire() as conn:
            # Basic metrics
            basic = await conn.fetchrow(f"""
                SELECT
                    COUNT(*) AS total_orders,
                    COALESCE(SUM(total_amount), 0) AS total_revenue,
                    COALESCE(AVG(total_amount), 0) AS avg_order_value
                FROM orders
                WHERE {where}
            """)

            # Orders by status
            status_rows = await conn.fetch(f"""
                SELECT status, COUNT(*) AS count
                FROM orders
                WHERE {where}
                GROUP BY status
                ORDER BY count DESC
            """)

            # Top 5 categories
            cat_rows = await conn.fetch(f"""
                SELECT c.name_he AS category, SUM(oi.unit_price * oi.quantity) AS revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE {where}
                GROUP BY c.name_he
                ORDER BY revenue DESC
                LIMIT 5
            """)

            # Top 5 products
            prod_rows = await conn.fetch(f"""
                SELECT p.name_he AS product, SUM(oi.quantity) AS units_sold,
                       SUM(oi.unit_price * oi.quantity) AS revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                WHERE {where}
                GROUP BY p.name_he
                ORDER BY units_sold DESC
                LIMIT 5
            """)

            # Return rate
            returns = await conn.fetchrow(f"""
                SELECT
                    COUNT(DISTINCT r.id) AS return_count,
                    COUNT(DISTINCT o.id) AS order_count
                FROM orders o
                LEFT JOIN returns r ON o.id = r.order_id
                WHERE {where}
            """)
            return_rate = (
                round(returns["return_count"] / returns["order_count"] * 100, 1)
                if returns["order_count"] > 0
                else 0
            )

            # New customers
            cust_where = period_filter[period].replace("order_date", "registration_date")
            new_customers = await conn.fetchval(f"""
                SELECT COUNT(*) FROM customers WHERE {cust_where}
            """)

            result = {
                "period": period,
                "total_orders": basic["total_orders"],
                "total_revenue": str(round(basic["total_revenue"], 2)),
                "avg_order_value": str(round(basic["avg_order_value"], 2)),
                "orders_by_status": {r["status"]: r["count"] for r in status_rows},
                "top_5_categories": [
                    {"category": r["category"], "revenue": str(round(r["revenue"], 2))}
                    for r in cat_rows
                ],
                "top_5_products": [
                    {"product": r["product"], "units_sold": r["units_sold"], "revenue": str(round(r["revenue"], 2))}
                    for r in prod_rows
                ],
                "return_rate_percent": return_rate,
                "new_customers_count": new_customers,
            }

            return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})
