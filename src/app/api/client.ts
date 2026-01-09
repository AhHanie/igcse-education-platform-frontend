const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "headers" | "credentials"> {
  headers?: Record<string, string>;
  body?: unknown;
  manualErrorHandling?: boolean;

  /**
   * Defaults to "include" so HTTP-only auth cookies are sent.
   * Override per-request if needed.
   */
  credentials?: RequestCredentials;
}

export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const defaultErrorHandler = (error: ApiError) => {
  console.error("[API] Request failed", {
    message: error.message,
    status: error.status,
    payload: error.payload,
  });
};

const buildUrl = (path: string) => {
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${sanitizedPath}`;
};

const prepareBody = (body: unknown, headers: Headers) => {
  if (body === undefined || body === null) return undefined;

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob
  ) {
    return body;
  }

  if (typeof body === "string") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "text/plain");
    return body;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
};

const parseResponse = async (response: Response) => {
  // 204 No Content has no response body
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (isJson) return response.json();

  const text = await response.text();
  return text || null;
};

class ApiClient {
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      manualErrorHandling = false,
      headers: customHeaders,
      body,
      credentials = "include",
      ...rest
    } = options;

    const headers = new Headers(customHeaders);

    const preparedBody = prepareBody(body, headers);

    try {
      const response = await fetch(buildUrl(path), {
        ...rest,
        method: rest.method ?? "GET",
        headers,
        body: preparedBody,
        credentials,
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("Network error", undefined, error);

      if (!manualErrorHandling) {
        defaultErrorHandler(apiError);
      }

      throw apiError;
    }
  }

  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
