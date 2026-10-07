import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "./tokenStorage";

const V1_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CORE_BASE_URL =
  import.meta.env.VITE_API_CORE_URL ??
  V1_BASE_URL.replace(/\/v1\/?$/, "");

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/google",
  "/auth/refresh",
  "/auth/register",
  "/auth/verify-email",
];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,

    withCredentials: true,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
  );

  attachRefreshInterceptor(client);

  return client;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;


async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${V1_BASE_URL}/auth/refresh`,
      null,
      {
        withCredentials: true,
      },
    );

    const { accessToken } = response.data;

    if (!accessToken) {
      throw new Error("No access token returned from refresh endpoint");
    }

    // Only store the access token.
    tokenStorage.setAccessToken(accessToken);

    return accessToken;
  } catch (error) {
    tokenStorage.clear();
    redirectToLogin();

    throw error;
  }
}

function attachRefreshInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest =
        error.config as
          | (InternalAxiosRequestConfig & {
              _retry?: boolean;
            })
          | undefined;

      const shouldSkip =
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthEndpoint(originalRequest.url);

      if (shouldSkip) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = refreshAccessToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        const accessToken = await refreshPromise;

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    },
  );
}


export const api = createClient(V1_BASE_URL);


export const coreApi = createClient(CORE_BASE_URL);