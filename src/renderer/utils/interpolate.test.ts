import { describe, it, expect } from "vitest";
import { interpolate, extractVariables } from "./interpolate";

describe("interpolate", () => {
  it("replaces a variable with its value", () => {
    expect(
      interpolate("{{BASE_URL}}/users", { BASE_URL: "http://localhost:3000" }),
    ).toBe("http://localhost:3000/users");
  });

  it("leaves {{VAR}} intact if variable is not found", () => {
    expect(interpolate("{{UNKNOWN}}/test", {})).toBe("{{UNKNOWN}}/test");
  });

  it("replaces multiple variables", () => {
    expect(
      interpolate("{{HOST}}:{{PORT}}", { HOST: "localhost", PORT: "3000" }),
    ).toBe("localhost:3000");
  });

  it("returns string unchanged if no variables present", () => {
    expect(interpolate("http://localhost/api", {})).toBe(
      "http://localhost/api",
    );
  });
});

describe("extractVariables", () => {
  it("finds all variable names", () => {
    expect(extractVariables("{{HOST}}:{{PORT}}/{{PATH}}")).toEqual([
      "HOST",
      "PORT",
      "PATH",
    ]);
  });

  it("returns empty array if no variables", () => {
    expect(extractVariables("http://localhost")).toEqual([]);
  });
});
