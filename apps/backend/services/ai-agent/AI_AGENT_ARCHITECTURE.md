# IndiCarbon AI Agent Service: Architecture & Workflow Guide

Welcome! If you are new to AI and want to understand how the **IndiCarbon AI Agent Service** works under the hood, this guide is for you. 

We will break down the jargon (like "Nodes", "Graphs", and "Embeddings") and explain exactly how a document goes from an uploaded file to a calculated carbon footprint.

---

## 🧠 1. Core AI Concepts (Demystified)

Before diving into the code, let's understand the core concepts used in this service. We use a framework called **LangGraph** to build our AI pipeline. Think of LangGraph as a manager overseeing a factory assembly line.

*   **The LLM (Large Language Model)**: This is the "brain" of the operation. We use a local AI model called `qwen2.5-coder:14b` (running via Ollama). It reads text, understands instructions, and generates responses.
*   **The Agent**: An AI that doesn't just talk, but *acts*. It is given a goal and a set of tools. It uses the LLM to decide *which* tool to use to achieve the goal.
*   **Tools**: The "hands" of the agent. An LLM cannot inherently browse the web or access your database. Tools are simple Python functions we write (like `get_emission_factors` or `calculate_scope_emissions`) that the Agent is allowed to trigger.
*   **State**: The "clipboard" or "working memory". As the document moves through the assembly line, the State holds all the gathered information (the parsed text, the extracted emissions, any warnings, etc.).
*   **Nodes & Chaining**: A Node is a single station on the assembly line. A "Chain" or "Graph" is how we link these stations together. For example: `Parse Document Node` -> `Extract Data Node` -> `Calculate Emissions Node`.
*   **Embeddings & Vector Search (RAG)**: AI models can't "remember" entire libraries of past documents. Instead, we chop documents into pieces, convert them into numbers (vectors/embeddings), and store them. Later, if you ask a question, we mathematically find the most relevant pieces and show them to the AI so it can answer you.

---

## ⚙️ 2. The Step-by-Step Workflow

Here is exactly what happens when you upload a sustainability document to the `/api/v1/analyse-document` endpoint.

### Step 1: Ingestion & Parsing
*   **Upload**: The user uploads a document (PDF, Excel, Word).
*   **Storage**: The service securely saves the raw file into a Supabase storage bucket (`IndiCarbon`) and logs it in the `document_vault` database table.
*   **Parsing**: The file is sent through a `document_parser` which extracts all the human-readable text.

### Step 2: Background "Embedding" (Memory Creation)
While the main pipeline continues, a background job starts. 
1. It splits the massive document text into smaller "chunks" of 1000 characters.
2. It sends these chunks to the Ollama Embedding model (`nomic-embed-text`) which converts the text into mathematical coordinates (vectors).
3. These vectors are saved into the Supabase database (`pgvector`).

**Why?** So that later on, if a user asks *"What did my Q2 report say about flights?"*, the agent can instantly search this database, find the relevant chunk, and answer the question without re-reading the entire file!

### Step 3: The LangGraph "ReAct" Agent Loop
The parsed text is handed over to the **LangGraph Agent**. This agent uses a strategy called **ReAct** (Reasoning + Acting).

Instead of a rigid step 1-2-3 pipeline, the agent is given a prompt (its mission) and tools, and it thinks in loops:

1.  **Thought**: "I need to find the reporting year in this document text."
    *   *Action*: (Reads the text) "Ah, it's 2024."
2.  **Thought**: "Now I need the available emission factors for 2024 to map the activities to."
    *   *Action*: Triggers the `get_emission_factors` **Tool**.
3.  **Observation**: The tool returns a list of valid factors (like electricity, flights, etc.).
4.  **Thought**: "I see the document mentions '500 kWh of electricity'. I need to map this to the electricity factor and calculate the emissions."
    *   *Action*: Triggers the `calculate_scope_emissions` **Tool** with the extracted data.
5.  **Observation**: The tool returns the final calculated `CO2e` (Carbon Dioxide Equivalent) footprint.
6.  **Thought**: "I have completed all tasks. I will now generate a final summary for the user."

*Note: The LangGraph framework manages the transitions between the "Agent Node" (the AI thinking) and the "Tools Node" (executing the Python functions).*

### Step 4: Memory & Tracing
Throughout this entire process:
*   **Langfuse** (an observability platform) is quietly recording every thought, tool call, and millisecond of latency. This allows developers to see exactly *why* the AI made a specific decision.
*   The Agent uses a **3-Tier Memory Architecture**:
    1.  **Working Memory** (`AuditorState`): Keeping track of current steps.
    2.  **Episodic Memory** (`MemorySaver`): Checkpointing the conversation so it can pause/resume if needed.
    3.  **Semantic Memory** (`InMemoryStore`/`Postgres`): Saving long-term facts.

### Step 5: Final Output
The service packages the Agent's final summary, the raw extracted items, and the compliance results into a neat JSON object (`DocumentAnalysisResult`) and sends it back to the frontend.

---

## 🛠️ 3. Where to Find the Code

If you want to explore the code, here is where everything lives in the `apps/backend/services/ai-agent/` folder:

*   **`app/api/routes.py`**: The front door. Receives the HTTP requests.
*   **`app/services/document_analysis_service.py`**: The manager. Handles storage, parsing, triggering the background embedding job, and launching the Agent.
*   **`app/graph/document_graph.py`**: The assembly line setup. Configures the LLM, the Tools, and compiles the LangGraph Agent.
*   **`app/graph/tools.py`**: The "hands" of the agent. Contains the actual Python functions the AI is allowed to run.
*   **`app/graph/state.py`**: The definition of the "clipboard" passing data around.
*   **`agent.py`**: Contains alternative Agents (like the Strategist and standalone Auditor) and tools like `VectorSearchTool` which query the embeddings we saved in Step 2.
