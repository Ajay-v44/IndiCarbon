import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Central Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically inject Auth tokens from localStorage if available
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("indicarbon_tokens");
      if (stored) {
        try {
          const tokens = JSON.parse(stored);
          if (tokens && tokens.access_token) {
            config.headers.Authorization = `Bearer ${tokens.access_token}`;
          }
        } catch (e) {
          console.error("Error parsing stored auth tokens", e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Globally handle auth failure or expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("Unauthorized access detected (401). Clearing session...");
        localStorage.removeItem("indicarbon_tokens");
        // We could redirect to login here if appropriate for the application routing, e.g.:
        // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  request_id?: string;
  timestamp?: string;
}

/**
 * Standard central API call wrapper used by all services and sub-processes.
 * Gracefully parses the response envelope, extracts data, and normalizes errors.
 */
export async function apiCall<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponseEnvelope<T> | T>(config);
    const body = response.data;

    // Check if the response follows the standard ApiResponse envelope
    if (body && typeof body === "object" && ("success" in body) && ("data" in body)) {
      const envelope = body as ApiResponseEnvelope<T>;
      if (!envelope.success) {
        throw new Error(envelope.message || "API request failed with error status.");
      }
      return envelope.data;
    }

    // Return raw body if it is not wrapped
    return body as T;
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * Normalizes Axios and other errors into a standard Error object.
 */
function handleApiError(error: any): never {
  let errorMessage = "An unexpected error occurred. Please try again.";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response) {
      // The server responded with a status code outside the 2xx range
      const data = axiosError.response.data;
      if (data) {
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (typeof data.error === "string") {
          errorMessage = data.error;
        } else if (data.error && typeof data.error.message === "string") {
          errorMessage = data.error.message;
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        }
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your network connection.";
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = axiosError.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  throw new Error(errorMessage);
}
