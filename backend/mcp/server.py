from fastmcp import FastMCP

from tools.run_query import run_query
from tools.get_schema import get_schema
from tools.search_data import search_data
from tools.get_kpi_summary import get_kpi_summary

mcp = FastMCP("fashion-bi")

mcp.tool(run_query)
mcp.tool(get_schema)
mcp.tool(search_data)
mcp.tool(get_kpi_summary)

if __name__ == "__main__":
    mcp.run()
