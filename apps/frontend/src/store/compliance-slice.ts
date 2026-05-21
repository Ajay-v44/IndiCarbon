import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createEmissionReport,
  getEmissionSummary,
  generateBrsr,
  listFactors,
  registerDocument,
  listDocuments,
  verifyDocument,
  getSignedUrl,
  calculateScopeEmissions,
} from "@/lib/api/compliance";
import {
  BRSRReportResponse,
  CalculateScopeEmissionsRequest,
  DocumentResponse,
  DocumentUploadRequest,
  DocumentVerifyRequest,
  EmissionFactorResponse,
  EmissionReportCreate,
  EmissionReportResponse,
  EmissionSummaryResponse,
} from "@/lib/api/types";

type ComplianceState = {
  summary: EmissionSummaryResponse | null;
  factors: EmissionFactorResponse[];
  documents: DocumentResponse[];
  brsrReport: BRSRReportResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ComplianceState = {
  summary: null,
  factors: [],
  documents: [],
  brsrReport: null,
  status: "idle",
  error: null,
};

export const fetchEmissionsSummary = createAsyncThunk<
  EmissionSummaryResponse,
  { organization_id: string; period_start: string; period_end: string },
  { rejectValue: string }
>("compliance/fetchSummary", async (params, { rejectWithValue }) => {
  try {
    return await getEmissionSummary(params);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch emissions summary.");
  }
});

export const fetchEmissionFactors = createAsyncThunk<
  EmissionFactorResponse[],
  number | undefined,
  { rejectValue: string }
>("compliance/fetchFactors", async (vintageYear, { rejectWithValue }) => {
  try {
    return await listFactors(vintageYear);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch emission factors.");
  }
});

export const submitEmissionEntry = createAsyncThunk<
  EmissionReportResponse,
  EmissionReportCreate,
  { rejectValue: string }
>("compliance/submitEntry", async (payload, { rejectWithValue }) => {
  try {
    return await createEmissionReport(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to submit emission report.");
  }
});

export const fetchBRSRReport = createAsyncThunk<
  BRSRReportResponse,
  { period_start: string; period_end: string; revenue_crore?: number },
  { rejectValue: string }
>("compliance/fetchBRSR", async (params, { rejectWithValue }) => {
  try {
    return await generateBrsr(params);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to generate BRSR report.");
  }
});

export const fetchDocumentsList = createAsyncThunk<
  DocumentResponse[],
  { organization_id: string; doc_type?: string },
  { rejectValue: string }
>("compliance/fetchDocuments", async (params, { rejectWithValue }) => {
  try {
    return await listDocuments(params);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to list documents.");
  }
});

export const addDocumentReference = createAsyncThunk<
  DocumentResponse,
  DocumentUploadRequest,
  { rejectValue: string }
>("compliance/addDocument", async (payload, { rejectWithValue }) => {
  try {
    return await registerDocument(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to register document.");
  }
});

export const runComplianceCalculation = createAsyncThunk<
  { message: string },
  { revenueCrore: number; documentId: string; items: CalculateScopeEmissionsRequest[] },
  { rejectValue: string }
>("compliance/calculateScope", async ({ revenueCrore, documentId, items }, { rejectWithValue }) => {
  try {
    return await calculateScopeEmissions(revenueCrore, documentId, items);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate scope emissions.");
  }
});

export const approveDocument = createAsyncThunk<
  DocumentResponse,
  { docId: string; payload: DocumentVerifyRequest },
  { rejectValue: string }
>("compliance/approveDocument", async ({ docId, payload }, { rejectWithValue }) => {
  try {
    return await verifyDocument(docId, payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to verify document.");
  }
});

const complianceSlice = createSlice({
  name: "compliance",
  initialState,
  reducers: {
    clearComplianceError(state) {
      state.error = null;
    },
    resetComplianceStatus(state) {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchEmissionsSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEmissionsSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchEmissionsSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch summary.";
      })

      // Factors
      .addCase(fetchEmissionFactors.fulfilled, (state, action) => {
        state.factors = action.payload;
      })

      // Submitting emissions
      .addCase(submitEmissionEntry.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitEmissionEntry.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitEmissionEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to submit entry.";
      })

      // BRSR Report
      .addCase(fetchBRSRReport.fulfilled, (state, action) => {
        state.brsrReport = action.payload;
      })

      // Documents
      .addCase(fetchDocumentsList.fulfilled, (state, action) => {
        state.documents = action.payload;
      })
      .addCase(addDocumentReference.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
      })
      .addCase(approveDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      });
  },
});

export const { clearComplianceError, resetComplianceStatus } = complianceSlice.actions;
export const complianceReducer = complianceSlice.reducer;
