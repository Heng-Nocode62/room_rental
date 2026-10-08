import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { Providers } from "./app/providers";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

import { AuthProvider } from "./features/auth/AuthProvider";
import { AppConfigProvider } from "./features/settings/context/AppConfigProvider";
import { ThemeProvider } from "./features/settings/context/ThemeProvider";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";

// @ts-expect-error The i18n module is JavaScript and has no declaration file.
import { initI18n } from "./i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";

async function bootstrap() {

  await initI18n();

  createRoot(
    document.getElementById("root")!,
  ).render(


      <QueryClientProvider
        client={queryClient}
      >
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <AuthProvider>
          <ThemeProvider>
          <AppConfigProvider>
            <Providers>
              <RouterProvider router={router} />
            </Providers>
          </AppConfigProvider>
          </ThemeProvider>
        </AuthProvider>

        </GoogleOAuthProvider>
        
      </QueryClientProvider>

  );
}

void bootstrap();