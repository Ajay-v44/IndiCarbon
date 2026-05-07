import asyncio, httpx
from fastapi import Request

async def main():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("http://localhost:8000/api/v1/auth/roles")
            print(resp.status_code, resp.text)
        except Exception as e:
            print("Client error:", repr(e))

asyncio.run(main())
