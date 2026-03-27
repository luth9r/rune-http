import type { HttpMethod } from "@/types";

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "var(--eos-get)",
  POST: "var(--eos-post)",
  PUT: "var(--eos-put)",
  PATCH: "var(--eos-patch)",
  DELETE: "var(--eos-delete)",
  HEAD: "var(--eos-head)",
  OPTIONS: "var(--eos-options)",
};

export const METHOD_BG_COLORS: Record<HttpMethod, string> = {
  GET: "color-mix(in srgb, var(--eos-get) 10%, transparent)",
  POST: "color-mix(in srgb, var(--eos-post) 10%, transparent)",
  PUT: "color-mix(in srgb, var(--eos-put) 10%, transparent)",
  PATCH: "color-mix(in srgb, var(--eos-patch) 10%, transparent)",
  DELETE: "color-mix(in srgb, var(--eos-delete) 10%, transparent)",
  HEAD: "color-mix(in srgb, var(--eos-head) 10%, transparent)",
  OPTIONS: "color-mix(in srgb, var(--eos-options) 10%, transparent)",
};

export const METHOD_BORDER_COLORS: Record<HttpMethod, string> = {
  GET: "color-mix(in srgb, var(--eos-get) 30%, transparent)",
  POST: "color-mix(in srgb, var(--eos-post) 30%, transparent)",
  PUT: "color-mix(in srgb, var(--eos-put) 30%, transparent)",
  PATCH: "color-mix(in srgb, var(--eos-patch) 30%, transparent)",
  DELETE: "color-mix(in srgb, var(--eos-delete) 30%, transparent)",
  HEAD: "color-mix(in srgb, var(--eos-head) 30%, transparent)",
  OPTIONS: "color-mix(in srgb, var(--eos-options) 30%, transparent)",
};

export const getMethodColor = (m: HttpMethod) =>
  METHOD_COLORS[m] ?? "var(--eos-muted)";
export const getMethodBgColor = (m: HttpMethod) =>
  METHOD_BG_COLORS[m] ??
  "color-mix(in srgb, var(--eos-muted) 10%, transparent)";
export const getMethodBorderColor = (m: HttpMethod) =>
  METHOD_BORDER_COLORS[m] ??
  "color-mix(in srgb, var(--eos-muted) 30%, transparent)";
