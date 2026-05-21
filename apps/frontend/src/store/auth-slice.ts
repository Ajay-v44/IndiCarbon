import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "@/lib/api/auth";
import { AuthTokens, LoginPayload, RegisterPayload } from "@/lib/api/types";

type AuthStatus = "idle" | "loading" | "authenticated" | "error";

type AuthState = {
  tokens: AuthTokens | null;
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {
  tokens: null,
  status: "idle",
  error: null,
};

export const register = createAsyncThunk<AuthTokens, RegisterPayload, { rejectValue: string }>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const tokens = await registerUser(payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("indicarbon_tokens", JSON.stringify(tokens));
      }
      return tokens;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to create account.");
    }
  },
);

export const login = createAsyncThunk<AuthTokens, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const tokens = await loginUser(payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("indicarbon_tokens", JSON.stringify(tokens));
      }
      return tokens;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to sign in.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth(state) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("indicarbon_tokens");
        if (stored) {
          try {
            state.tokens = JSON.parse(stored);
            state.status = "authenticated";
          } catch (e) {
            state.tokens = null;
            state.status = "idle";
          }
        }
      }
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "error") {
        state.status = state.tokens ? "authenticated" : "idle";
      }
    },
    logout(state) {
      state.tokens = null;
      state.status = "idle";
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("indicarbon_tokens");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Unable to create account.";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Unable to sign in.";
      });
  },
});

export const { initializeAuth, clearAuthError, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
