FROM python:3.12-slim

# Install Node.js (needed for opencode-ai)
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install opencode globally
RUN npm install -g opencode-ai

WORKDIR /app

# Install Python MCP dependencies
COPY mcp/requirements.txt /app/mcp/requirements.txt
RUN pip install --no-cache-dir -r /app/mcp/requirements.txt

# Copy MCP server code
COPY mcp/ /app/mcp/

# Copy OpenCode configuration
COPY opencode.json /app/opencode.json
COPY .opencode/ /app/.opencode/

EXPOSE 4096

CMD ["opencode", "serve", "--port", "4096", "--hostname", "0.0.0.0"]
