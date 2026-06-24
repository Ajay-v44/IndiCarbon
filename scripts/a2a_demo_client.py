#!/usr/bin/env python3
"""
A2A Demo Client — an *external* agent that talks to the IndiCarbon agent.
═══════════════════════════════════════════════════════════════════════════
Exercises the full Agent2Agent Protocol v0.3.0 handshake end-to-end:

  1. Discover   → GET  /.well-known/agent-card.json   (public)
  2. Authenticate → POST /api/v1/auth/login           (Bearer JWT)
  3. message/send → POST /api/v1/a2a  (JSON-RPC, blocking task)
  4. message/stream → POST /api/v1/a2a (JSON-RPC, SSE streaming)
  5. tasks/get   → POST /api/v1/a2a   (retrieve persisted task)

Run it once your stack is up (gateway on :8000, Ollama running):

    pip install httpx
    python scripts/a2a_demo_client.py \
        --base-url http://localhost:8000 \
        --email you@company.com \
        --password 'secret' \
        --query "Calculate our Scope 1 emissions from 12,000 L of diesel"

Exit code 0 = a real agent-to-agent conversation succeeded.
"""
from __future__ import annotations

import argparse
import json
import sys
import uuid

import httpx


def _hr(title: str) -> None:
    print(f"\n\033[1m── {title} {'─' * max(0, 60 - len(title))}\033[0m")


def discover(client: httpx.Client, base_url: str) -> dict:
    _hr("1. Discover Agent Card")
    # v0.3.0 path, with graceful fallback to the legacy 0.2.x path.
    for path in ("/.well-known/agent-card.json", "/.well-known/agent.json"):
        resp = client.get(f"{base_url}{path}")
        if resp.status_code == 200:
            card = resp.json()
            print(f"  ✓ {path}")
            print(f"  Agent      : {card.get('name')}")
            print(f"  Protocol   : v{card.get('protocolVersion')}  ({card.get('preferredTransport')})")
            print(f"  Streaming  : {card.get('capabilities', {}).get('streaming')}")
            print(f"  Skills     : {', '.join(s['id'] for s in card.get('skills', []))}")
            return card
    raise SystemExit("✗ No Agent Card found — is the gateway running?")


def login(client: httpx.Client, base_url: str, email: str, password: str) -> str:
    _hr("2. Authenticate")
    resp = client.post(f"{base_url}/api/v1/auth/login", json={"email": email, "password": password})
    resp.raise_for_status()
    body = resp.json()
    token = (body.get("data") or body).get("access_token")
    if not token:
        raise SystemExit(f"✗ Login returned no access_token: {body}")
    print(f"  ✓ Authenticated as {email}")
    return token


def message_send(client: httpx.Client, base_url: str, token: str, query: str, skill_id: str) -> dict:
    _hr("3. message/send  (JSON-RPC, blocking)")
    rpc = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {
            "message": {
                "role": "user",
                "kind": "message",
                "messageId": uuid.uuid4().hex,
                "parts": [{"kind": "text", "text": query}],
                "metadata": {"skill_id": skill_id},
            }
        },
    }
    resp = client.post(f"{base_url}/api/v1/a2a", json=rpc,
                       headers={"Authorization": f"Bearer {token}"})
    resp.raise_for_status()
    body = resp.json()
    if "error" in body:
        raise SystemExit(f"✗ JSON-RPC error: {body['error']}")
    task = body["result"]
    answer = "".join(p.get("text", "") for p in task["artifacts"][0]["parts"]) if task.get("artifacts") else ""
    print(f"  You   ▸ {query}")
    print(f"  Agent ◂ {answer[:600]}")
    print(f"  task.id={task['id']}  state={task['status']['state']}  "
          f"ctx={task.get('contextId')}  {task['metadata'].get('durationMs')}ms")
    return task


def message_stream(client: httpx.Client, base_url: str, token: str, query: str, skill_id: str) -> None:
    _hr("4. message/stream  (JSON-RPC over SSE)")
    rpc = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/stream",
        "params": {
            "message": {
                "role": "user",
                "kind": "message",
                "messageId": uuid.uuid4().hex,
                "parts": [{"kind": "text", "text": query}],
                "metadata": {"skill_id": skill_id},
            }
        },
    }
    print(f"  You ▸ {query}")
    with client.stream("POST", f"{base_url}/api/v1/a2a", json=rpc,
                       headers={"Authorization": f"Bearer {token}",
                                "Accept": "text/event-stream"}) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines():
            if not line or not line.startswith("data:"):
                continue
            event = json.loads(line[len("data:"):].strip()).get("result", {})
            kind = event.get("kind")
            if kind == "status-update":
                print(f"    · status → {event['status']['state']}"
                      + ("  (final)" if event.get("final") else ""))
            elif kind == "artifact-update":
                txt = "".join(p.get("text", "") for p in event["artifact"]["parts"])
                print(f"    · artifact ◂ {txt[:300]}")


def task_get(client: httpx.Client, base_url: str, token: str, task_id: str) -> None:
    _hr("5. tasks/get  (retrieve persisted task)")
    rpc = {"jsonrpc": "2.0", "id": str(uuid.uuid4()), "method": "tasks/get", "params": {"id": task_id}}
    resp = client.post(f"{base_url}/api/v1/a2a", json=rpc,
                       headers={"Authorization": f"Bearer {token}"})
    resp.raise_for_status()
    body = resp.json()
    if "error" in body:
        print(f"  ✗ {body['error']}")
        return
    task = body["result"]
    print(f"  ✓ Retrieved {task['id']} — state={task['status']['state']}, "
          f"{len(task.get('history', []))} message(s) in history")


def main() -> int:
    ap = argparse.ArgumentParser(description="A2A external-agent demo client for IndiCarbon")
    ap.add_argument("--base-url", default="http://localhost:8000")
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--query", default="What is our Scope 1 emission profile and how can we reduce it?")
    ap.add_argument("--skill-id", default="carbon-accounting")
    args = ap.parse_args()

    with httpx.Client(timeout=180.0) as client:
        discover(client, args.base_url)
        token = login(client, args.base_url, args.email, args.password)
        task = message_send(client, args.base_url, token, args.query, args.skill_id)
        message_stream(client, args.base_url, token,
                       "Summarise the top 3 decarbonisation levers for us.", "strategy-advisory")
        task_get(client, args.base_url, token, task["id"])

    print("\n\033[1;32m✓ Agent-to-agent conversation complete.\033[0m")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except httpx.HTTPStatusError as exc:
        print(f"\n\033[1;31m✗ HTTP {exc.response.status_code}: {exc.response.text[:300]}\033[0m")
        sys.exit(1)
    except httpx.ConnectError:
        print("\n\033[1;31m✗ Could not connect — start the stack (docker compose up) first.\033[0m")
        sys.exit(1)
