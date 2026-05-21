import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  analyseDocument,
  createAgentRegistry,
  deleteAgentRegistry,
  getChatHistory,
  listAgentRegistry,
  sendChatMessage,
  updateAgentRegistry,
} from "@/lib/api/ai";
import {
  AgentRegistryCreate,
  AgentRegistryResponse,
  AgentRegistryUpdate,
  ChatHistoryItem,
  ChatResponse,
  DocumentAnalysisResult,
} from "@/lib/api/types";

type AIState = {
  chatHistory: ChatHistoryItem[];
  activeChatResponse: ChatResponse | null;
  analysisResult: DocumentAnalysisResult | null;
  agents: AgentRegistryResponse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AIState = {
  chatHistory: [],
  activeChatResponse: null,
  analysisResult: null,
  agents: [],
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
  },
  extraReducers: (builder) => {
    builder
      // Chat history
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.chatHistory = action.payload;
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
      });
  },
});

export const { clearAIError, resetAIStatus, clearAnalysisResult, appendMockChat } = aiSlice.actions;
export const aiReducer = aiSlice.reducer;
