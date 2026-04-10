/**
 * Strapi API Utility Tests
 *
 * Updated to use axios apiClient instead of fetch.
 */

import {
  fetchFromStrapi,
  postToStrapi,
  verifyEmailToken,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "@/lib/strapi";
import apiClient from "@/lib/api-client";

// Mock the api-client
jest.mock("@/lib/api-client", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe("Strapi API Utilities (Axios)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchFromStrapi", () => {
    it("should fetch data successfully", async () => {
      const mockData = {
        data: [{ id: 1, attributes: { name: "Test" } }],
      };

      apiClient.get.mockResolvedValueOnce({ data: mockData });

      const result = await fetchFromStrapi("/articles");

      expect(apiClient.get).toHaveBeenCalledWith("/articles");
      expect(result).toEqual(mockData);
    });

    it("should return null on API error", async () => {
      apiClient.get.mockRejectedValueOnce({
        error: "Not Found",
        status: 404,
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await fetchFromStrapi("/nonexistent");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("postToStrapi", () => {
    it("should post data successfully", async () => {
      const mockResponse = {
        data: { id: 1, attributes: { name: "New Item" } },
      };

      apiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await postToStrapi("/articles", { name: "New Item" });

      expect(apiClient.post).toHaveBeenCalledWith("/articles", {
        data: { name: "New Item" },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should return error object on POST error", async () => {
      const mockError = { error: "Bad Request", status: 400 };
      apiClient.post.mockRejectedValueOnce(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await postToStrapi("/articles", { invalid: "data" });

      expect(result).toEqual(mockError);

      consoleSpy.mockRestore();
    });
  });

  describe("verifyEmailToken", () => {
    it("should handle successful confirmation", async () => {
      const mockResponse = { user: { id: 1 }, jwt: "token" };
      apiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await verifyEmailToken("test-token");
      expect(result).toEqual(mockResponse);
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("confirmation=test-token"),
      );
    });

    it("should handle success with empty response data", async () => {
      apiClient.get.mockResolvedValueOnce({ data: null });

      const result = await verifyEmailToken("test-token");
      expect(result).toEqual({ success: true });
    });
  });

  describe("Auth Core (Unified Paths)", () => {
    it("registerUser should use /auth/local/register path", async () => {
      const mockUser = { email: "test@test.com" };
      apiClient.post.mockResolvedValueOnce({ data: { user: {} } });

      await registerUser(mockUser);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/local/register",
        mockUser,
      );
    });

    it("loginUser should use /auth/local path", async () => {
      const credentials = { identifier: "test", password: "pwd" };
      apiClient.post.mockResolvedValueOnce({ data: { jwt: "token" } });

      await loginUser(credentials);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/local", credentials);
    });
  });

  describe("Password Recovery (Unified Paths)", () => {
    it("forgotPassword should call POST /auth/forgot-password", async () => {
      const email = "test@test.com";
      apiClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await forgotPassword(email);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email,
      });
    });

    it("resetPassword should call POST /auth/reset-password", async () => {
      const payload = {
        code: "token",
        password: "new",
        passwordConfirmation: "new",
      };
      apiClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await resetPassword(payload);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/reset-password",
        payload,
      );
    });
  });
});
