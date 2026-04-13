import { renderHook, act } from "@testing-library/react";
import { useApi } from "../../hooks/use-api";

describe("useApi", () => {
  const mockApiFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useApi(mockApiFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe("function");
  });

  it("should handle successful API call", async () => {
    const mockData = { id: 1, name: "Test Item" };
    mockApiFn.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useApi(mockApiFn));

    await act(async () => {
      await result.current.execute("arg1");
    });

    expect(mockApiFn).toHaveBeenCalledWith("arg1");
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle API call failure", async () => {
    const mockError = { error: "Something went wrong", status: 500 };
    mockApiFn.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useApi(mockApiFn));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError.error);
  });

  it("should handle immediate execution", async () => {
    const mockData = { items: [] };
    mockApiFn.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() =>
      useApi(mockApiFn, { immediate: true, args: ["initial"] }),
    );

    // Wait for the immediate execution to finish
    await act(async () => {
      // Small delay or just wait for next tick
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockApiFn).toHaveBeenCalledWith("initial");
    expect(result.current.data).toEqual(mockData);
  });
});
