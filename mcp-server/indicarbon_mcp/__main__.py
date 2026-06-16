"""Entry point for running: python -m indicarbon_mcp"""

from .server import create_server
import mcp


def main() -> None:
    server = create_server()
    mcp.run(server)


if __name__ == "__main__":
    main()
