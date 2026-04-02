import type { Collection, CollectionItem, HttpRequest } from "@/types";

export function exportToOpenApi(collection: Collection): any {
  const openapi: any = {
    openapi: "3.0.0",
    info: {
      title: collection.name,
      version: "1.0.0",
    },
    paths: {},
    components: {
      securitySchemes: {},
    },
  };

  collection.items.forEach((item: CollectionItem) => {
    if (item.type !== "request" || !item.request) return;

    const req = item.request;
    const url = new URL(req.url.startsWith("http") ? req.url : `http://${req.url}`);
    const path = url.pathname || "/";
    const method = req.method.toLowerCase();

    if (!openapi.paths[path]) {
      openapi.paths[path] = {};
    }

    const operation: any = {
      summary: req.name || item.name,
      operationId: item.id,
      parameters: [],
      responses: {
        "200": {
          description: "OK",
        },
      },
    };

    // Parameters (Query)
    req.params.forEach((p) => {
      if (p.enabled) {
        operation.parameters.push({
          name: p.key,
          in: "query",
          schema: { type: "string" },
          example: p.value,
        });
      }
    });

    // Headers
    req.headers.forEach((h) => {
      if (h.enabled) {
        operation.parameters.push({
          name: h.key,
          in: "header",
          schema: { type: "string" },
          example: h.value,
        });
      }
    });

    // Body
    if (req.body && req.bodyType !== "none") {
      let contentType = "text/plain";
      if (req.bodyType === "json") contentType = "application/json";
      else if (req.bodyType === "urlencoded") contentType = "application/x-www-form-urlencoded";
      else if (req.bodyType === "multipart") contentType = "multipart/form-data";

      operation.requestBody = {
        content: {
          [contentType]: {
            example: req.bodyType === "json" ? tryParseJson(req.body) : req.body,
          },
        },
      };
    }

    // Auth
    if (req.auth.type !== "none") {
      const securityName = `${req.auth.type}Auth`;
      operation.security = [{ [securityName]: [] }];

      if (!openapi.components.securitySchemes[securityName]) {
        if (req.auth.type === "bearer") {
          openapi.components.securitySchemes[securityName] = {
            type: "http",
            scheme: "bearer",
          };
        } else if (req.auth.type === "basic") {
          openapi.components.securitySchemes[securityName] = {
            type: "http",
            scheme: "basic",
          };
        } else if (req.auth.type === "api-key") {
          openapi.components.securitySchemes[securityName] = {
            type: "apiKey",
            name: req.auth.apiKey || "X-API-Key",
            in: req.auth.apiKeyIn || "header",
          };
        }
      }
    }

    openapi.paths[path][method] = operation;
  });

  // Add server
  const firstReq = collection.items.find(i => i.request)?.request;
  if (firstReq) {
    try {
      const url = new URL(firstReq.url.startsWith("http") ? firstReq.url : `http://${firstReq.url}`);
      openapi.servers = [{ url: url.origin }];
    } catch (e) {
      // ignore
    }
  }

  return openapi;
}

function tryParseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}
