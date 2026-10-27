const API_URL = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  redirectOn401?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    init: RequestInit,
    { redirectOn401 = true }: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    // Session gone/expired on a data call → back to login.
    if (
      redirectOn401 &&
      response.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.replace("/login");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));
      throw new ApiError(error.message || "Request failed", response.status);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: "POST", body: JSON.stringify(data) },
      options,
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: "PUT", body: JSON.stringify(data) },
      options,
    );
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: "PATCH", body: JSON.stringify(data) },
      options,
    );
  }

  async delete<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: "DELETE", body: JSON.stringify(data) },
      options,
    );
  }
}

export const api = new ApiClient(API_URL);
