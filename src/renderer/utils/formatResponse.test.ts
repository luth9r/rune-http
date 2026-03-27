import { describe, it, expect } from "vitest";
import {
  prettyJson,
  formatSize,
  formatDuration,
  isJson,
  getStatusColor,
} from "./formatResponse";

describe("prettyJson", () => {
  it("formats valid JSON", () => {
    expect(prettyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  it("returns original string if not valid JSON", () => {
    expect(prettyJson("plain text")).toBe("plain text");
  });
});

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(512)).toBe("512 B");
  });
  it("formats kilobytes", () => {
    expect(formatSize(2048)).toBe("2.0 KB");
  });
  it("formats megabytes", () => {
    expect(formatSize(2097152)).toBe("2.0 MB");
  });
});

describe("formatDuration", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(200)).toBe("200 ms");
  });
  it("formats seconds", () => {
    expect(formatDuration(1500)).toBe("1.50 s");
  });
});

describe("isJson", () => {
  it("returns true for valid JSON", () => {
    expect(isJson('{"key":"val"}')).toBe(true);
  });
  it("returns false for invalid JSON", () => {
    expect(isJson("not json")).toBe(false);
  });
});

describe("getStatusColor", () => {
  it("2xx → green", () => {
    expect(getStatusColor(200)).toBe("text-eos-post");
  });
  it("3xx → yellow", () => {
    expect(getStatusColor(301)).toBe("text-eos-put");
  });
  it("4xx → orange", () => {
    expect(getStatusColor(404)).toBe("text-eos-patch");
  });
  it("5xx → red", () => {
    expect(getStatusColor(500)).toBe("text-eos-delete");
  });
});
