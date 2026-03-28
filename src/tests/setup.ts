import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.stubGlobal("localStorage", {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

vi.stubGlobal("window", {
  api: {
    storage: {
      read: vi.fn(async () => null),
      write: vi.fn(async () => {}),
      delete: vi.fn(async () => {}),
    },
  },
});
