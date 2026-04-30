import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, type AuthTokens } from "@/lib/auth-api";

type AuthStatus = "idle" | "loading" | "authenticated" | "error";

type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  designation?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

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
      return await registerUser(payload);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to create account.");
    }
  },
);

export const login = createAsyncThunk<AuthTokens, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      return await loginUser(payload);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to sign in.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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

export const { clearAuthError, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
