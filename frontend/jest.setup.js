import "@testing-library/jest-dom";

// Mock Next.js router (Pages Router)
jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      reload: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Zustand persist middleware to be a pass-through in tests
// This prevents sessionStorage side effects and async persistence leaks
jest.mock("zustand/middleware", () => {
  const original = jest.requireActual("zustand/middleware");
  return {
    ...original,
    persist: (config) => (set, get, api) => config(set, get, api),
  };
});

// Clear sessionStorage before each test
beforeEach(() => {
  if (typeof window !== "undefined" && window.sessionStorage) {
    window.sessionStorage.clear();
  }
});
