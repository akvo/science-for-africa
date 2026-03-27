/**
 * Strapi API Utility Tests
 *
 * Example tests for utility functions that interact with APIs.
 * Demonstrates mocking fetch and testing async functions.
 */

import { fetchFromStrapi, postToStrapi } from '@/lib/strapi';

// Mock global fetch
global.fetch = jest.fn();

describe('Strapi API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFromStrapi', () => {
    it('should fetch data successfully', async () => {
      const mockData = {
        data: [{ id: 1, attributes: { name: 'Test' } }],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 } },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchFromStrapi('/articles');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles')
      );
      expect(result).toEqual(mockData);
    });

    it('should return null on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({}),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await fetchFromStrapi('/nonexistent');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return null on network error', async () => {
      global.fetch.mockRejectedValueOnce(
        new Error('Network error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await fetchFromStrapi('/articles');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('postToStrapi', () => {
    it('should post data successfully', async () => {
      const mockResponse = {
        data: { id: 1, attributes: { name: 'New Item' } },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postToStrapi('/articles', { name: 'New Item' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { name: 'New Item' } }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return null on POST error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: { message: 'Bad Request' } }),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await postToStrapi('/articles', { invalid: 'data' });

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });
});
