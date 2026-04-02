import type { Collection, HttpRequest, KeyValuePair } from "@/types";

export function exportToOpenApi(collection: Collection): string {
  const openapi: any = {
    openapi: "3.0.0",
    info: {
      title: collection.name,
      version: "1.0.0",
      description: `Exported from Rune HTTP at ${new Date().toLocaleString()}`,
    },
    paths: {},
  };

  collection.items.forEach((item) => {
    if (item.type !== "request" || !item.request) return;

    const req = item.request;
    const { urlPath, baseUrl } = parseUrl(req.url);

    // Добавляем сервер, если он еще не указан
    if (
      baseUrl &&
      (!openapi.servers || !openapi.servers.find((s: any) => s.url === baseUrl))
    ) {
      openapi.servers = openapi.servers || [];
      openapi.servers.push({ url: baseUrl });
    }

    // Инициализируем путь в объекте paths
    if (!openapi.paths[urlPath]) {
      openapi.paths[urlPath] = {};
    }

    const method = req.method.toLowerCase();

    // Формируем операцию (запрос)
    openapi.paths[urlPath][method] = {
      summary: req.name || item.name,
      operationId: item.id.replace(/-/g, "_"),
      parameters: [
        ...mapParameters(req.params, "query"),
        ...mapParameters(req.headers, "header"),
      ],
      responses: {
        "200": { description: "OK" },
      },
    };

    // Обработка тела запроса (RequestBody)
    if (req.body && req.method !== "GET") {
      const contentType = mapBodyTypeToContentType(req.bodyType);
      openapi.paths[urlPath][method].requestBody = {
        content: {
          [contentType]: {
            example: parseBody(req.body, req.bodyType),
          },
        },
      };
    }
  });

  return JSON.stringify(openapi, null, 2);
}

// Хелпер для разделения URL на Base и Path
function parseUrl(fullUrl: string) {
  try {
    const url = new URL(
      fullUrl.startsWith("http") ? fullUrl : `http://${fullUrl}`,
    );
    return {
      baseUrl: url.origin,
      urlPath: url.pathname === "/" ? "/" : url.pathname,
    };
  } catch {
    return { baseUrl: "", urlPath: fullUrl || "/" };
  }
}

// Хелпер для параметров (query/header)
function mapParameters(list: KeyValuePair[], location: "query" | "header") {
  return list
    .filter((p) => p.enabled && p.key)
    .map((p) => ({
      name: p.key,
      in: location,
      schema: { type: "string" },
      example: p.value,
    }));
}

// Маппинг твоих типов тела в стандартные MIME-типы
function mapBodyTypeToContentType(type: string): string {
  switch (type) {
    case "json":
      return "application/json";
    case "form-data":
      return "multipart/form-data";
    case "urlencoded":
      return "application/x-www-form-urlencoded";
    case "xml":
      return "application/xml";
    default:
      return "text/plain";
  }
}

function parseBody(body: string, type: string) {
  if (type === "json") {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
}
