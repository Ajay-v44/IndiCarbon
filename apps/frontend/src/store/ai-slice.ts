import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  analyseDocument,
  createAgentRegistry,
  deleteAgentRegistry,
  getChatHistory,
  listAgentRegistry,
  sendChatMessage,
  updateAgentRegistry,
  sendA2ATask,
  listA2ATasks,
  getA2AStats,
} from "@/lib/api/ai";
import {
  AgentRegistryCreate,
  AgentRegistryResponse,
  AgentRegistryUpdate,
  ChatHistoryItem,
  ChatResponse,
  DocumentAnalysisResult,
  A2ATaskSummary,
  A2AActivityStats,
  A2ATask,
} from "@/lib/api/types";

type AIState = {
  chatHistory: ChatHistoryItem[];
  activeChatResponse: ChatResponse | null;
  analysisResult: DocumentAnalysisResult | null;
  agents: AgentRegistryResponse[];
  a2aTasks: A2ATaskSummary[];
  a2aStats: A2AActivityStats | null;
  a2aActiveTask: A2ATask | null;
  a2aStatus: "idle" | "loading" | "succeeded" | "failed";
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AIState = {
  chatHistory: [],
  activeChatResponse: null,
  analysisResult: null,
  agents: [],
  a2aTasks: [],
  a2aStats: null,
  a2aActiveTask: null,
  a2aStatus: "idle",
  status: "idle",
  error: null,
};

export const fetchChatHistory = createAsyncThunk<
  ChatHistoryItem[],
  { limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("ai/fetchChatHistory", async (params, { rejectWithValue }) => {
  try {
    const res = await getChatHistory(params);
    return res.items || [];
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch chat history.");
  }
});

export const sendChatMessageThunk = createAsyncThunk<
  ChatResponse,
  string,
  { rejectValue: string }
>("ai/sendMessage", async (query, { rejectWithValue }) => {
  try {
    return await sendChatMessage(query);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to get response from chatbot.");
  }
});

export const triggerDocumentAnalysis = createAsyncThunk<
  DocumentAnalysisResult,
  { file: File; revenueCrore?: number },
  { rejectValue: string }
>("ai/analyseDocument", async ({ file, revenueCrore }, { rejectWithValue }) => {
  try {
    return await analyseDocument(file, revenueCrore);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to analyze document.");
  }
});

export const fetchAgentRegistry = createAsyncThunk<
  AgentRegistryResponse[],
  { limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("ai/fetchAgents", async (params, { rejectWithValue }) => {
  try {
    return await listAgentRegistry(params);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to list registered agents.");
  }
});

export const registerAgent = createAsyncThunk<
  AgentRegistryResponse,
  AgentRegistryCreate,
  { rejectValue: string }
>("ai/registerAgent", async (payload, { rejectWithValue }) => {
  try {
    return await createAgentRegistry(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to register agent.");
  }
});

export const modifyAgent = createAsyncThunk<
  AgentRegistryResponse,
  { agentId: string; data: AgentRegistryUpdate },
  { rejectValue: string }
>("ai/modifyAgent", async ({ agentId, data }, { rejectWithValue }) => {
  try {
    return await updateAgentRegistry(agentId, data);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to update agent.");
  }
});

export const removeAgent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("ai/removeAgent", async (agentId, { rejectWithValue }) => {
  try {
    await deleteAgentRegistry(agentId);
    return agentId;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to delete agent.");
  }
});

// ─── A2A Thunks ───

export const sendA2ATaskThunk = createAsyncThunk<
  A2ATask,
  { query: string; session_id?: string; skill_id?: string },
  { rejectValue: string }
>("ai/sendA2ATask", async (payload, { rejectWithValue }) => {
  try {
    return await sendA2ATask(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to send A2A task.");
  }
});

export const fetchA2ATasks = createAsyncThunk<
  A2ATaskSummary[],
  { organization_id?: string; state?: string; skill_id?: string; limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("ai/fetchA2ATasks", async (params, { rejectWithValue }) => {
  try {
    return await listA2ATasks(params);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch A2A tasks.");
  }
});

export const fetchA2AStats = createAsyncThunk<
  A2AActivityStats,
  string | undefined,
  { rejectValue: string }
>("ai/fetchA2AStats", async (organizationId, { rejectWithValue }) => {
  try {
    return await getA2AStats(organizationId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch A2A stats.");
  }
});

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearAIError(state) {
      state.error = null;
    },
    resetAIStatus(state) {
      state.status = "idle";
    },
    clearAnalysisResult(state) {
      state.analysisResult = null;
    },
    appendMockChat(state, action: PayloadAction<ChatHistoryItem>) {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory(state) {
      state.chatHistory = [];
      state.activeChatResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat history — backend returns DESC (newest first), reverse for chronological display
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.chatHistory = [...action.payload].reverse();
      })

      // Send Chat Message
      .addCase(sendChatMessageThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendChatMessageThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeChatResponse = action.payload;
        // Append response to history
        state.chatHistory.push({
          interaction_id: action.payload.interaction_id || action.payload.run_id,
          session_id: action.payload.session_id,
          query: action.meta.arg,
          answer: action.payload.answer,
          created_at: new Date().toISOString(),
          sources: action.payload.sources,
          guardrail_blocked: action.payload.guardrail_audit?.blocked || false,
        });
      })
      .addCase(sendChatMessageThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to send message.";
      })

      // Document Analysis
      .addCase(triggerDocumentAnalysis.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(triggerDocumentAnalysis.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.analysisResult = action.payload;
      })
      .addCase(triggerDocumentAnalysis.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to analyze document.";
      })

      // Agents registry listing
      .addCase(fetchAgentRegistry.fulfilled, (state, action) => {
        state.agents = action.payload;
      })
      .addCase(registerAgent.fulfilled, (state, action) => {
        state.agents.push(action.payload);
      })
      .addCase(modifyAgent.fulfilled, (state, action) => {
        const idx = state.agents.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) {
          state.agents[idx] = action.payload;
        }
      })
      .addCase(removeAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter((a) => a.id !== action.payload);
      })

      // A2A
      .addCase(sendA2ATaskThunk.pending, (state) => {
        state.a2aStatus = "loading";
      })
      .addCase(sendA2ATaskThunk.fulfilled, (state, action) => {
        state.a2aStatus = "succeeded";
        state.a2aActiveTask = action.payload;
      })
      .addCase(sendA2ATaskThunk.rejected, (state, action) => {
        state.a2aStatus = "failed";
        state.error = action.payload ?? "A2A task failed.";
      })
      .addCase(fetchA2ATasks.fulfilled, (state, action) => {
        state.a2aTasks = action.payload;
      })
      .addCase(fetchA2AStats.fulfilled, (state, action) => {
        state.a2aStats = action.payload;
      });
  },
});

export const { clearAIError, resetAIStatus, clearAnalysisResult, appendMockChat, clearChatHistory } = aiSlice.actions;
export const aiReducer = aiSlice.reducer;
