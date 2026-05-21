import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth-slice";
import { complianceReducer } from "./compliance-slice";
import { marketplaceReducer } from "./marketplace-slice";
import { aiReducer } from "./ai-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      compliance: complianceReducer,
      marketplace: marketplaceReducer,
      ai: aiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: true,
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
