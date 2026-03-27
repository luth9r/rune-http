import type {
  HttpRequest,
  HttpResponse,
  KeyValuePair,
} from "@/types";
import { interpolate } from "@/utils";

function buildUrl(url: string, params: KeyValuePair[]): string {
  const enabledParams = params.filter((p) => p.enabled && p.key);
  if (enabledParams.length === 0) return url;
  const searchParams = new URLSearchParams(
    enabledParams.map((p) => [p.key, p.value]),
  );
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${searchParams.toString()}`;
}

function buildHeaders(
  headers: KeyValuePair[],
  envVars: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    headers
      .filter((h) => h.enabled && h.key)
      .map((h) => [interpolate(h.key, envVars), interpolate(h.value, envVars)]),
  );
}

function applyAuth(
  headers: Record<string, string>,
  request: HttpRequest,
  envVars: Record<string, string>,
): Record<string, string> {
  const { auth } = request;

  switch (auth.type) {
    case "bearer":
      if (auth.token) {
        headers["Authorization"] = `Bearer ${interpolate(auth.token, envVars)}`;
      }
      break;
    case "basic":
      if (auth.username && auth.password) {
        const encoded = btoa(`${auth.username}:${auth.password}`);
        headers["Authorization"] = `Basic ${encoded}`;
      }
      break;
    case "api-key":
      if (auth.apiKey && auth.apiValue && auth.apiKeyIn === "header") {
        headers[auth.apiKey] = interpolate(auth.apiValue, envVars);
      }
      break;
  }

  return headers;
}

export async function executeRequest(
  request: HttpRequest,
  envVars: Record<string, string> = {},
): Promise<HttpResponse> {
  const startTime = Date.now();

  // Interpolate URL with env variables
  const rawUrl = interpolate(request.url, envVars);
  const url = buildUrl(rawUrl, request.params);

  // Build headers
  let headers = buildHeaders(request.headers, envVars);
  headers = applyAuth(headers, request, envVars);

  // Add Content-Type for JSON body
  if (request.bodyType === "json" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Build fetch options
  const hasBody =
    !["GET", "HEAD"].includes(request.method) && request.bodyType !== "none";
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    body: hasBody ? request.body || undefined : undefined,
  };

  const response = await fetch(url, fetchOptions);
  const duration = Date.now() - startTime;
  const bodyText = await response.text();

  // Parse response headers
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: bodyText,
    size: new TextEncoder().encode(bodyText).length,
    duration,
    timestamp: Date.now(),
  };
}
