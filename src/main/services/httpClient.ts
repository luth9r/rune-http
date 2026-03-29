import fs from "node:fs";
import path from "node:path";
import type { HttpRequest, HttpResponse, KeyValuePair } from "@/types";
import { interpolate } from "@/utils";

function resolveKV(
  kv: KeyValuePair,
  envVars: Record<string, any>,
): { key: string; value: string } {
  return {
    key: interpolate(kv.key, envVars),
    value: interpolate(kv.value, envVars),
  };
}

function buildUrl(
  url: string,
  params: KeyValuePair[],
  envVars: Record<string, any>,
): string {
  const enabledParams = params.filter((p) => p.enabled && p.key);
  if (enabledParams.length === 0) return url;

  const searchParams = new URLSearchParams();
  enabledParams.forEach((p) => {
    const resolved = resolveKV(p, envVars);
    searchParams.append(resolved.key, resolved.value);
  });

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${searchParams.toString()}`;
}

function buildHeaders(
  headers: KeyValuePair[],
  envVars: Record<string, any>,
): Record<string, string> {
  const result: Record<string, string> = {};
  headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      const resolved = resolveKV(h, envVars);
      result[resolved.key] = resolved.value;
    });
  return result;
}

function applyAuth(
  headers: Record<string, string>,
  queryParams: URLSearchParams,
  request: HttpRequest,
  envVars: Record<string, any>,
): void {
  const { auth } = request;
  if (auth.type === "none") return;

  switch (auth.type) {
    case "bearer":
      if (auth.token) {
        headers["Authorization"] = `Bearer ${interpolate(auth.token, envVars)}`;
      }
      break;
    case "basic":
      if (auth.username && auth.password) {
        const u = interpolate(auth.username, envVars);
        const p = interpolate(auth.password, envVars);
        const encoded = Buffer.from(`${u}:${p}`).toString("base64");
        headers["Authorization"] = `Basic ${encoded}`;
      }
      break;
    case "api-key":
      if (auth.apiKey && auth.apiValue) {
        const key = interpolate(auth.apiKey, envVars);
        const val = interpolate(auth.apiValue, envVars);
        if (auth.apiKeyIn === "header") {
          headers[key] = val;
        } else {
          queryParams.append(key, val);
        }
      }
      break;
  }
}

export async function executeRequest(
  request: HttpRequest,
  envVars: Record<string, any> = {},
): Promise<HttpResponse> {
  const startTime = Date.now();

  console.log("EnvVars inside execute:", envVars);

  // 1. Prepare Headers
  const headers = buildHeaders(request.headers, envVars);

  // 2. Build URL + Query Params
  const rawUrl = interpolate(request.url, envVars);
  const urlObj = new URL(rawUrl);
  const queryParams = new URLSearchParams();

  request.params
    .filter((p) => p.enabled && p.key)
    .forEach((p) => {
      const resolved = resolveKV(p, envVars);
      urlObj.searchParams.append(resolved.key, resolved.value);
    });

  applyAuth(headers, urlObj.searchParams, request, envVars);

  const url = urlObj.toString();

  // 3. Body — только если метод позволяет и есть body
  let body: any = undefined;
  const hasBody =
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    request.bodyType !== "none";

  if (hasBody) {
    if (request.bodyType === "multipart") {
      const formData = new FormData();
      request.body
        .split("\n")
        .filter((line) => line.trim())
        .forEach((line) => {
          try {
            const kv: KeyValuePair = JSON.parse(line);
            if (kv.enabled && kv.key) {
              const resolved = resolveKV(kv, envVars);
              if (kv.type === "file" && resolved.value) {
                const resolvedPath = interpolate(resolved.value, envVars);
                if (fs.existsSync(resolvedPath)) {
                  const buffer = fs.readFileSync(resolvedPath);
                  const fileName = path.basename(resolvedPath);
                  formData.append(resolved.key, new Blob([buffer]), fileName);
                  console.log(
                    "FormData content:",
                    Array.from(formData.entries()),
                  );
                }
              } else {
                formData.append(resolved.key, resolved.value);
              }
            }
          } catch {
            const [key, value] = line.split("=");
            if (key && value) {
              const resolvedValue = interpolate(
                decodeURIComponent(value),
                envVars,
              );
              const resolvedKey = interpolate(decodeURIComponent(key), envVars);
              formData.append(resolvedKey, resolvedValue);
            }
          }
        });
      body = formData;
      delete headers["Content-Type"];
    } else if (request.bodyType === "urlencoded") {
      const formData = new URLSearchParams();
      request.body
        .split("\n")
        .filter((line) => line.trim())
        .forEach((line) => {
          try {
            const kv: KeyValuePair = JSON.parse(line);
            if (kv.enabled && kv.key) {
              const resolved = resolveKV(kv, envVars);
              formData.append(resolved.key, resolved.value);
            }
          } catch {
            const [key, value] = line.split("=");
            if (key && value) {
              const resolvedValue = interpolate(
                decodeURIComponent(value),
                envVars,
              );
              const resolvedKey = interpolate(decodeURIComponent(key), envVars);
              formData.append(resolvedKey, resolvedValue);
            }
          }
        });
      body = formData;
      headers["Content-Type"] ??= "application/x-www-form-urlencoded";
    } else if (request.bodyType === "binary") {
      const resolvedPath = interpolate(request.body, envVars);
      if (fs.existsSync(resolvedPath)) {
        body = fs.readFileSync(resolvedPath);
        const ext = path.extname(resolvedPath).toLowerCase();
        const mimes: Record<string, string> = {
          ".pdf": "application/pdf",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".zip": "application/zip",
          ".json": "application/json",
          ".xml": "application/xml",
          ".txt": "text/plain",
        };
        headers["Content-Type"] ??= mimes[ext] || "application/octet-stream";
      }
    } else {
      body = interpolate(request.body || "", envVars);
      const mimes: Record<string, string> = {
        json: "application/json",
        xml: "application/xml",
        text: "text/plain",
      };
      headers["Content-Type"] ??= mimes[request.bodyType] || "text/plain";
    }
  }

  console.log("Request:", { url, method: request.method, headers, body });

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const duration = Date.now() - startTime;
  const bodyText = await response.text();

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => (responseHeaders[k] = v));

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
