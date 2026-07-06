import json
import httpx
import uuid
import sys
from langchain_community.llms import Ollama

# Configuration
BASE_URL = "http://localhost:8000"
EMAIL = "ajay@swiftrack.com"
PASSWORD = "admin123"
MODEL_NAME = "gemma4:e4b"

print(f"Initializing Ollama LLM with model '{MODEL_NAME}'...")
llm = Ollama(model=MODEL_NAME)

# Shared state to store bearer token and resolved organization ID
auth_token = None
org_id = None

def login_to_indicarbon(email: str = EMAIL, password: str = PASSWORD) -> str:
    """Log in to IndiCarbon API Gateway and obtain a bearer token."""
    global auth_token, org_id
    try:
        url = f"{BASE_URL}/api/v1/auth/login"
        resp = httpx.post(url, json={"email": email, "password": password})
        resp.raise_for_status()
        token = resp.json()["data"]["access_token"]
        auth_token = token
        
        # Get profile to extract org ID
        headers = {"Authorization": f"Bearer {token}"}
        profile_resp = httpx.get(f"{BASE_URL}/api/v1/users/me", headers=headers)
        profile_resp.raise_for_status()
        profile_body = profile_resp.json()
        profile_data = profile_body.get("data") or profile_body
        org_ids = profile_data.get("organization_ids", [])
        if org_ids:
            org_id = org_ids[0]
            
        return f"Successfully authenticated. Token retrieved. Organization ID: {org_id}"
    except Exception as e:
        return f"Login failed: {str(e)}"

def discover_agent_capabilities() -> str:
    """Discover the capabilities (skills, version) of the IndiCarbon A2A agent."""
    try:
        url = f"{BASE_URL}/.well-known/agent-card.json"
        resp = httpx.get(url)
        resp.raise_for_status()
        card = resp.json()
        skills = [s["id"] for s in card.get("skills", [])]
        return f"Agent Name: {card.get('name')}\nSkills Available: {', '.join(skills)}"
    except Exception as e:
        return f"Discovery failed: {str(e)}"

