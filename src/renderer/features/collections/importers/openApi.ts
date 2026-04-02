import { v4 as uuid } from "uuid";
import { parseUrlParams, updateUrlWithParams } from "@/utils/url";
import type {
  Collection,
  CollectionItem,
  HttpMethod,
  BodyType,
  AuthConfig,
} from "@/types";

function resolveSchema(schema: any, components: any): any {
  if (!schema) return null;
  if (schema.$ref) {
    const refPath = schema.$ref.split("/");
    // Support #/components/schemas/...
    if (refPath[0] === "#" && refPath[1] === "components" && refPath[2] === "schemas") {
      const schemaName = refPath[3];
      const resolved = components?.schemas?.[schemaName];
      if (resolved) {
        return resolveSchema(resolved, components);
      }
    }
    return null;
  }

  if (schema.type === "object") {
    const obj: any = {};
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        obj[key] = resolveSchema(prop, components);
      });
    }
    return obj;
  }

  if (schema.type === "array") {
    return [resolveSchema(schema.items, components)];
  }

  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  // Primitive fallbacks
  switch (schema.type) {
    case "string":
      if (schema.format === "date-time") return new Date().toISOString();
      if (schema.format === "date") return new Date().toISOString().split("T")[0];
      if (schema.format === "uuid") return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
      return "string";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return true;
    default:
      return null;
  }
}

export function importOpenApi(data: any): Collection {
  const info = data.info || {};
  const paths = data.paths || {};
  const servers = data.servers || [];
  const baseUrl = servers[0]?.url || "";
  const components = data.components || {};

  // Auto-detect a default security scheme if root security is empty but schemes are defined
  let defaultAuth: AuthConfig = { type: "none" };
  const securitySchemes = components.securitySchemes || {};
  const schemeNames = Object.keys(securitySchemes);
  if (schemeNames.length > 0) {
    const firstScheme = securitySchemes[schemeNames[0]];
    if (firstScheme.type === "http" && firstScheme.scheme === "bearer") {
      defaultAuth = { type: "bearer" };
    } else if (firstScheme.type === "http" && firstScheme.scheme === "basic") {
      defaultAuth = { type: "basic" };
    } else if (firstScheme.type === "apiKey") {
      defaultAuth = {
        type: "api-key",
        apiKey: firstScheme.name,
        apiKeyIn: firstScheme.in,
      };
    }
  }

  const items: CollectionItem[] = [];

  Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, op]: [string, any]) => {
      const validMethods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
      ];

      if (!validMethods.includes(method.toLowerCase())) return;

      const id = uuid();
      const allParams = [
        ...(op.parameters || []),
        ...(pathItem.parameters || []),
      ];

      const headers = allParams
        .filter((p: any) => p.in === "header")
        .map((p: any) => ({
          id: uuid(),
          key: p.name,
          value: String(p.example || p.default || ""),
          enabled: true,
        }));

      const queryParams = allParams
        .filter((p: any) => p.in === "query")
        .map((p: any) => ({
          id: uuid(),
          key: p.name,
          value: String(p.example || p.default || ""),
          enabled: true,
        }));

      // Find path parameters and replace them in URL (Rune uses {{param}} style)
      let requestUrl = (baseUrl + path).replace(/\/+/g, "/").replace(":/", "://");
      const pathParams = allParams.filter((p: any) => p.in === "path");
      pathParams.forEach((p: any) => {
        requestUrl = requestUrl.replace(`{${p.name}}`, `{{${p.name}}}`);
      });

      // Handle Request Body
      let body = "";
      let bodyType: BodyType = "none";
      if (op.requestBody) {
        const content = op.requestBody.content || {};
        if (content["application/json"]) {
          bodyType = "json";
          const schema = content["application/json"].schema;
          const example = content["application/json"].example;
          if (example) {
            body = JSON.stringify(example, null, 2);
          } else if (schema) {
            body = JSON.stringify(resolveSchema(schema, components), null, 2);
          }
        } else if (content["application/x-www-form-urlencoded"]) {
          bodyType = "urlencoded";
        } else if (content["multipart/form-data"]) {
          bodyType = "multipart";
        }
      }

      // Handle Auth
      let auth: AuthConfig = { type: "none" };
      const security = op.security || data.security;
      
      if (security && security.length > 0 && Object.keys(security[0]).length > 0) {
        const secName = Object.keys(security[0])[0];
        const scheme = securitySchemes[secName];
        if (scheme) {
          if (scheme.type === "http" && scheme.scheme === "bearer") {
            auth.type = "bearer";
          } else if (scheme.type === "http" && scheme.scheme === "basic") {
            auth.type = "basic";
          } else if (scheme.type === "apiKey") {
            auth.type = "api-key";
            auth.apiKey = scheme.name;
            auth.apiKeyIn = scheme.in;
          }
        }
      } else if (defaultAuth.type !== "none") {
        // Apply auto-auth if root security is empty or not specified
        auth = { ...defaultAuth };
      }

      const finalParams = [
        ...queryParams,
        ...parseUrlParams(requestUrl)
      ];

      items.push({
        id,
        type: "request",
        name: op.summary || op.operationId || `${method.toUpperCase()} ${path}`,
        request: {
          id,
          name: op.summary || path,
          method: method.toUpperCase() as HttpMethod,
          url: updateUrlWithParams(requestUrl, finalParams),
          headers,
          params: finalParams,
          body,
          bodyType,
          auth,
        },
      });
    });
  });

  return {
    id: uuid(),
    name: info.title || "Imported OpenAPI",
    items,
    isOpen: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
