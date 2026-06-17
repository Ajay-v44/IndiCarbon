"""Entry point for running: python -m indicarbon_mcp"""

import sys
from .server import create_server


def main() -> None:
    server = create_server()

    transport = "stdio"
    if "--sse" in sys.argv:
        transport = "sse"
    elif "--http" in sys.argv:
        transport = "streamable-http"

    if transport in ("sse", "streamable-http"):
        _run_http(server, transport)
    else:
        server.run(transport="stdio")


def _run_http(server, transport: str) -> None:
    """Run with HTTP transport, wrapping the app with auth middleware."""
    import uvicorn
    from starlette.applications import Starlette
    from starlette.middleware import Middleware
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.requests import Request
    from starlette.responses import Response
    from . import client

    if transport == "sse":
        app = server.sse_app()
    else:
        app = server.streamable_http_app()

    class AuthFromHeaders(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            email = request.headers.get("x-user-email")
            password = request.headers.get("x-user-password")
            if email and password and not client.get_access_token():
                try:
                    client.login(email, password)
                except Exception:
                    pass
            return await call_next(request)

    app.add_middleware(AuthFromHeaders)

    host = "0.0.0.0"
    port = int(sys.argv[sys.argv.index("--port") + 1]) if "--port" in sys.argv else 8080
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