def send_a2a_task(query: str, skill_id: str) -> str:
    """Send a structured task/query to the IndiCarbon A2A agent.
    
    Args:
        query: The message or question to send.
        skill_id: The skill ID (e.g. 'carbon-accounting', 'strategy-advisory', 'brsr-compliance', 'carbon-trading', 'wallet-management').
    """
    global auth_token
    if not auth_token:
        login_res = login_to_indicarbon()
        if "failed" in login_res:
            return login_res
            
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "query": query,
            "skill_id": skill_id
        }
        url = f"{BASE_URL}/api/v1/a2a/tasks"
        resp = httpx.post(url, json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        body = resp.json()
        task = body.get("data") or body
        
        state = task.get("status", {}).get("state", "unknown")
        answer = ""
        if task.get("artifacts"):
            answer = "".join(p.get("text", "") for p in task["artifacts"][0]["parts"])
            
        return f"Task ID: {task.get('id')}\nState: {state}\nAnswer from IndiCarbon Agent:\n{answer}"
    except Exception as e:
        return f"Failed to send task: {str(e)}"

# Setup Tools
class Tool:
    def __init__(self, name, func, description):
        self.name = name
        self.func = func
        self.description = description

tools = [
    Tool(
        name="login",
        func=login_to_indicarbon,
        description="Authenticate and log in to the IndiCarbon platform."
    ),
    Tool(
        name="discover",
        func=discover_agent_capabilities,
        description="Discover the available skills and protocol version of the agent."
    ),
    Tool(
        name="sendtask",
        func=send_a2a_task,
        description="Delegate any task/query to the IndiCarbon A2A agent using the appropriate skill."
    )
]

class LangChainStyleAgent:
    def __init__(self, tools, llm):
        self.tools = {t.name.lower(): t for t in tools}
        self.llm = llm
        
    def run(self, prompt: str) -> str:
        print(f"\n[Agent Log] Coordinating A2A tools for user query: '{prompt}'")
        system_prompt = (
            "You are an AI coordinator coordinating with the IndiCarbon agent via the A2A (Agent-to-Agent) protocol.\n"
            "You have access to the following tools:\n"
            "- login: Log in to get authentication token. Takes no arguments.\n"
            "- discover: Discover agent skills. Takes no arguments.\n"
            "- sendtask: Send a query to the IndiCarbon A2A agent. Arguments: 'query' (str), 'skill_id' (str).\n\n"
            "Routing Guide for 'sendtask' skill_ids:\n"
            "- For wallet balance, transaction history, funds, or wallet checks, use skill_id: 'wallet-management'.\n"
            "- For carbon footprint, Scope 1/2/3 calculations, emission factors, use skill_id: 'carbon-accounting'.\n"
            "- For net-zero roadmaps, decarbonisation strategy, sector benchmarks, use skill_id: 'strategy-advisory'.\n"
            "- For SEBI compliance, ESG disclosures, BRSR reports, use skill_id: 'brsr-compliance'.\n"
            "- For buying/selling carbon credits or credit prices, use skill_id: 'carbon-trading'.\n\n"
            "Analyze the user request. Choose the correct tool. Output ONLY a valid JSON object matching this structure to execute the tool, for example:\n"
            '{"tool": "sendtask", "args": {"query": "What is my wallet balance?", "skill_id": "wallet-management"}}\n'
            'or\n'
            '{"tool": "sendtask", "args": {"query": "Analyse Scope 1 electricity", "skill_id": "carbon-accounting"}}\n'
            "Ensure the output contains only the JSON payload and nothing else."
        )
        response = self.llm.invoke(f"{system_prompt}\nUser request: {prompt}")
        print(f"[Agent Log] LLM tool choice: {response}")
        try:
            cleaned = response.strip()
            if cleaned.startswith("```"):
                lines = cleaned.splitlines()
                if len(lines) > 2:
                    cleaned = "\n".join(lines[1:-1]).strip()
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                action = json.loads(cleaned[start:end+1])
                tool_name = action["tool"].lower()
                if tool_name in self.tools:
                    print(f"[Agent Log] Executing tool: '{tool_name}' with args: {action.get('args', {})}")
                    return self.tools[tool_name].func(**action.get("args", {}))
            return f"Agent could not parse tool execution from LLM output: {response}"
        except Exception as e:
            return f"Failed execution loop: {str(e)}. Raw response: {response}"

agent = LangChainStyleAgent(tools, llm)

if __name__ == "__main__":
    print("\n============================================================")
    print("        IndiCarbon Interactive A2A Test Agent")
    print("============================================================")
    print(f"LLM Model       : {MODEL_NAME}")
    print(f"API Gateway URL : {BASE_URL}")
    print("Logging in to session...")
    print(login_to_indicarbon())
    print("-" * 60)
    print("Agent is ready! You can now chat and ask questions.")
    print("Examples:\n  - 'What is my wallet balance?'\n  - 'Add 500 rupees to my wallet'\n  - 'What carbon skills do you have?'\n  - 'Calculate Scope 1 emissions for 12000L of diesel'")
    print("Type 'exit' or 'quit' to exit.")
    print("-" * 60)
    
    # Check if run with redirect or interactive
    if not sys.stdin.isatty():
        # Running in background/non-interactive test
        print("\n[Non-interactive Mode] Running simple test queries...")
        print(agent.run("What is my wallet balance?"))
        sys.exit(0)

    while True:
        try:
            user_input = input("\nYou > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit"):
                print("Exiting interactive session.")
                break
                
            res = agent.run(user_input)
            print(f"\nResult > {res}")
        except KeyboardInterrupt:
            print("\nExiting interactive session.")
            break
        except Exception as e:
            print(f"Error: {str(e)}")
