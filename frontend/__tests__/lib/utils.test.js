import { getFullFileUrl } from "../../lib/utils";

describe("getFullFileUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns null if no url is provided", () => {
    expect(getFullFileUrl(null)).toBeNull();
    expect(getFullFileUrl(undefined)).toBeNull();
    expect(getFullFileUrl("")).toBeNull();
  });

  it("returns data: urls as is", () => {
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    expect(getFullFileUrl(dataUrl)).toBe(dataUrl);
  });

  it("strips localhost:1337 origin from absolute urls", () => {
    const url = "http://localhost:1337/uploads/test.pdf";
    expect(getFullFileUrl(url)).toBe("/uploads/test.pdf");
  });

  it("strips custom NEXT_PUBLIC_BACKEND_URL origin from absolute urls", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com/api";
    const url = "https://api.example.com/uploads/document.docx";
    expect(getFullFileUrl(url)).toBe("/uploads/document.docx");
  });

  it("returns relative paths with a leading slash", () => {
    expect(getFullFileUrl("uploads/file.pdf")).toBe("/uploads/file.pdf");
    expect(getFullFileUrl("/uploads/file.pdf")).toBe("/uploads/file.pdf");
  });

  it("returns external URLs as is", () => {
    const externalUrl = "https://s3.amazonaws.com/bucket/file.png";
    expect(getFullFileUrl(externalUrl)).toBe(externalUrl);
  });
});
