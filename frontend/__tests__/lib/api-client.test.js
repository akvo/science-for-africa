jest.mock("axios", () => {
  const instance = jest.fn(() =>
    Promise.resolve({
      data: { data: ["stub-data"] },
      config: { params: {} },
    }),
  );
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  instance.defaults = { headers: { common: {} } };
  return {
    create: jest.fn(() => instance),
  };
});

import axios from "axios";
import apiClient from "../../lib/api-client";
import { useAuthStore } from "../../lib/auth-store";
jest.mock("../../lib/auth-store");

const mockInstance = axios.create();

describe("apiClient", () => {
  // We do NOT call jest.clearAllMocks() here because we need
  // the calls that happened during the static import of apiClient.

  describe("Configuration", () => {
    it("should create an axios instance with the correct baseURL", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining("/api"),
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });
  });

  describe("Request Interceptor", () => {
    it("should add Authorization header when JWT is present", () => {
      const jwt = "test-token";
      useAuthStore.getState.mockReturnValue({ jwt });

      const interceptor =
        mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = interceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${jwt}`);
    });

    it("should NOT add Authorization header when JWT is present but the URL is a public auth endpoint", () => {
      const jwt = "test-token";
      useAuthStore.getState.mockReturnValue({ jwt });

      const interceptor =
        mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { url: "/auth/local", headers: {} };
      const result = interceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Response Interceptor", () => {
    it("should pass through successful responses", async () => {
      const response = { data: { success: true } };
      const interceptor =
        mockInstance.interceptors.response.use.mock.calls[0][0];

      const result = await interceptor(response);
      expect(result).toBe(response);
    });

    it("should transform Strapi error responses into a consistent format", () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              message: "Invalid credentials",
            },
          },
        },
      };

      const errorInterceptor =
        mockInstance.interceptors.response.use.mock.calls[0][1];

      return expect(errorInterceptor(error)).rejects.toEqual({
        error: "Invalid credentials",
        status: 400,
      });
    });

    it("should handle generic error messages when Strapi format is missing", () => {
      const error = {
        response: {
          status: 500,
          statusText: "Internal Server Error",
          data: {},
        },
      };

      const errorInterceptor =
        mockInstance.interceptors.response.use.mock.calls[0][1];

      return expect(errorInterceptor(error)).rejects.toEqual({
        error: "HTTP error! status: 500",
        status: 500,
      });
    });
  });
});
